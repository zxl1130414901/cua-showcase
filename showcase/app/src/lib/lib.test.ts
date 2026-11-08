import { describe, expect, it } from 'vitest';
import type { Repo } from './types';
import { rankRepos, scoreOf, scoreRepo, topRelevant } from './relevance';
import { EMPTY_FILTERS, filterRepos, queryRepos, queryTerms, sortRepos } from './filters';
import { parseHash, toHash } from './router';

const NOW = new Date('2026-11-07T00:00:00Z');

function makeRepo(overrides: Partial<Repo> = {}): Repo {
  return {
    id: '1',
    owner: 'demo',
    repo: 'demo',
    name: 'demo/demo',
    url: 'https://github.com/demo/demo',
    stars: 100,
    forks: 10,
    license: 'MIT',
    language: 'Python',
    createdAt: '2025-01-01T00:00:00Z',
    pushedAt: '2026-11-01T00:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z',
    description: '',
    topics: [],
    sizeKb: 1,
    cuaType: 'framework',
    platforms: ['Windows'],
    hasDetail: true,
    taglineZh: '',
    summaryZh: '',
    whatItDoesZh: '',
    useCasesZh: [],
    appsZh: [],
    platformsZh: [],
    techApproachZh: '',
    requirementsZh: [],
    prosZh: [],
    consZh: [],
    limitsZh: '',
    wecomRelevance: 'none',
    relevanceEstimated: false,
    wecomUseZh: '',
    maturityZh: '',
    stepsZh: [],
    successRateZh: '',
    evidence: [],
    compareTips: { vs: [], whenZh: '' },
    scores: {
      coverage: 8,
      usability: 8,
      docs: 8,
      maintenance: 8,
      performance: 8,
      stability: 8,
    },
    riskFlags: [],
    ...overrides,
  };
}

/** 通用维度的三张牌：需 GPU / 付费 API / 中文友好 */
const flags = (overrides: Partial<Repo> = {}): Repo =>
  makeRepo({ needGpu: false, needPaidApi: false, chineseFriendly: false, ...overrides });

describe('综合分（0–100）', () => {
  it('外部 score 优先于本地兜底分', () => {
    const repo = makeRepo({ score: 88.4 });
    expect(scoreOf(repo, NOW)).toBe(88.4);
  });

  it('无外部 score 时按 35/25/15/15/10 加权', () => {
    const result = scoreRepo(makeRepo(), NOW);
    expect(result.breakdown.coverage).toBe(28);
    expect(result.breakdown.usability).toBe(20);
    expect(result.breakdown.docs).toBe(12);
    expect(result.breakdown.maintenance).toBe(12);
    expect(result.breakdown.stability).toBe(8);
    expect(result.score).toBe(80);
  });

  it('风险旗标会扣分', () => {
    const clean = scoreRepo(makeRepo(), NOW);
    const risky = scoreRepo(makeRepo({ riskFlags: ['协议逆向', 'hook', '破解'] }), NOW);
    expect(risky.breakdown.riskPenalty).toBe(10);
    expect(risky.score).toBeLessThan(clean.score);
  });

  it('档案缺失时给出估算理由', () => {
    const result = scoreRepo(makeRepo({ hasDetail: false }), NOW);
    expect(result.estimated).toBe(true);
    expect(result.reason).toContain('档案整理中');
  });

  it('推荐理由优先取 whyZh', () => {
    const repo = makeRepo({ whyZh: '浏览器自动化里生态最完整。', capabilityZh: '不该被用到' });
    expect(scoreRepo(repo, NOW).reason).toBe('浏览器自动化里生态最完整。');
  });

  it('总分被限制在 0–100', () => {
    const perfect = scoreRepo(
      makeRepo({
        scores: {
          coverage: 10,
          usability: 10,
          docs: 10,
          maintenance: 10,
          performance: 10,
          stability: 10,
        },
      }),
      NOW,
    );
    const worst = scoreRepo(
      makeRepo({
        riskFlags: ['协议逆向'],
        pushedAt: '2015-01-01T00:00:00Z',
        scores: {
          coverage: 0,
          usability: 0,
          docs: 0,
          maintenance: 0,
          performance: 0,
          stability: 0,
        },
      }),
      NOW,
    );
    expect(perfect.score).toBeLessThanOrEqual(100);
    expect(worst.score).toBeGreaterThanOrEqual(0);
  });
});

