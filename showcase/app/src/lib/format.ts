import type { Repo } from './types';
import { monthsSince } from './relevance';

export function formatDate(iso: string): string {
  const time = Date.parse(iso);
  if (Number.isNaN(time)) return '未知';
  return new Date(time).toISOString().slice(0, 10);
}

export function formatStars(stars: number): string {
  if (stars >= 10000) return `${(stars / 10000).toFixed(1)} 万`;
  return stars.toLocaleString('en-US');
}

export function formatMonths(iso: string, now: Date = new Date()): string {
  const months = monthsSince(iso, now);
  if (months >= 999) return '更新时间未知';
  if (months < 1) return '近 1 个月有更新';
  return `约 ${Math.round(months)} 个月未更新`;
}

export type Tone = 'ok' | 'warn' | 'bad' | 'muted';

export const TIER_ORDER = ['推荐', '可用', '谨慎', '勿用'] as const;

export type TierKey = 'rec' | 'usable' | 'caution' | 'ban';

/** 推荐等级映射到样式键；文字始终与颜色同时出现，避免只靠颜色传达风险 */
export function tierKey(tier: string | null | undefined): TierKey | null {
  if (tier === '推荐') return 'rec';
  if (tier === '可用') return 'usable';
  if (tier === '谨慎') return 'caution';
  if (tier === '勿用') return 'ban';
  return null;
}

export const TIER_ICON: Record<string, string> = {
  推荐: '✓',
  可用: '○',
  谨慎: '!',
  勿用: '×',
};

const ROUTE_LABEL: Record<string, string> = {
  'official-sdk': '官方 SDK',
  'official-api': '官方 API',
  'rpa-semi': '半自动 RPA',
  uia: 'UI 自动化',
  library: '代码库',
  mobile: '移动端自动化',
  unrelated: '与本场景无关',
  protocol: '协议破解',
  hook: '客户端 Hook',
};

export function routeLabel(route: string | null | undefined): string {
  if (!route) return '';
  return ROUTE_LABEL[route] ?? route;
}

/** 把「极低 / 低 / 中低 / 中高 / 高 / 极高」等中文评级映射到色调（同时保留文字，不只靠颜色） */
export function riskTone(text: string): Tone {
  if (/极高|永久封禁|不建议/.test(text)) return 'bad';
  if (/^高|中高|较高/.test(text)) return 'bad';
  if (/^中$|中低|中等/.test(text)) return 'warn';
  if (/低|无|可接受/.test(text)) return 'ok';
  return 'muted';
}

export function typeLabel(type: string): string {
  const map: Record<string, string> = {
    framework: '框架',
    agent: '智能体',
    'wechat-specific': '微信专用',
    'ui-library': 'UI 自动化库',
    'rpa-tool': 'RPA 工具',
    skill: 'Skill',
    'dataset-benchmark': '数据集 / 评测',
    other: '其他',
  };
  return map[type] ?? type;
}

export function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max)}…` : clean;
}

export function repoDisplayName(repo: Repo): string {
  return repo.taglineZh || repo.name;
}
