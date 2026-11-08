#!/usr/bin/env node
/**
 * 数据合并脚本：
 * 1) 以 manifest.json 的 140 条为主键；
 * 2) 关联 data/details/<id>.json（可能不存在，也可能正在被其它会话写入）；
 * 3) 读取 data/cua_rank.json（通用 CUA 排名；缺失时降级本地算法）；
 * 4) 解析 _reports 下的通用报告（技术路线、档位、决策树）与旧企微报告（仅作案例）；
 * 5) 输出 src/data/generated.json。
 *
 * 只读上游数据，不修改 manifest / details / _reports。
 */
import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_DIR = resolve(__dirname, '..');
const SHOWCASE_DIR = resolve(APP_DIR, '..');
const ROOT = resolve(SHOWCASE_DIR, '..');
const DATA_DIR = join(SHOWCASE_DIR, 'data');
const DETAIL_DIR = join(DATA_DIR, 'details');
const REPORT_DIR = join(ROOT, '_reports');
const OUT_FILE = join(APP_DIR, 'src', 'data', 'generated.json');

const log = (msg, ms) => {
  const t = ms === undefined ? '' : `（${ms.toFixed(0)} ms）`;
  console.log(`[数据构建] ${msg}${t}`);
};

const started = Date.now();
log('开始');

/* ------------------------------ 基础工具 ------------------------------ */

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function asArray(value) {
  if (Array.isArray(value)) return value.filter((v) => v !== null && v !== undefined);
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
}

function asString(value, fallback = '') {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number') return String(value);
  return fallback;
}

/** 把 0-100 或 0-10 的分数统一到 0-10 */
function normalizeScore10(value) {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  if (n > 10) return Math.min(10, n / 10);
  return Math.min(10, n);
}

/* ------------------------------ manifest ------------------------------ */

const manifestPath = join(ROOT, 'manifest.json');
const manifest = readJson(manifestPath);
if (!Array.isArray(manifest) || manifest.length === 0) {
  throw new Error('manifest.json 不是非空数组，无法构建');
}
const tManifest = Date.now() - started;
log(`读取 manifest：${manifest.length} 条`, tManifest);

/* ------------------------------ details ------------------------------ */

const details = new Map();
let detailFiles = 0;
let detailParsed = 0;
let brokenDetailFiles = 0;
const t0Details = Date.now();
if (existsSync(DETAIL_DIR)) {
  for (const file of readdirSync(DETAIL_DIR)) {
    if (!file.toLowerCase().endsWith('.json')) continue;
    detailFiles += 1;
    try {
      const raw = readJson(join(DETAIL_DIR, file));
      const id = asString(raw.id) || file.replace(/\.json$/i, '');
      details.set(id, raw);
      const repoKey = `${asString(raw.owner)}__${asString(raw.repo)}`;
      if (asString(raw.owner) && asString(raw.repo)) details.set(repoKey, raw);
      details.set(`file:${file.replace(/\.json$/i, '')}`, raw);
      detailParsed += 1;
    } catch (error) {
      brokenDetailFiles += 1;
      console.warn(`[数据构建] 跳过无法解析的档案 ${file}：${error.message}`);
    }
  }
}
log(
  `读取详情档案：解析成功 ${detailParsed} 份 / 目录内 ${detailFiles} 个文件` +
    (brokenDetailFiles ? `，损坏 ${brokenDetailFiles} 个` : ''),
  Date.now() - t0Details,
);

/* ------------------------------ 关键词推断 ------------------------------ */

const DIRECT_KEYWORDS = [
  '企业微信', '企微', 'wecom', 'work wechat', 'work-wechat', 'workwechat',
  'qywx', 'workwx', 'corpwechat', 'wechat work', '客户群', '外部联系人',
  '客户联系', 'mochat', 'qyapi', '群机器人',
];
const PARTIAL_KEYWORDS = [
  '微信', 'wechat', 'wxauto', 'wechaty', 'pywechat', '群发', '消息自动化',
  'autoreply', 'auto-reply', '客服', 'chatbot', '机器人',
];
const RISK_KEYWORDS = [
  'hook', '注入', '破解', '多开', '外挂', 'inject', 'xposed', 'frida',
  'protocol hack', '逆向', '内存', 'dll', 'patch',
];

