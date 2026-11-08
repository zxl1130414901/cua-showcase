import { useMemo, useState } from 'react';
import { getRepos, repos } from '../data';
import type { Repo } from '../lib/types';
import { formatDate, formatStars, truncate } from '../lib/format';
import { scoreOf } from '../lib/relevance';
import { RouteTag, ScoreBar, Stars, TierBadge, TypeBadge } from '../components/ui';

interface Row {
  key: string;
  label: string;
  render: (repo: Repo, now: Date) => string;
  node?: (repo: Repo, now: Date) => React.ReactNode;
}

const ROWS: Row[] = [
  { key: 'positioning', label: '定位（一句话）', render: (r) => r.taglineZh || '档案整理中' },
  {
    key: 'type',
    label: '类型',
    render: (r) => r.cuaType,
    node: (r) => <TypeBadge type={r.cuaType} />,
  },
  { key: 'stars', label: '星标', render: (r) => formatStars(r.stars) },
  { key: 'updated', label: '最近更新', render: (r) => formatDate(r.pushedAt) },
  {
    key: 'tier',
    label: '推荐等级',
    render: (r) => r.tier || '未评级',
    node: (r) => <TierBadge tier={r.tier} showNote />,
  },
  {
    key: 'route',
    label: '技术路线',
    render: (r) => r.primaryRoute || '未标注',
    node: (r) => <RouteTag route={r.primaryRoute} />,
  },
  { key: 'score', label: '综合分', render: (r, now) => String(scoreOf(r, now)) },
  { key: 'platforms', label: '支持平台', render: (r) => r.platforms.join(' / ') || '未标注' },
  { key: 'apps', label: '能操作的应用', render: (r) => r.appsZh.join('、') || '未列明' },
  { key: 'tech', label: '技术方案', render: (r) => truncate(r.techApproachZh || '未说明', 70) },
  { key: 'bestFor', label: '最适合的场景', render: (r) => truncate(r.bestForZh || '未给出', 90) },
  { key: 'avoid', label: '谁不该用', render: (r) => truncate(r.riskZh || r.limitsZh || '未说明', 90) },
  { key: 'success', label: '成功率说法', render: (r) => truncate(r.successRateZh || '未给出', 70) },
  { key: 'pros', label: '优点', render: (r) => r.prosZh.map((p) => `• ${p}`).join('\n') || '未列出' },
  { key: 'cons', label: '缺点', render: (r) => r.consZh.map((p) => `• ${p}`).join('\n') || '未列出' },
  { key: 'limits', label: '边界与风险', render: (r) => truncate(r.limitsZh || '未说明', 90) },
  { key: 'steps', label: '落地步骤数', render: (r) => (r.stepsZh.length ? `${r.stepsZh.length} 步` : '未给出') },
];

