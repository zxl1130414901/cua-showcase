import type { Repo } from './types';

export interface ScoreBreakdown {
  coverage: number;
  usability: number;
  docs: number;
  maintenance: number;
  stability: number;
  riskPenalty: number;
}

export interface RepoScore {
  score: number;
  breakdown: ScoreBreakdown;
  reason: string;
  estimated: boolean;
}

export interface RankedRepo extends RepoScore {
  repo: Repo;
  rank: number;
}

export function monthsSince(iso: string, now: Date): number {
  const time = Date.parse(iso);
  if (Number.isNaN(time)) return 999;
  const days = (now.getTime() - time) / 86_400_000;
  return Math.max(0, days / 30.44);
}

function neutralScore(value: number | null): number {
  // 档案未整理时保守取 4 分，避免把未知当成优秀
  return value === null ? 4 : value;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value * 10) / 10));
}

/** 本地兜底分数（0-100）：覆盖 35 + 易用 25 + 文档 15 + 维护 15 + 稳定 10 - 风险扣分 */
export function scoreRepo(repo: Repo, _now: Date = new Date()): RepoScore {
  const coverage = neutralScore(repo.scores.coverage) * 3.5;
  const usability = neutralScore(repo.scores.usability) * 2.5;
  const docs = neutralScore(repo.scores.docs) * 1.5;
  const maintenance = neutralScore(repo.scores.maintenance) * 1.5;
  const stability = neutralScore(repo.scores.stability) * 1.0;

  let riskPenalty = 0;
  if (repo.riskFlags.length > 0) riskPenalty += 10;
  if (repo.cuaType === 'rpa-tool') riskPenalty += 2;
  riskPenalty = Math.min(15, riskPenalty);

  const score = clamp(coverage + usability + docs + maintenance + stability - riskPenalty);

  const estimatedScores =
    repo.scores.coverage === null &&
    repo.scores.usability === null &&
    repo.scores.stability === null;

  const reason =
    repo.whyZh ||
    repo.capabilityZh ||
    (repo.summaryZh ? repo.summaryZh.replace(/\s+/g, ' ').slice(0, 80) : '') ||
    (repo.hasDetail ? '档案未给出推荐理由。' : '档案整理中：按项目质量与活跃度估算。');

  return {
    score,
    breakdown: {
      coverage: Math.round(coverage * 10) / 10,
      usability: Math.round(usability * 10) / 10,
      docs: Math.round(docs * 10) / 10,
      maintenance: Math.round(maintenance * 10) / 10,
      stability: Math.round(stability * 10) / 10,
      riskPenalty,
    },
    reason,
    estimated: !repo.hasDetail || estimatedScores,
  };
}

/** 排名文件存在时优先采用其 score */
export function scoreOf(repo: Repo, now: Date): number {
  if (typeof repo.score === 'number' && Number.isFinite(repo.score)) {
    return clamp(repo.score);
  }
  return scoreRepo(repo, now).score;
}

export function rankRepos(repos: Repo[], now: Date = new Date()): RankedRepo[] {
  const ranked = repos.map((repo) => ({ repo, ...scoreRepo(repo, now) }));
  ranked.sort((a, b) => {
    const ra = typeof a.repo.rank === 'number' ? a.repo.rank : null;
    const rb = typeof b.repo.rank === 'number' ? b.repo.rank : null;
    if (ra !== null && rb !== null && ra !== rb) return ra - rb;
    if (ra !== null && rb === null) return -1;
    if (ra === null && rb !== null) return 1;
    const sa = typeof a.repo.score === 'number' ? a.repo.score : a.score;
    const sb = typeof b.repo.score === 'number' ? b.repo.score : b.score;
    if (sb !== sa) return sb - sa;
    return b.repo.stars - a.repo.stars;
  });
  return ranked.map((item, index) => ({ ...item, rank: index + 1 }));
}

export function topRelevant(repos: Repo[], limit = 10, now: Date = new Date()): RankedRepo[] {
  return rankRepos(repos, now).slice(0, limit);
}