function inferRelevance(repo) {
  const text = [
    repo.owner,
    repo.repo,
    repo.description,
    ...(repo.topics || []),
  ]
    .join(' ')
    .toLowerCase();
  if (DIRECT_KEYWORDS.some((k) => text.includes(k.toLowerCase()))) return 'direct';
  if (PARTIAL_KEYWORDS.some((k) => text.includes(k.toLowerCase()))) return 'partial';
  return 'none';
}

/* ------------------------------ 合并 ------------------------------ */

const repos = manifest.map((item) => {
  const id = asString(item.id);
  const detail =
    details.get(id) ||
    details.get(`${asString(item.owner)}__${asString(item.repo)}`) ||
    details.get(`file:${asString(item.owner)}__${asString(item.repo)}`);
  const base = {
    id,
    owner: asString(item.owner),
    repo: asString(item.repo),
    name: `${asString(item.owner)}/${asString(item.repo)}`,
    url: asString(item.url),
    stars: Number(item.stars) || 0,
    forks: Number(item.forks) || 0,
    license: asString(item.license),
    language: asString(item.language),
    createdAt: asString(item.created_at),
    pushedAt: asString(item.pushed_at),
    updatedAt: asString(item.updated_at),
    description: asString(item.description),
    topics: asArray(item.topics).map((t) => asString(t)),
    sizeKb: Number(item.size_kb) || 0,
    cuaType: asString(item.cuaType, 'other'),
    platforms: asArray(item.platforms).map((p) => asString(p)),
  };

  if (!detail) {
    const guessed = inferRelevance(base);
    const text = `${base.name} ${base.description} ${base.topics.join(' ')}`.toLowerCase();
    return {
      ...base,
      hasDetail: false,
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
      wecomRelevance: guessed,
      relevanceEstimated: true,
      wecomUseZh: '',
      maturityZh: '',
      stepsZh: [],
      successRateZh: '',
      evidence: [],
      compareTips: { vs: [], whenZh: '' },
      scores: {
        coverage: null,
        usability: null,
        docs: null,
        maintenance: null,
        performance: null,
        stability: null,
      },
      riskFlags: RISK_KEYWORDS.filter((k) => text.includes(k)),
    };
  }

  const scoresRaw = detail.scores && typeof detail.scores === 'object' ? detail.scores : {};
  return {
    ...base,
    hasDetail: true,
    taglineZh: asString(detail.taglineZh),
    summaryZh: asString(detail.summaryZh),
    whatItDoesZh: asString(detail.whatItDoesZh),
    useCasesZh: asArray(detail.useCasesZh).map((v) => asString(v)).filter(Boolean),
    appsZh: asArray(detail.appsZh).map((v) => asString(v)).filter(Boolean),
    platformsZh: asArray(detail.platformsZh).map((v) => asString(v)).filter(Boolean),
    techApproachZh: asString(detail.techApproachZh),
    requirementsZh: asArray(detail.requirementsZh).map((v) => asString(v)).filter(Boolean),
    prosZh: asArray(detail.prosZh).map((v) => asString(v)).filter(Boolean),
    consZh: asArray(detail.consZh).map((v) => asString(v)).filter(Boolean),
    limitsZh: asString(detail.limitsZh),
    wecomRelevance: ['direct', 'partial', 'none'].includes(detail.wecomRelevance)
      ? detail.wecomRelevance
      : inferRelevance(base),
    relevanceEstimated: !['direct', 'partial', 'none'].includes(detail.wecomRelevance),
    wecomUseZh: asString(detail.wecomUseZh),
    maturityZh: asString(detail.maturityZh),
    stepsZh: asArray(detail.stepsZh).map((v) => asString(v)).filter(Boolean),
    successRateZh: asString(detail.successRateZh),
    evidence: asArray(detail.evidence)
      .filter((e) => e && typeof e === 'object')
      .map((e) => ({
        claim: asString(e.claim),
        source: asString(e.source),
        quote: asString(e.quote),
      })),
    compareTips:
      detail.compareTips && typeof detail.compareTips === 'object'
        ? {
            vs: asArray(detail.compareTips.vs).map((v) => asString(v)).filter(Boolean),
            whenZh: asString(detail.compareTips.whenZh),
          }
        : { vs: [], whenZh: '' },
    scores: {
      coverage: normalizeScore10(scoresRaw.coverage),
      usability: normalizeScore10(scoresRaw.usability),
      docs: normalizeScore10(scoresRaw.docs),
      maintenance: normalizeScore10(scoresRaw.maintenance),
      performance: normalizeScore10(scoresRaw.performance),
      stability: normalizeScore10(scoresRaw.stability),
    },
    riskFlags: RISK_KEYWORDS.filter(
      (k) =>
        `${base.name} ${base.description} ${base.topics.join(' ')} ${detail.techApproachZh || ''}`
          .toLowerCase()
          .includes(k),
    ),
  };
});

