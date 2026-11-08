import { useMemo, useState } from 'react';
import { platforms, repos, types } from '../data';
import type { AllQuery } from '../lib/router';
import { queryRepos, uniqueValues, type FlagKey, type SortDir, type SortKey } from '../lib/filters';
import { formatDate, formatMonths, TIER_ORDER, tierKey, typeLabel } from '../lib/format';
import { scoreOf } from '../lib/relevance';
import { RouteTag, Stars, TierBadge, TypeBadge } from '../components/ui';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'score', label: '综合分' },
  { key: 'stars', label: '星标数' },
  { key: 'pushedAt', label: '最近更新' },
  { key: 'cuaType', label: '类型' },
  { key: 'platform', label: '平台' },
  { key: 'name', label: '名称' },
];

const FLAG_OPTIONS: { key: FlagKey; label: string; hint: string }[] = [
  { key: 'needGpu', label: '需 GPU', hint: '档案里提到 GPU / CUDA / 显存' },
  { key: 'needPaidApi', label: '需付费 API', hint: '档案里提到 API Key、计费、订阅或商业模型' },
  { key: 'chineseFriendly', label: '中文友好', hint: '档案里提到中文、简体或汉化（估算）' },
];

export function AllPage({ initial }: { initial: AllQuery }) {
  const [query, setQuery] = useState(initial.q ?? '');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
    initial.platform ? [initial.platform] : [],
  );
  const [selectedTiers, setSelectedTiers] = useState<string[]>(
    initial.tier ? [initial.tier] : [],
  );
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>(
    initial.route ? [initial.route] : [],
  );
  const [selectedFlags, setSelectedFlags] = useState<FlagKey[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('score');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [filtersOpen, setFiltersOpen] = useState(
    () => !window.matchMedia('(max-width: 820px)').matches,
  );
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [limitHit, setLimitHit] = useState(false);

  const now = useMemo(() => new Date(), []);
  const routes = useMemo(
    () => uniqueValues(repos.map((repo) => repo.primaryRoute).filter((route): route is string => Boolean(route))),
    [],
  );
  const rows = useMemo(
    () =>
      queryRepos(
        repos,
        {
          q: query,
          types: selectedTypes,
          platforms: selectedPlatforms,
          tiers: selectedTiers,
          routes: selectedRoutes,
          flags: selectedFlags,
        },
        sortKey,
        sortDir,
        now,
      ),
    [query, selectedTypes, selectedPlatforms, selectedTiers, selectedRoutes, selectedFlags, sortKey, sortDir, now],
  );

  const toggle = <T,>(list: T[], value: T, set: (next: T[]) => void) => {
    set(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  };

  const reset = () => {
    setQuery('');
    setSelectedTypes([]);
    setSelectedPlatforms([]);
    setSelectedTiers([]);
    setSelectedRoutes([]);
    setSelectedFlags([]);
  };

  const toggleCompare = (id: string) => {
    setLimitHit(false);
    if (compareIds.includes(id)) {
      setCompareIds(compareIds.filter((item) => item !== id));
      return;
    }
    if (compareIds.length >= 4) {
      setLimitHit(true);
      return;
    }
    setCompareIds([...compareIds, id]);
  };

  const activeCount =
    selectedTypes.length +
    selectedPlatforms.length +
    selectedTiers.length +
    selectedRoutes.length +
    selectedFlags.length +
    (query ? 1 : 0);

  return (
    <div className={`page page--all${compareIds.length > 0 ? ' has-compare-bar' : ''}`}>
      <header className="page-head">
        <p className="eyebrow">完整清单</p>
        <h1>140 个开源项目</h1>
        <p className="page-head__lead">
          默认按 <code>cua_rank.json</code> 的综合分降序（rank 1–140），每行标出推荐等级与技术路线。
          搜索支持一句自然语言，比如「我想自动填表并提交」。点任意一行看中文档案；勾选项目可并排对比（最多 4 个）。
        </p>
      </header>

      <div className="toolbar">
        <div className="toolbar__search">
          <label className="sr-only" htmlFor="all-search">
            搜索：项目名、用途、能力或一句自然语言
          </label>
          <svg viewBox="0 0 20 20" aria-hidden="true" className="icon icon--search">
            <circle cx="9" cy="9" r="5.5" />
            <path d="M13.5 13.5L17 17" />
          </svg>
          <input
            id="all-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="例如「自动填表并提交」「抓 Excel 数据」「Windows 桌面点击」"
            autoComplete="off"
          />
          {query ? (
            <button
              className="icon-button"
              type="button"
              onClick={() => setQuery('')}
              aria-label="清空搜索关键词"
            >
              ×
            </button>
          ) : null}
        </div>

        <div className="toolbar__sort">
          <label htmlFor="sort-key">排序</label>
          <select
            id="sort-key"
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value as SortKey)}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="button button--ghost button--small"
            onClick={() => setSortDir(sortDir === 'desc' ? 'asc' : 'desc')}
            aria-label={`当前${sortDir === 'desc' ? '降序' : '升序'}，点击切换为${
              sortDir === 'desc' ? '升序' : '降序'
            }`}
          >
            {sortDir === 'desc' ? '降序 ↓' : '升序 ↑'}
          </button>
          <button
            type="button"
            className="button button--ghost button--small filters-toggle"
            aria-expanded={filtersOpen}
            aria-controls="all-filters"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            筛选{activeCount > 0 ? `（${activeCount}）` : ''}
          </button>
        </div>
      </div>

      <fieldset className="filters" id="all-filters" hidden={!filtersOpen}>
        <legend>
          筛选 <span className="filters__count">{activeCount > 0 ? `已启用 ${activeCount} 项` : '未启用'}</span>
        </legend>
        <div className="filters__row">
          <span className="filters__label" id="filter-type">
            类型
          </span>
          <div className="filters__chips" role="group" aria-labelledby="filter-type">
            {types.map((type) => (
              <button
                key={type}
                type="button"
                className={`filter-chip${selectedTypes.includes(type) ? ' is-on' : ''}`}
                aria-pressed={selectedTypes.includes(type)}
                title={type}
                onClick={() => toggle(selectedTypes, type, setSelectedTypes)}
              >
                {typeLabel(type)}
              </button>
            ))}
          </div>
        </div>
        <div className="filters__row">
          <span className="filters__label" id="filter-platform">
            平台
          </span>
          <div className="filters__chips" role="group" aria-labelledby="filter-platform">
            {platforms.map((platform) => (
              <button
                key={platform}
                type="button"
                className={`filter-chip${selectedPlatforms.includes(platform) ? ' is-on' : ''}`}
                aria-pressed={selectedPlatforms.includes(platform)}
                onClick={() => toggle(selectedPlatforms, platform, setSelectedPlatforms)}
              >
                {platform}
              </button>
            ))}
          </div>
        </div>
        <div className="filters__row">
          <span className="filters__label" id="filter-tier">
            推荐等级
          </span>
          <div className="filters__chips" role="group" aria-labelledby="filter-tier">
            {TIER_ORDER.map((tier) => (
              <button
                key={tier}
                type="button"
                className={`filter-chip filter-chip--tier-${tierKey(tier)}${
                  selectedTiers.includes(tier) ? ' is-on' : ''
                }`}
                aria-pressed={selectedTiers.includes(tier)}
                onClick={() => toggle(selectedTiers, tier, setSelectedTiers)}
              >
                {tier}
                {tier === '勿用' ? '（有风险）' : ''}
              </button>
            ))}
          </div>
        </div>
        <div className="filters__row">
          <span className="filters__label" id="filter-route">
            技术路线
          </span>
          <div className="filters__chips" role="group" aria-labelledby="filter-route">
            {routes.map((route) => (
              <button
                key={route}
                type="button"
                className={`filter-chip${selectedRoutes.includes(route) ? ' is-on' : ''}`}
                aria-pressed={selectedRoutes.includes(route)}
                onClick={() => toggle(selectedRoutes, route, setSelectedRoutes)}
              >
                {route}
              </button>
            ))}
          </div>
        </div>
        <div className="filters__row">
          <span className="filters__label" id="filter-flag">
            通用维度
          </span>
          <div className="filters__chips" role="group" aria-labelledby="filter-flag">
            {FLAG_OPTIONS.map((flag) => (
              <button
                key={flag.key}
                type="button"
                className={`filter-chip${selectedFlags.includes(flag.key) ? ' is-on' : ''}`}
                aria-pressed={selectedFlags.includes(flag.key)}
                title={flag.hint}
                onClick={() => toggle(selectedFlags, flag.key, setSelectedFlags)}
              >
                {flag.label}
              </button>
            ))}
          </div>
          <button type="button" className="link-button" onClick={reset}>
            重置全部
          </button>
        </div>
      </fieldset>

      <p className="result-line" role="status">
        共 <strong>{rows.length}</strong> 个项目
        {rows.length !== repos.length ? `（已从 ${repos.length} 个中筛选）` : ''}
        <span className="scroll-hint">表格可左右滑动，查看星级、更新、类型与平台</span>
      </p>

      <div className="table-wrap table-wrap--all">
        <table className="table table--all">
          <caption className="sr-only">
            140 个 CUA / RPA 开源项目清单，可按综合分、星标、更新时间、类型、平台排序
          </caption>
          <thead>
            <tr>
              <th scope="col">项目</th>
              <th scope="col">综合分与路线</th>
              <th scope="col">星级</th>
              <th scope="col">更新</th>
              <th scope="col">类型</th>
              <th scope="col">平台</th>
              <th scope="col">
                <span className="sr-only">加入对比</span>对比
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((repo) => {
              const score = scoreOf(repo, now);
              return (
                <tr key={repo.id}>
                  <td className="cell-project">
                    <a className="project-link" href={`#/repo/${encodeURIComponent(repo.id)}`}>
                      {repo.name}
                    </a>
                    <span className="project-sub">
                      {repo.taglineZh || repo.description || '暂无中文简介'}
                    </span>
                  </td>
                  <td className="cell-fit">
                    <div className="fit-cell">
                      <TierBadge tier={repo.tier} showNote />
                      <span className="fit-score">{score}</span>
                    </div>
                    <div className="fit-sub">
                      <RouteTag route={repo.primaryRoute} />
                    </div>
                  </td>
                  <td>
                    <Stars value={repo.stars} />
                  </td>
                  <td className="cell-date">
                    <span>{formatDate(repo.pushedAt)}</span>
                    <small>{formatMonths(repo.pushedAt, now)}</small>
                  </td>
                  <td>
                    <TypeBadge type={repo.cuaType} />
                  </td>
                  <td className="cell-platforms">{repo.platforms.join(' / ') || '未标注'}</td>
                  <td>
                    <label className="check">
                      <input
                        type="checkbox"
                        checked={compareIds.includes(repo.id)}
                        onChange={() => toggleCompare(repo.id)}
                        aria-label={`把 ${repo.name} 加入对比`}
                      />
                      <span aria-hidden="true" />
                    </label>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="table-note">
        综合分与名次取自 <code>showcase\data\cua_rank.json</code>（rank 1–140、score 0–100），本地算法只在排名缺失时兜底。
        推荐等级：<strong>推荐</strong> 优先评估、<strong>可用</strong> 有前提、<strong>谨慎</strong>{' '}
        只适合试验、<strong>勿用</strong> 有法律/账号/安全风险或不建议上线。「技术路线」是它操作电脑的方式。
      </p>

      {rows.length === 0 ? (
        <div className="notice">
          <span className="notice__icon" aria-hidden="true">
            ?
          </span>
          <div>
            没有匹配的项目。试试减少筛选条件，或换一种说法，比如「浏览器」「填表」「Windows 点击」。
            <button type="button" className="link-button" onClick={reset}>
              重置筛选
            </button>
          </div>
        </div>
      ) : null}

      {compareIds.length > 0 ? (
        <div className="compare-bar" role="region" aria-label="对比选择">
          <div className="compare-bar__inner">
            <p>
              已选 <strong>{compareIds.length}</strong> / 4
              <span className="compare-bar__names">{compareIds.length} 个项目待对比</span>
            </p>
            {limitHit ? (
              <p className="compare-bar__warn" role="alert">
                最多同时对比 4 个，请先取消一个。
              </p>
            ) : null}
            <div className="compare-bar__actions">
              <button type="button" className="link-button" onClick={() => setCompareIds([])}>
                清空
              </button>
              <a
                className="button button--primary button--small"
                href={`#/compare?ids=${compareIds.map(encodeURIComponent).join(',')}`}
              >
                去对比
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
