import generated from './generated.json';
import type { Dataset, Repo } from '../lib/types';

export const dataset = generated as unknown as Dataset;
export const repos: Repo[] = dataset.repos;
export const cua = dataset.cua;
export const wecom = dataset.wecom;
export const meta = dataset.meta;

const byId = new Map<string, Repo>(repos.map((repo) => [repo.id, repo]));

export function getRepo(id: string): Repo | undefined {
  return byId.get(id);
}

export function getRepoByName(name: string): Repo | undefined {
  // 档案里的对比对象可能是 owner/repo，也可能是文件名形式 owner__repo
  const normalized = name.replace('__', '/').toLowerCase();
  return (
    repos.find((repo) => repo.name.toLowerCase() === normalized) ??
    repos.find((repo) => repo.name.toLowerCase() === name.toLowerCase())
  );
}

export function getRepos(ids: string[]): Repo[] {
  return ids
    .map((id) => getRepo(id))
    .filter((repo): repo is Repo => repo !== undefined);
}

export const types = [...new Set(repos.map((repo) => repo.cuaType))].sort((a, b) =>
  a.localeCompare(b, 'zh-Hans-CN'),
);
export const platforms = [...new Set(repos.flatMap((repo) => repo.platforms))].sort((a, b) =>
  a.localeCompare(b, 'zh-Hans-CN'),
);