const tMerge = Date.now() - started;
log(`合并完成：${repos.filter((r) => r.hasDetail).length} 条有档案，${repos.filter((r) => !r.hasDetail).length} 条待整理`, tMerge);

/* ------------------------------ cua_rank.json ------------------------------ */

function normalizeRank(raw) {
  const map = new Map();
  const add = (entry) => {
    if (!entry || typeof entry !== 'object') return;
    const id = asString(entry.id ?? entry.repoId ?? entry.repo_id);
    if (!id) return;
    const rank = Number(entry.rank ?? entry.ranking ?? 0) || null;
    const score = Number(entry.score ?? entry.fit ?? NaN);
    const subScores =
      entry.subScores && typeof entry.subScores === 'object'
        ? {
            coverage: Number(entry.subScores.coverage) || 0,
            usability: Number(entry.subScores.usability) || 0,
            docs: Number(entry.subScores.docs) || 0,
            maintenance: Number(entry.subScores.maintenance) || 0,
            stability: Number(entry.subScores.stability) || 0,
            breadth: Number(entry.subScores.breadth) || 0,
            riskPenalty: Number(entry.subScores.riskPenalty) || 0,
          }
        : null;
    const value = {
      rank,
      score: Number.isFinite(score) ? score : null,
      tier: asString(entry.tier),
      primaryRoute: asString(entry.primaryRoute ?? entry.route),
      capabilityZh: asString(entry.capabilityZh),
      bestForZh: asString(entry.bestForZh),
      whyZh: asString(entry.whyZh ?? entry.why),
      riskZh: asString(entry.riskZh),
      subScores,
    };
    map.set(id, value);
    if (id.includes('__')) map.set(id.replace('__', '/'), value);
  };

  if (Array.isArray(raw)) {
    raw.forEach(add);
  } else if (raw && typeof raw === 'object') {
    const list = raw.items || raw.list || raw.rank || raw.ranking || raw.repos;
    if (Array.isArray(list)) list.forEach(add);
    else if (Array.isArray(raw.ranks)) raw.ranks.forEach(add);
    else {
      for (const [id, value] of Object.entries(raw)) {
        if (typeof value === 'number') map.set(id, { rank: null, score: value });
        else add({ id, ...(value && typeof value === 'object' ? value : {}) });
      }
    }
  }
  return map;
}

const GPU_RE = /gpu|cuda|显存|vram|nvidia/i;
const PAID_RE = /api[ -]?key|计费|付费|订阅|按量|openai|anthropic|claude|gemini|azure/i;
const ZH_RE = /中文|简体|汉化/i;

function deriveFlags(repo) {
  const text = [
    repo.name,
    repo.description,
    repo.summaryZh,
    repo.whatItDoesZh,
    repo.techApproachZh,
    repo.capabilityZh,
    repo.bestForZh,
    ...(repo.requirementsZh || []),
    ...(repo.appsZh || []),
  ].join(' ');
  return {
    needGpu: GPU_RE.test(text),
    needPaidApi: PAID_RE.test(text),
    chineseFriendly: ZH_RE.test(text),
  };
}

