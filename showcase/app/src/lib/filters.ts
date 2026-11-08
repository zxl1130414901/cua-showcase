import type { Repo } from './types';
import { scoreOf } from './relevance';

export type SortKey = 'score' | 'stars' | 'pushedAt' | 'cuaType' | 'platform' | 'name';
export type SortDir = 'asc' | 'desc';

/** 通用布尔维度：需 GPU / 需付费 API / 中文友好 */
export type FlagKey = 'needGpu' | 'needPaidApi' | 'chineseFriendly';

export interface Filters {
  q: string;
  types: string[];
  platforms: string[];
  tiers: string[];
  routes: string[];
  flags: FlagKey[];
}

export const EMPTY_FILTERS: Filters = {
  q: '',
  types: [],
  platforms: [],
  tiers: [],
  routes: [],
  flags: [],
};

/** 自然语言同义词：把「填表」「群发」这类说法映射到档案里的写法 */
const SYNONYMS: { key: string; words: string[] }[] = [
  { key: '填表', words: ['表单', '填写', '录入', '填表'] },
  { key: '表单', words: ['表单', '填写', '录入'] },
  { key: '提交', words: ['提交', '发送', '保存', '确认'] },
  { key: '下载', words: ['下载', '抓取', '导出', '采集'] },
  { key: '上传', words: ['上传', '导入', '附加'] },
  { key: '爬', words: ['爬虫', '抓取', '采集', '抓数据'] },
  { key: '登录', words: ['登录', '登陆', '账号', '会话'] },
  { key: '点击', words: ['点击', '坐标', '鼠标', '单击'] },
  { key: '手机', words: ['手机', 'android', 'ios', '移动端', 'app'] },
  { key: '移动端', words: ['移动端', 'android', 'ios', '手机'] },
  { key: '文档', words: ['文档', 'excel', 'word', 'pdf', '表格', 'ppt'] },
  { key: '表格', words: ['表格', 'excel', 'csv', 'sheets'] },
  { key: '群发', words: ['群发', '批量', '发送', '广播'] },
  { key: '客服', words: ['客服', '消息', '会话', '自动回复'] },
  { key: '截图', words: ['截图', '屏幕', '视觉', '像素'] },
  { key: '桌面', words: ['桌面', 'windows', 'macos', '客户端'] },
  { key: '浏览器', words: ['浏览器', '网页', 'web', 'chrome'] },
  { key: '发票', words: ['发票', '财务', '报销', '对账'] },
  { key: '面试', words: ['面试', '招聘', '简历'] },
  { key: '测试', words: ['测试', 'qa', '回归', '断言'] },
];

const STOPWORDS = /我想|我要|帮我|想要|需要一个?|怎么|如何|可以|能不能|能够|请/g;

/** 把自然语言拆成若干「必须命中」的片段 */
export function queryTerms(query: string): string[] {
  return query
    .toLowerCase()
    .replace(STOPWORDS, ' ')
    .split(/[\s,，。;；、:：]+|并|然后|再|以及|和/gu)
    .map((term) => term.trim())
    .filter((term) => term.length > 0);
}

function haystack(repo: Repo): string {
  return [
    repo.name,
    repo.taglineZh,
    repo.summaryZh,
    repo.whatItDoesZh,
    repo.techApproachZh,
    repo.capabilityZh ?? '',
    repo.bestForZh ?? '',
    repo.whyZh ?? '',
    repo.description,
    ...repo.topics,
    ...repo.appsZh,
    ...repo.platformsZh,
    ...repo.useCasesZh,
  ]
    .join(' ')
    .toLowerCase();
}

export function matchesQuery(repo: Repo, query: string): boolean {
  const terms = queryTerms(query);
  if (terms.length === 0) return true;
  const text = haystack(repo);
  return terms.every((term) => {
    if (text.includes(term)) return true;
    const group = SYNONYMS.find((item) => term.includes(item.key) || item.key.includes(term));
    if (!group) return false;
    return group.words.some((word) => text.includes(word));
  });
}

export function filterRepos(repos: Repo[], filters: Filters): Repo[] {
  return repos.filter((repo) => {
    if (!matchesQuery(repo, filters.q)) return false;
    if (filters.types.length > 0 && !filters.types.includes(repo.cuaType)) return false;
    if (filters.platforms.length > 0 && !repo.platforms.some((p) => filters.platforms.includes(p))) {
      return false;
    }
    if (filters.tiers.length > 0 && !(repo.tier && filters.tiers.includes(repo.tier))) {
      return false;
    }
    if (
      filters.routes.length > 0 &&
      !(repo.primaryRoute && filters.routes.includes(repo.primaryRoute))
    ) {
      return false;
    }
    if (filters.flags.length > 0 && !filters.flags.every((flag) => repo[flag] === true)) {
      return false;
    }
    return true;
  });
}

export function sortRepos(
  repos: Repo[],
  key: SortKey,
  dir: SortDir,
  now: Date = new Date(),
): Repo[] {
  const factor = dir === 'asc' ? 1 : -1;
  const copy = [...repos];
  copy.sort((a, b) => {
    let diff = 0;
    switch (key) {
      case 'stars':
        diff = a.stars - b.stars;
        break;
      case 'pushedAt':
        diff = Date.parse(a.pushedAt) - Date.parse(b.pushedAt);
        break;
      case 'cuaType':
        diff = a.cuaType.localeCompare(b.cuaType, 'zh-Hans-CN');
        break;
      case 'platform':
        diff = a.platforms.join(',').localeCompare(b.platforms.join(','), 'zh-Hans-CN');
        break;
      case 'name':
        diff = a.name.localeCompare(b.name, 'en');
        break;
      case 'score':
      default:
        diff = scoreOf(a, now) - scoreOf(b, now);
        if (diff === 0) {
          const ra = typeof a.rank === 'number' ? a.rank : Number.POSITIVE_INFINITY;
          const rb = typeof b.rank === 'number' ? b.rank : Number.POSITIVE_INFINITY;
          diff = rb - ra;
        }
        if (diff === 0) diff = a.stars - b.stars;
        break;
    }
    if (diff === 0) diff = a.name.localeCompare(b.name, 'en');
    return diff * factor;
  });
  return copy;
}

/** 组合筛选 + 排序，供页面与测试共用 */
export function queryRepos(
  repos: Repo[],
  filters: Filters,
  key: SortKey,
  dir: SortDir,
  now: Date = new Date(),
): Repo[] {
  return sortRepos(filterRepos(repos, filters), key, dir, now);
}

export function uniqueValues<T extends string>(values: T[]): T[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));
}