describe('排名', () => {
  it('按 rank 升序，缺 rank 的排在后面', () => {
    const a = makeRepo({ id: 'a', name: 'a/a', score: 40 });
    const b = makeRepo({ id: 'b', name: 'b/b', score: 95 });
    const c = makeRepo({ id: 'c', name: 'c/c', rank: 1, score: 90 });
    const ranked = rankRepos([a, b, c], NOW);
    expect(ranked.map((item) => item.repo.id)).toEqual(['c', 'b', 'a']);
    expect(ranked.map((item) => item.rank)).toEqual([1, 2, 3]);
    expect(topRelevant([a, b, c], 2, NOW)).toHaveLength(2);
  });

  it('外部 rank 决定名次，不被星标覆盖', () => {
    const low = makeRepo({ id: 'low', name: 'l/l', rank: 9, score: 20, stars: 99999 });
    const high = makeRepo({ id: 'high', name: 'h/h', rank: 1, score: 90, stars: 1 });
    expect(rankRepos([low, high], NOW).map((item) => item.repo.id)).toEqual(['high', 'low']);
    expect(sortRepos([low, high], 'score', 'desc', NOW).map((repo) => repo.id)).toEqual([
      'high',
      'low',
    ]);
  });
});

describe('筛选、排序与自然语言搜索', () => {
  const repos = [
    flags({
      id: 'web',
      name: 'browser-use/browser-use',
      capabilityZh: '用自然语言驱动浏览器，能自动填表并提交网页表单。',
      bestForZh: '网页流程自动化',
      cuaType: 'framework',
      platforms: ['Web'],
      tier: '推荐',
      primaryRoute: '浏览器自动化',
      score: 92,
      stars: 5000,
    }),
    flags({
      id: 'desk',
      name: 'desktop-rpa/desktop-rpa',
      capabilityZh: '在 Windows 桌面上按坐标点击客户端按钮。',
      bestForZh: '桌面软件批处理',
      cuaType: 'rpa-tool',
      platforms: ['Windows'],
      tier: '可用',
      primaryRoute: '屏幕视觉 + 坐标点击',
      score: 70,
      stars: 500,
      needGpu: true,
    }),
    flags({
      id: 'phone',
      name: 'mobile-agent/mobile-agent',
      capabilityZh: '控制 Android 手机 App，支持中文界面。',
      bestForZh: '手机 App 自动化',
      cuaType: 'agent',
      platforms: ['Android'],
      tier: '勿用',
      primaryRoute: '官方 API/SDK',
      score: 30,
      stars: 50,
      chineseFriendly: true,
    }),
  ];

  it('自然语言去掉口语词后按连接词拆分', () => {
    expect(queryTerms('我想自动填表并提交')).toEqual(['自动填表', '提交']);
  });

  it('「我想自动填表并提交」能命中浏览器表单类项目', () => {
    const hit = filterRepos(repos, { ...EMPTY_FILTERS, q: '我想自动填表并提交' });
    expect(hit.map((repo) => repo.id)).toEqual(['web']);
  });

  it('同义词把手机映射到 Android', () => {
    const hit = filterRepos(repos, { ...EMPTY_FILTERS, q: '手机' });
    expect(hit.map((repo) => repo.id)).toEqual(['phone']);
  });

  it('档位筛选缺档不匹配', () => {
    const hit = filterRepos(repos, { ...EMPTY_FILTERS, tiers: ['勿用'] });
    expect(hit.map((repo) => repo.id)).toEqual(['phone']);
  });

  it('技术路线筛选', () => {
    const hit = filterRepos(repos, { ...EMPTY_FILTERS, routes: ['浏览器自动化'] });
    expect(hit.map((repo) => repo.id)).toEqual(['web']);
  });

  it('通用维度是「且」关系', () => {
    expect(filterRepos(repos, { ...EMPTY_FILTERS, flags: ['needGpu'] }).map((r) => r.id)).toEqual([
      'desk',
    ]);
    expect(
      filterRepos(repos, { ...EMPTY_FILTERS, flags: ['chineseFriendly', 'needGpu'] }),
    ).toHaveLength(0);
  });

  it('默认按综合分降序，方向可翻转', () => {
    expect(sortRepos(repos, 'score', 'desc', NOW).map((repo) => repo.id)).toEqual([
      'web',
      'desk',
      'phone',
    ]);
    expect(sortRepos(repos, 'score', 'asc', NOW).map((repo) => repo.id)).toEqual([
      'phone',
      'desk',
      'web',
    ]);
  });

  it('组合查询同时应用筛选与排序', () => {
    const result = queryRepos(
      repos,
      { ...EMPTY_FILTERS, platforms: ['Windows', 'Web'] },
      'score',
      'desc',
      NOW,
    );
    expect(result.map((repo) => repo.id)).toEqual(['web', 'desk']);
  });
});