let rankCount = 0;
let rankedTierCount = 0;
let rankMeta = { generatedAt: '', scoring: '' };
const rankFile = join(DATA_DIR, 'cua_rank.json');
if (existsSync(rankFile)) {
  try {
    const rawRank = readJson(rankFile);
    if (rawRank && typeof rawRank === 'object' && !Array.isArray(rawRank)) {
      rankMeta = {
        generatedAt: asString(rawRank.generatedFor),
        scoring: asString(rawRank.scoring),
      };
    }
    const ranking = normalizeRank(rawRank);
    for (const repo of repos) {
      const entry = ranking.get(repo.id);
      if (!entry) continue;
      repo.rank = entry.rank;
      repo.score = entry.score;
      repo.tier = entry.tier || null;
      repo.primaryRoute = entry.primaryRoute || null;
      repo.route = repo.primaryRoute;
      repo.capabilityZh = entry.capabilityZh;
      repo.bestForZh = entry.bestForZh;
      repo.whyZh = entry.whyZh;
      repo.riskZh = entry.riskZh;
      repo.subScores = entry.subScores;
      rankCount += 1;
      if (entry.tier) rankedTierCount += 1;
    }
    const tierCount = repos.reduce((acc, repo) => {
      if (!repo.tier) return acc;
      acc[repo.tier] = (acc[repo.tier] || 0) + 1;
      return acc;
    }, {});
    log(
      `读取 cua_rank.json：匹配 ${rankCount} / ${repos.length} 条；` +
        `tier ${tierCount['推荐'] || 0} 推荐 / ${tierCount['可用'] || 0} 可用 / ${tierCount['谨慎'] || 0} 谨慎 / ${tierCount['勿用'] || 0} 勿用`,
    );
  } catch (error) {
    console.warn(`[数据构建] cua_rank.json 解析失败，回退本地算法：${error.message}`);
  }
} else {
  log('未发现 cua_rank.json，使用本地算法兜底');
}

for (const repo of repos) {
  Object.assign(repo, deriveFlags(repo));
}

/* ------------------------------ 研究报告解析 ------------------------------ */

function readReport(name) {
  const path = join(REPORT_DIR, name);
  if (!existsSync(path)) {
    console.warn(`[数据构建] 缺少研究报告 ${name}`);
    return '';
  }
  return readFileSync(path, 'utf8');
}

/** 取某个标题之后、下一个同级或更高级标题之前的文本 */
function section(text, heading) {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === heading);
  if (start < 0) return '';
  const level = (heading.match(/^#+/) || ['##'])[0].length;
  const out = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i];
    const m = line.match(/^(#+)\s/);
    if (m && m[1].length <= level) break;
    out.push(line);
  }
  return out.join('\n');
}

function splitRow(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

function parseTable(text) {
  const rows = [];
  let header = null;
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|')) {
      if (header && rows.length) break;
      continue;
    }
    const cells = splitRow(trimmed);
    if (!header) {
      if (cells.every((c) => /^:?-{2,}:?$/.test(c))) continue;
      header = cells;
      continue;
    }
    if (cells.every((c) => /^:?-{2,}:?$/.test(c))) continue;
    const obj = {};
    header.forEach((key, index) => {
      obj[key] = cells[index] ?? '';
    });
    rows.push(obj);
  }
  return { header, rows };
}

function stripMarkdown(text) {
  return text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .trim();
}

function parseLinks(text) {
  const links = [];
  const regex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  let match = regex.exec(text);
  while (match) {
    links.push({ title: match[1].trim(), url: match[2].trim() });
    match = regex.exec(text);
  }
  return links;
}

const tStartReports = Date.now();
const research = readReport('wecom_research.md');
const rankReport = readReport('wecom_solution_rank.md');

const solutionsParsed = parseTable(section(rankReport, '## 一、结论速览')).rows;
const solutions = solutionsParsed.map((row) => ({
  rank: Number(stripMarkdown(row['排名'] || '')) || 0,
  name: stripMarkdown(row['方案'] || ''),
  positioning: stripMarkdown(row['一句话定位'] || ''),
  stability: stripMarkdown(row['稳定性'] || ''),
  compliance: stripMarkdown(row['合规风险'] || ''),
  devEffort: stripMarkdown(row['开发量'] || ''),
  cost: stripMarkdown(row['预计投入'] || ''),
  suitableFor: stripMarkdown(row['适合谁'] || ''),
}));