export function ComparePage({ ids }: { ids: string[] }) {
  const [query, setQuery] = useState('');
  const now = useMemo(() => new Date(), []);
  const selected = getRepos(ids).slice(0, 4);
  const overflow = ids.length > 4;

  const candidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    return repos
      .filter((repo) => !ids.includes(repo.id))
      .filter(
        (repo) =>
          !q ||
          repo.name.toLowerCase().includes(q) ||
          repo.taglineZh.includes(q) ||
          repo.description.toLowerCase().includes(q),
      )
      .sort((a, b) => scoreOf(b, now) - scoreOf(a, now))
      .slice(0, 8);
  }, [ids, query, now]);

  const addHref = (id: string) => `#/compare?ids=${[...selected.map((repo) => repo.id), id].map(encodeURIComponent).join(',')}`;
  const removeHref = (id: string) =>
    `#/compare?ids=${selected
      .filter((repo) => repo.id !== id)
      .map((repo) => encodeURIComponent(repo.id))
      .join(',')}`;

  if (selected.length === 0) {
    return (
      <div className="page page--compare">
        <header className="page-head">
          <p className="eyebrow">项目对比</p>
          <h1>先选 2–4 个项目</h1>
          <p className="page-head__lead">
            从下面挑，或在完整清单里勾选。对比页会把差异逐行高亮，省得你在十几个标签页之间来回切。
          </p>
        </header>
        <div className="search" role="search">
          <label className="sr-only" htmlFor="compare-search">
            搜索要对比的项目
          </label>
          <svg viewBox="0 0 20 20" aria-hidden="true" className="icon icon--search">
            <circle cx="9" cy="9" r="5.5" />
            <path d="M13.5 13.5L17 17" />
          </svg>
          <input
            id="compare-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="输入项目名或关键词，如「wxauto」「browser-use」"
          />
        </div>
        <ul className="picker">
          {candidates.map((repo) => (
            <li key={repo.id}>
              <div>
                <a className="project-link" href={`#/repo/${encodeURIComponent(repo.id)}`}>
                  {repo.name}
                </a>
                <p>{repo.taglineZh || repo.description || '档案整理中'}</p>
              </div>
              <a className="button button--ghost button--small" href={addHref(repo.id)}>
                加入对比
              </a>
            </li>
          ))}
          {candidates.length === 0 ? <li className="muted">没有匹配的项目。</li> : null}
        </ul>
        <p className="table-note">
          也可以先去 <a href="#/all">完整清单</a> 勾选项目，再点底部「去对比」。
        </p>
      </div>
    );
  }

  return (
    <div className="page page--compare">
      <header className="page-head">
        <p className="eyebrow">项目对比</p>
        <h1>{selected.length} 个项目并排看</h1>
        <p className="page-head__lead">标有「差异」的行表示这几个项目在该维度不一样，值得重点看。</p>
      </header>

      {overflow ? (
        <div className="notice notice--warn">
          <span className="notice__icon" aria-hidden="true">
            !
          </span>
          <div>最多同时对比 4 个，已忽略多余的项目。</div>
        </div>
      ) : null}

      <div className="table-wrap table-wrap--compare">
        <table className="table table--compare">
          <caption className="sr-only">项目逐行对比，差异行已标注</caption>
          <thead>
            <tr>
              <th scope="col">对比维度</th>
              {selected.map((repo) => (
                <th scope="col" key={repo.id}>
                  <div className="compare-head">
                    <a className="project-link" href={`#/repo/${encodeURIComponent(repo.id)}`}>
                      {repo.name}
                    </a>
                    <span>{repo.taglineZh}</span>
                    <a className="link-button" href={removeHref(repo.id)} aria-label={`从对比中移除 ${repo.name}`}>
                      移除
                    </a>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className={selected.length > 1 ? 'is-diff' : undefined}>
              <th scope="row">
                星标 / 综合分
                {selected.length > 1 ? <span className="diff-mark">差异</span> : null}
              </th>
              {selected.map((repo) => (
                <td key={repo.id}>
                  <Stars value={repo.stars} /> · <strong>{scoreOf(repo, now)}</strong>
                  {typeof repo.rank === 'number' ? <small className="muted"> 第 {repo.rank} 名</small> : null}
                </td>
              ))}
            </tr>
            <tr className={selected.length > 1 ? 'is-diff' : undefined}>
              <th scope="row">
                核心评分
                {selected.length > 1 ? <span className="diff-mark">差异</span> : null}
              </th>
              {selected.map((repo) => (
                <td key={repo.id}>
                  <div className="scores scores--compact">
                    <ScoreBar label="覆盖" value={repo.subScores?.coverage ?? repo.scores.coverage} />
                    <ScoreBar label="易用" value={repo.subScores?.usability ?? repo.scores.usability} />
                    <ScoreBar label="稳定" value={repo.subScores?.stability ?? repo.scores.stability} />
                  </div>
                </td>
              ))}
            </tr>
            {ROWS.map((row) => {
              const values = selected.map((repo) => row.render(repo, now));
              const distinct = new Set(values.map((value) => value.trim())).size;
              const isDiff = selected.length > 1 && distinct > 1;
              return (
                <tr key={row.key} className={isDiff ? 'is-diff' : undefined}>
                  <th scope="row">
                    {row.label}
                    {isDiff ? <span className="diff-mark">差异</span> : null}
                  </th>
                  {selected.map((repo, index) => (
                    <td key={repo.id}>
                      {row.node ? row.node(repo, now) : values[index] || '未标注'}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <section className="picker-block" aria-labelledby="add-title">
        <h2 id="add-title">再加入一个项目</h2>
        <div className="search" role="search">
          <label className="sr-only" htmlFor="compare-search-more">
            搜索要加入对比的项目
          </label>
          <svg viewBox="0 0 20 20" aria-hidden="true" className="icon icon--search">
            <circle cx="9" cy="9" r="5.5" />
            <path d="M13.5 13.5L17 17" />
          </svg>
          <input
            id="compare-search-more"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索项目并加入"
          />
        </div>
        {selected.length < 4 ? (
          <ul className="picker picker--inline">
            {candidates.map((repo) => (
              <li key={repo.id}>
                <a className="chip chip--link" href={addHref(repo.id)}>
                  + {repo.name}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">已达到 4 个上限，先移除一个才能再加。</p>
        )}
      </section>
      <p>
        <a className="link-arrow" href="#/all">
          回到完整清单继续挑 <span aria-hidden="true">→</span>
        </a>
      </p>
    </div>
  );
}
