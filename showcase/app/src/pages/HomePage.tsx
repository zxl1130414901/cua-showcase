import { useMemo, useState } from 'react';
import { cua, meta, repos } from '../data';
import { formatDate } from '../lib/format';
import { toHash } from '../lib/router';
import { scoreOf, topRelevant } from '../lib/relevance';
import { RouteTag, Section, TierBadge, TypeBadge } from '../components/ui';

interface UseCase {
  label: string;
  desc: string;
  href: string;
  count: number;
}

const ROUTE_CASES: { label: string; desc: string; route: string }[] = [
  { label: '浏览器网页自动化', desc: '网页后台、表单、抓取', route: '浏览器自动化' },
  { label: 'Windows 桌面软件', desc: '客户端、财务/ERP、老系统', route: '' },
  { label: 'macOS 桌面', desc: 'Mac 客户端与系统应用', route: '' },
  { label: '手机 App', desc: 'Android / iOS 自动化', route: '' },
  { label: 'Office 与文档处理', desc: 'Excel、Word、PDF、批量改文件', route: '' },
  { label: '批量流程与 RPA', desc: '固定步骤、每天重复', route: 'RPA/工作流' },
  { label: 'Agent 框架', desc: '让模型自己拆任务、调工具', route: 'Agent 框架' },
];

function useCases(): UseCase[] {
  return ROUTE_CASES.map((item) => {
    if (item.route) {
      const query = { route: item.route };
      return {
        label: item.label,
        desc: item.desc,
        href: toHash({ name: 'all', query }),
        count: repos.filter((repo) => repo.primaryRoute === item.route).length,
      };
    }
    if (item.label === 'Windows 桌面软件') {
      return {
        label: item.label,
        desc: item.desc,
        href: toHash({ name: 'all', query: { platform: 'Windows' } }),
        count: repos.filter((repo) => repo.platforms.includes('Windows')).length,
      };
    }
    if (item.label === 'macOS 桌面') {
      return {
        label: item.label,
        desc: item.desc,
        href: toHash({ name: 'all', query: { platform: 'macOS' } }),
        count: repos.filter((repo) => repo.platforms.includes('macOS')).length,
      };
    }
    if (item.label === '手机 App') {
      return {
        label: item.label,
        desc: item.desc,
        href: toHash({ name: 'all', query: { platform: 'Android' } }),
        count: repos.filter((repo) => repo.platforms.includes('Android') || repo.platforms.includes('iOS')).length,
      };
    }
    return {
      label: item.label,
      desc: item.desc,
      href: toHash({ name: 'all', query: { q: '文档' } }),
      count: repos.filter((repo) => /文档|excel|word|pdf|表格/i.test(repo.whatItDoesZh + repo.useCasesZh.join(' '))).length,
    };
  });
}