const capabilityParsed = parseTable(section(research, '## 二、官方 API 能力矩阵')).rows;
const capabilities = capabilityParsed.map((row) => {
  const evidenceRaw = row['证据'] || '';
  return {
    ability: stripMarkdown(row['能力'] || ''),
    possible: stripMarkdown(row['能否做'] || ''),
    boundary: stripMarkdown(row['真实边界'] || ''),
    gate: stripMarkdown(row['门槛'] || ''),
    evidence: stripMarkdown(evidenceRaw),
    links: parseLinks(evidenceRaw),
  };
});

const riskParsed = parseTable(section(research, '### 5.3 风险分档')).rows;
const riskTiers = riskParsed.map((row) => ({
  tier: stripMarkdown(row['档位'] || ''),
  approach: stripMarkdown(row['做法'] || ''),
  note: stripMarkdown(row['说明'] || ''),
}));

const scenarioParsed = parseTable(section(rankReport, '## 八、按场景选方案')).rows;
const scenarios = scenarioParsed.map((row) => ({
  scenario: stripMarkdown(row['你的场景'] || ''),
  first: stripMarkdown(row['首选'] || ''),
  second: stripMarkdown(row['次选'] || ''),
  avoid: stripMarkdown(row['不要用'] || ''),
}));

const keyNumbers = section(research, '### 4. 给非技术读者的关键数字')
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => /^[-*]\s+/.test(line))
  .map((line) => stripMarkdown(line.replace(/^[-*]\s+/, '')));

const factSection = section(research, '### 2. 三句话版');
const factSentences = factSection
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => /^\d+\.\s+/.test(line))
  .map((line) => stripMarkdown(line.replace(/^\d+\.\s+/, '')));

const FACT_SOURCES = [
  { title: '创建企业群发 · 官方开发文档', url: 'https://developer.work.weixin.qq.com/document/path/92135' },
  { title: '企业微信用户外挂自查指南 · 官方', url: 'https://open.work.weixin.qq.com/help2/pc/21209' },
  { title: '违规场景及处罚规则 · 官方', url: 'https://open.work.weixin.qq.com/help2/pc/14664' },
];

const FALLBACK_FACTS = [
  '官方没有「直接发消息」的接口：群发接口只创建任务，必须由成员在客户端点确认后才会真正发出。',
  '官方把「自动批量群发、定时发消息」明确列为外挂：没有人工确认过程的群发，一定是外挂。',
  '外挂的处罚是永久封禁：涉及外挂相关行为，永久封禁违规成员账号，严重时封企业和管理员账号。',
];

const facts = [0, 1, 2].map((index) => ({
  text: factSentences[index] || FALLBACK_FACTS[index] || '',
  source: FACT_SOURCES[index],
}));

const actionSteps = [
  {
    title: '申请客户联系权限',
    desc: '让管理员确认企业已认证、开通「客户联系」并把你加入使用范围；这是所有官方能力的前提。',
  },
  {
    title: '用 API 建群发任务',
    desc: '后台按标签选客户或群、选模板，调用官方接口生成群发任务（注意：建任务不等于发消息）。',
  },
  {
    title: '客户端一键确认',
    desc: '任务会推到你的企业微信里，你本人点确认后才真正发出；这是官方刻意保留的风控闸门。',
  },
  {
    title: '结果回收与留痕',
    desc: '用 msgid 回收成功/失败名单，导出记录交给公司合规，形成保险销售可回溯凭证。',
  },
];

const allLinks = [...parseLinks(research), ...parseLinks(rankReport)];
const seen = new Set();
const sources = allLinks.filter((link) => {
  if (seen.has(link.url)) return false;
  seen.add(link.url);
  return true;
});
const classifySource = (url) => {
  if (/gov\.cn|npc\.gov\.cn/.test(url)) return '法规';
  if (/work\.weixin\.qq\.com|qiyeweixin\.apifox\.cn/.test(url)) return '企业微信官方';
  return '社区 / 媒体（非官方）';
};