describe('哈希路由', () => {
  it('解析首页与各页面', () => {
    expect(parseHash('')).toEqual({ name: 'home' });
    expect(parseHash('#/')).toEqual({ name: 'home' });
    expect(parseHash('#/all')).toEqual({ name: 'all', query: {} });
    expect(parseHash('#/routes')).toEqual({ name: 'routes' });
    expect(parseHash('#/method')).toEqual({ name: 'method' });
  });

  it('旧的 #/wecom 重定向到技术路线页', () => {
    expect(parseHash('#/wecom')).toEqual({ name: 'routes', legacy: true });
  });

  it('解析带筛选参数的清单页', () => {
    expect(parseHash('#/all?route=%E6%B5%8F%E8%A7%88%E5%99%A8%E8%87%AA%E5%8A%A8%E5%8C%96')).toEqual({
      name: 'all',
      query: { route: '浏览器自动化' },
    });
    expect(parseHash('#/all?q=%E5%A1%AB%E8%A1%A8&tier=%E6%8E%A8%E8%8D%90')).toEqual({
      name: 'all',
      query: { q: '填表', tier: '推荐' },
    });
  });

  it('解析详情页并解码中文 id', () => {
    expect(parseHash('#/repo/123')).toEqual({ name: 'repo', id: '123' });
    expect(parseHash('#/repo/a%20b')).toEqual({ name: 'repo', id: 'a b' });
  });

  it('解析对比页两种写法，并限制 4 个', () => {
    expect(parseHash('#/compare?ids=a,b,c')).toEqual({ name: 'compare', ids: ['a', 'b', 'c'] });
    expect(parseHash('#/compare/a,b')).toEqual({ name: 'compare', ids: ['a', 'b'] });
    expect(parseHash('#/compare?ids=1,2,3,4,5')).toEqual({
      name: 'compare',
      ids: ['1', '2', '3', '4'],
    });
  });

  it('未知路径返回 notfound', () => {
    expect(parseHash('#/nope')).toEqual({ name: 'notfound', path: 'nope' });
  });

  it('toHash 与 parseHash 可往返', () => {
    const routes = [
      { name: 'home' as const },
      { name: 'all' as const, query: { q: '自动填表', route: '浏览器自动化' } },
      { name: 'repo' as const, id: '42' },
      { name: 'compare' as const, ids: ['1', '2'] },
      { name: 'routes' as const },
      { name: 'method' as const },
    ];
    for (const route of routes) {
      expect(parseHash(toHash(route))).toEqual(route);
    }
  });
});
