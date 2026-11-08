export type WecomRelevance = 'direct' | 'partial' | 'none';

/** cua_rank.json 给出的推荐等级 */
export type CuaTier = '推荐' | '可用' | '谨慎' | '勿用';

export interface RankSubScores {
  coverage: number;
  usability: number;
  docs: number;
  maintenance: number;
  stability: number;
  breadth: number;
  riskPenalty: number;
}

export type CuaType =
  | 'framework'
  | 'agent'
  | 'wechat-specific'
  | 'ui-library'
  | 'rpa-tool'
  | 'skill'
  | 'dataset-benchmark'
  | 'other';

export interface Scores {
  coverage: number | null;
  usability: number | null;
  docs: number | null;
  maintenance: number | null;
  performance: number | null;
  stability: number | null;
}

export interface Evidence {
  claim: string;
  source: string;
  quote: string;
}

export interface CompareTips {
  vs: string[];
  whenZh: string;
}

export interface Repo {
  id: string;
  owner: string;
  repo: string;
  name: string;
  url: string;
  stars: number;
  forks: number;
  license: string;
  language: string;
  createdAt: string;
  pushedAt: string;
  updatedAt: string;
  description: string;
  topics: string[];
  sizeKb: number;
  cuaType: string;
  platforms: string[];
  hasDetail: boolean;
  taglineZh: string;
  summaryZh: string;
  whatItDoesZh: string;
  useCasesZh: string[];
  appsZh: string[];
  platformsZh: string[];
  techApproachZh: string;
  requirementsZh: string[];
  prosZh: string[];
  consZh: string[];
  limitsZh: string;
  wecomRelevance: WecomRelevance;
  relevanceEstimated: boolean;
  wecomUseZh: string;
  maturityZh: string;
  stepsZh: string[];
  successRateZh: string;
  evidence: Evidence[];
  compareTips: CompareTips;
  scores: Scores;
  riskFlags: string[];
  /** 全库名次与综合分（cua_rank.json） */
  rank?: number | null;
  score?: number | null;
  tier?: CuaTier | null;
  primaryRoute?: string | null;
  capabilityZh?: string;
  bestForZh?: string;
  whyZh?: string;
  riskZh?: string;
  subScores?: RankSubScores | null;
  /** 由关键词估算的通用筛选维度 */
  needGpu?: boolean;
  needPaidApi?: boolean;
  chineseFriendly?: boolean;
  /** 旧字段：仅用于历史案例，不参与评分与筛选 */
  externalRank?: number | null;
  externalScore?: number | null;
  route?: string | null;
  howToUseZh?: string;
}

export interface RouteInfo {
  name: string;
  principle: string;
  advantage: string;
  cost: string;
  examples: string;
  development: string;
  stability: string;
  risk: string;
  audience: string;
  count: number;
  avgScore: number;
  top: { id: string; name: string; rank: number | null }[];
}

export interface ExtraRoute {
  name: string;
  note: string;
  count: number;
  avgScore: number;
  top: { id: string; name: string; rank: number | null }[];
}

export interface Decision {
  label: string;
  text: string;
}

export interface CuaData {
  facts: { text: string; source: string }[];
  routes: RouteInfo[];
  extraRoutes: ExtraRoute[];
  decisions: Decision[];
  tierMeanings: { tier: string; meaning: string }[];
}

export interface Solution {
  rank: number;
  name: string;
  positioning: string;
  stability: string;
  compliance: string;
  devEffort: string;
  cost: string;
  suitableFor: string;
}

export interface Capability {
  ability: string;
  possible: string;
  boundary: string;
  gate: string;
  evidence: string;
  links: { title: string; url: string }[];
}

export interface RiskTier {
  tier: string;
  approach: string;
  note: string;
}

export interface Scenario {
  scenario: string;
  first: string;
  second: string;
  avoid: string;
}

export interface Fact {
  text: string;
  source: { title: string; url: string };
}

export interface ActionStep {
  title: string;
  desc: string;
}

export interface SourceLink {
  title: string;
  url: string;
  group: string;
}

export interface WecomData {
  facts: Fact[];
  actionSteps: ActionStep[];
  solutions: Solution[];
  capabilities: Capability[];
  riskTiers: RiskTier[];
  scenarios: Scenario[];
  keyNumbers: string[];
  sources: SourceLink[];
}

export interface DatasetMeta {
  generatedAt: string;
  manifestPath: string;
  total: number;
  detailCount: number;
  missingDetailCount: number;
  missingIds: string[];
  rankCount: number;
  rankedTierCount: number;
  rankGeneratedAt: string;
  rankScoring: string;
  tierCounts: Record<string, number>;
  routeCounts: Record<string, number>;
  flagCounts: { needGpu: number; needPaidApi: number; chineseFriendly: number };
  reports: { summary: boolean; research: boolean; rank: boolean };
}

export interface Dataset {
  meta: DatasetMeta;
  repos: Repo[];
  cua: CuaData;
  wecom: WecomData;
}