log(
  `解析研究报告：方案 ${solutions.length} 条、能力 ${capabilities.length} 行、风险分档 ${riskTiers.length} 档、场景 ${scenarios.length} 条、来源 ${sources.length} 条`,
  Date.now() - tStartReports,
);

/* ------------------------------ 通用报告：路线与决策树 ------------------------------ */

const tStartCua = Date.now();
const summaryText = readReport('summary_report.md');

const ROUTE_DETAIL = {
  '官方 API/SDK': {
    development: '中：按接口文档开发，主要成本在申请权限与处理返回',
    stability: '高：官方不改协议就不受影响',
    risk: '低：只能做官方开放的能力，越权做不到',
    audience: '目标软件有官方接口，要求合规、可审计',
  },
  无障碍树: {
    development: '中：要学控件树与选择器，平台之间不通用',
    stability: '中高：界面小改通常还能定位，大改版会失效',
    risk: '低：只读系统控件，不碰协议',
    audience: 'Windows / macOS / Linux 桌面软件，需要稳定定位按钮',
  },
  '屏幕视觉+坐标点击': {
    development: '中高：要接模型、调提示词、做坐标校准',
    stability: '中低：缩放、主题、动画、弹窗都会让点击偏移',
    risk: '中：容易点错高危按钮，必须加确认与回滚',
    audience: '没有官方接口、界面自绘或跨平台，愿意接受点偏',
  },
  浏览器自动化: {
    development: '低：装好即用，调试与复现都方便',
    stability: '高：网页结构稳定时最可靠',
    risk: '低：只在浏览器内操作，但验证码会中断',
    audience: '任务都在网页后台，追求最快落地',
  },
  'RPA/工作流': {
    development: '低：录制加拖拽，非程序员也能维护',
    stability: '中：界面一改就要改脚本',
    risk: '低：按固定步骤回放，责任边界清楚',
    audience: '步骤固定、每天重复、需要非程序员维护',
  },
};

function routeStats(name) {
  const items = repos
    .filter((repo) => repo.primaryRoute === name)
    .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));
  const scored = items.filter((repo) => typeof repo.score === 'number');
  return {
    count: items.length,
    avgScore:
      scored.length > 0
        ? Math.round((scored.reduce((sum, repo) => sum + repo.score, 0) / scored.length) * 10) / 10
        : 0,
    top: items.slice(0, 3).map((repo) => ({ id: repo.id, name: repo.name, rank: repo.rank })),
  };
}

const routeRows = parseTable(section(summaryText, '## 二、五条技术路线的原理与代价')).rows;
const routes = routeRows.map((row) => {
  const name = stripMarkdown(row['路线'] || '');
  const stats = routeStats(name);
  const detail = ROUTE_DETAIL[name] || {
    development: '未评估',
    stability: '未评估',
    risk: '未评估',
    audience: '',
  };
  return {
    name,
    principle: stripMarkdown(row['白话原理'] || ''),
    advantage: stripMarkdown(row['最大优点'] || ''),
    cost: stripMarkdown(row['最大代价'] || ''),
    examples: stripMarkdown(row['代表项目'] || ''),
    ...detail,
    ...stats,
  };
});

const EXTRA_ROUTES = ['Agent 框架', '协议/注入（高危）', '其他'];
const extraRoutes = EXTRA_ROUTES.map((name) => ({
  name,
  note:
    name === 'Agent 框架'
      ? '负责拆任务、排顺序、调工具，本身不一定长手长脚；要配一条执行路线才有手。'
      : name === '协议/注入（高危）'
        ? '破解通信协议或注入客户端进程，违反平台规则，可能永久封禁甚至涉及法律风险。'
        : '虚拟机、评测、数据与逆向阅读等基础设施，多为基础零件而非成品。',
  ...routeStats(name),
}));