export function HomePage() {
  const [query, setQuery] = useState('');
  const now = useMemo(() => new Date(), []);
  const top = useMemo(() => topRelevant(repos, 10, now), [now]);
  const cases = useMemo(() => useCases(), []);
  const today = formatDate(meta.generatedAt);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    window.location.hash = trimmed
      ? toHash({ name: 'all', query: { q: trimmed } })
      : '#/all';
  };

  return (
    <div className="page page--home">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__statement">
          <p className="eyebrow">CUA 开源项目调研 · 给非技术读者的决策页</p>
          <h1 id="hero-title" className="hero__title">
            CUA 没有万能选手
            <span className="hero__title-strong">先按「要操作什么」分流</span>
          </h1>
          <p className="hero__lead">
            CUA 指让 AI 像人一样看屏幕、点鼠标来操作电脑，RPA
            指按固定步骤模拟点击。同样是「自动操作电脑」，网页、Windows 桌面、Mac、手机是四套完全不同的技术。
            <strong>先选对路线，再挑项目</strong>，比从 140 个项目里逐个试要快得多。
          </p>

          <div className="usecases" aria-label="按用途进入清单">
            {cases.map((item, index) => (
              <a className="usecase" href={item.href} key={item.label}>
                <span className="usecase__num" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="usecase__body">
                  <strong>{item.label}</strong>
                  <small>{item.desc}</small>
                </span>
                <span className="usecase__count">{item.count} 个</span>
              </a>
            ))}
          </div>

          <div className="hero__actions">
            <a className="button button--primary" href="#/routes">
              先看 5 条技术路线
            </a>
            <a className="button button--ghost" href="#/all">
              直接看 140 个项目
            </a>
          </div>
          <p className="hero__meta">
            数据截至 {today} · {meta.total} 个项目 · 已整理中文档案 {meta.detailCount} 份 ·{' '}
            排名 {meta.rankCount} 条
          </p>
        </div>

        <div className="verdict" aria-labelledby="verdict-title">
          <div className="verdict__head">
            <span className="verdict__badge">结论</span>
            <h2 id="verdict-title">三条硬事实</h2>
          </div>
          <ol className="facts">
            {cua.facts.map((fact, index) => (
              <li className="fact" key={fact.text}>
                <span className="fact__num" aria-hidden="true">
                  0{index + 1}
                </span>
                <div className="fact__body">
                  <p>{fact.text}</p>
                  <span className="fact__source">依据：{fact.source}</span>
                </div>
              </li>
            ))}
          </ol>
          <p className="verdict__foot">
            三条结论来自本地研究报告；它们决定了「先分流、再看项目」的顺序，也解释了为什么没有满分项目。
          </p>
        </div>
      </section>

      <Section
        id="projects"
        index={1}
        title="先看这 10 个"
        lead="直接取全量排名文件 cua_rank.json 的第 1–10 名，不是按星标热度挑的。卡片写清它最擅长什么、最大风险是什么，方便你先排除、再深入。"
        actions={
          <a className="button button--ghost button--small" href="#/all">
            进入完整清单 <span aria-hidden="true">→</span>
          </a>
        }
      >
        <form className="search" role="search" onSubmit={submit}>
          <label className="sr-only" htmlFor="home-search">
            搜索项目：输入名称、用途或一句自然语言
          </label>
          <svg viewBox="0 0 20 20" aria-hidden="true" className="icon icon--search">
            <circle cx="9" cy="9" r="5.5" />
            <path d="M13.5 13.5L17 17" />
          </svg>
          <input
            id="home-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="试试「自动填表并提交」「Windows 点击」「抓 Excel 数据」"
            autoComplete="off"
          />
          <button className="button button--primary" type="submit">
            搜索全库
          </button>
        </form>

        <div className="cards">
          {top.map((item) => (
            <a className="card" href={`#/repo/${encodeURIComponent(item.repo.id)}`} key={item.repo.id}>
              <div className="card__top">
                <span className="card__rank">#{item.repo.rank ?? item.rank}</span>
                <span className="card__score">
                  综合分 <strong>{scoreOf(item.repo, now)}</strong>
                </span>
              </div>
              <h3 className="card__title">{item.repo.taglineZh || item.repo.name}</h3>
              <p className="card__repo">{item.repo.name}</p>
              <p className="card__reason">{item.repo.capabilityZh || item.reason}</p>
              {item.repo.riskZh ? (
                <p className="card__risk">
                  <span aria-hidden="true">!</span> 最大风险：{item.repo.riskZh}
                </p>
              ) : null}
              <div className="card__tags">
                <TierBadge tier={item.repo.tier} />
                <RouteTag route={item.repo.primaryRoute} />
                <TypeBadge type={item.repo.cuaType} />
              </div>
            </a>
          ))}
        </div>
        <p className="table-note">
          序号与 <code>cua_rank.json</code> 的 rank 一致；「综合分」是研究的相对排序，不是成功率，也不代表能直接上线。
        </p>
      </Section>

      <section className="compare-cta" aria-labelledby="compare-cta-title">
        <div>
          <h2 id="compare-cta-title">还拿不准？把 2–4 个项目并排看</h2>
          <p>对比页逐行高亮差异：能操作什么、技术方案、最适合的场景、谁不该用、优缺点与成功率说法。</p>
        </div>
        <a className="button button--primary" href="#/compare">
          开始对比
        </a>
      </section>
    </div>
  );
}