const decisions = section(summaryText, '## 六、怎么按自己的任务选（决策树）')
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => /^[-*]\s+/.test(line))
  .map((line) => {
    const text = stripMarkdown(line.replace(/^[-*]\s+/, ''));
    const [label, ...rest] = text.split('→');
    return { label: (label || '').trim(), text: (rest.join('→') || '').trim() };
  })
  .filter((item) => item.label && item.text);

const genericFacts = [
  {
    text: '截图点击类只会「看像素」，分不清按钮是「提交」还是「删除」；界面一改版、换个分辨率，之前学会的位置就失效。',
    source: 'summary_report.md · 第一、二节',
  },
  {
    text: '浏览器自动化和桌面自动化是两套技术：浏览器里最成熟、成本最低；出了浏览器，就要换成读系统控件或看屏幕，跨平台还得各做一套。',
    source: 'summary_report.md · 第二、四节',
  },
  {
    text: '没有任何项目给出可复核的业务成功率；成功率高度依赖目标软件是否改版、任务长短与界面是否标准，只能自己用 20 次小样本测。',
    source: 'summary_report.md · 第八节',
  },
];

const tierMeanings = [
  { tier: '推荐', meaning: '覆盖、易用、维护、稳定性都过关，风险可控，值得优先评估' },
  { tier: '可用', meaning: '能力成立，但有明确边界，或需要额外工程才能上线' },
  { tier: '谨慎', meaning: '能跑但不稳、偏窄、维护弱或依赖模型，只适合试验' },
  { tier: '勿用', meaning: '有法律、账号或安全风险，或实质停更、无法落地' },
];

log(
  `解析通用报告：技术路线 ${routes.length} 条、补充路线 ${extraRoutes.length} 类、决策 ${decisions.length} 条`,
  Date.now() - tStartCua,
);

/* ------------------------------ 输出 ------------------------------ */

const missingIds = repos.filter((r) => !r.hasDetail).map((r) => r.id);
const tierCounts = repos.reduce((acc, repo) => {
  if (repo.tier) acc[repo.tier] = (acc[repo.tier] || 0) + 1;
  return acc;
}, {});
const routeCounts = repos.reduce((acc, repo) => {
  if (repo.primaryRoute) acc[repo.primaryRoute] = (acc[repo.primaryRoute] || 0) + 1;
  return acc;
}, {});

const output = {
  meta: {
    generatedAt: new Date().toISOString(),
    manifestPath: 'F:\\coding_cua\\manifest.json',
    total: repos.length,
    detailCount: repos.filter((r) => r.hasDetail).length,
    missingDetailCount: missingIds.length,
    missingIds,
    rankCount,
    rankedTierCount,
    rankGeneratedAt: rankMeta.generatedAt,
    rankScoring: rankMeta.scoring,
    tierCounts,
    routeCounts,
    flagCounts: {
      needGpu: repos.filter((repo) => repo.needGpu).length,
      needPaidApi: repos.filter((repo) => repo.needPaidApi).length,
      chineseFriendly: repos.filter((repo) => repo.chineseFriendly).length,
    },
    reports: {
      summary: Boolean(summaryText),
      research: Boolean(research),
      rank: Boolean(rankReport),
    },
  },
  repos,
  cua: {
    facts: genericFacts,
    routes,
    extraRoutes,
    decisions,
    tierMeanings,
  },
  wecom: {
    facts,
    actionSteps,
    solutions,
    capabilities,
    riskTiers,
    scenarios,
    keyNumbers,
    sources: sources.map((s) => ({ ...s, group: classifySource(s.url) })),
  },
};

mkdirSync(dirname(OUT_FILE), { recursive: true });
writeFileSync(OUT_FILE, `${JSON.stringify(output, null, 1)}\n`, 'utf8');

log(
  `写出 generated.json：${(Buffer.byteLength(JSON.stringify(output)) / 1024).toFixed(1)} KB；` +
    `缺档案 ${missingIds.length} 条；排名 ${rankCount} 条（推荐 ${tierCounts['推荐'] || 0} / 可用 ${tierCounts['可用'] || 0} / 谨慎 ${tierCounts['谨慎'] || 0} / 勿用 ${tierCounts['勿用'] || 0}）`,
  Date.now() - started,
);
