import { cua, wecom } from '../data';
import { ExternalLink, RiskChip, Section, TierBadge } from '../components/ui';

function toneOf(risk: string): 'ok' | 'warn' | 'bad' {
  if (/低/.test(risk)) return 'ok';
  if (/高/.test(risk)) return 'bad';
  return 'warn';
}

export function RoutesPage() {
  return (
    <div className="page page--routes">
      <header className="page-head">
        <p className="eyebrow">技术路线 · 研究报告</p>
        <h1>5 条技术路线：先选路线，再挑项目</h1>
        <p className="page-head__lead">
          CUA / RPA 不是一种技术，而是五条差别很大的路线。路线选错，换再多项目也没用。这一页把每条路线的原理、适合谁、开发量、稳定性与风险摊开，
          并列出该路线下排名最高的代表项目（可点击）。企业微信只作为真实案例出现在最后。
        </p>
      </header>

      <div className="verdict verdict--inline">
        <div className="verdict__head">
          <span className="verdict__badge">结论</span>
          <h2>没有跨路线通吃的方案</h2>
        </div>
        <p className="verdict__text">
          网页任务优先浏览器自动化；桌面软件优先官方接口，其次读系统控件；两者都没有才考虑看屏幕点击。协议破解与客户端注入风险最高，不建议任何生产场景使用。
        </p>
      </div>

      <Section
        id="route-table"
        index={1}
        title="五条路线对照"
        lead="开发量、稳定性、风险是对整条路线的判断，不针对单个项目；项目数来自 cua_rank.json 的 primaryRoute 聚合，均分为该路线项目的综合分平均值。"
      >
        <div className="table-wrap">
          <table className="table table--routes">
            <caption className="sr-only">五条 CUA 技术路线对照表</caption>
            <thead>
              <tr>
                <th scope="col">路线</th>
                <th scope="col">白话原理</th>
                <th scope="col">适合谁</th>
                <th scope="col">开发量</th>
                <th scope="col">稳定性</th>
                <th scope="col">主要风险</th>
                <th scope="col">项目数 / 均分</th>
                <th scope="col">代表项目</th>
              </tr>
            </thead>
            <tbody>
              {cua.routes.map((route) => (
                <tr key={route.name}>
                  <th scope="row" className="cell-name">
                    <strong>{route.name}</strong>
                  </th>
                  <td>{route.principle}</td>
                  <td>{route.audience}</td>
                  <td>{route.development}</td>
                  <td>{route.stability}</td>
                  <td>
                    <RiskChip text={route.risk} tone={toneOf(route.risk)} />
                    <span className="cell-detail">{route.cost}</span>
                  </td>
                  <td className="cell-count">
                    <strong>{route.count}</strong>
                    <span>均分 {route.avgScore}</span>
                  </td>
                  <td>
                    <div className="chips chips--stack">
                      {route.top.map((item) => (
                        <a
                          className="chip chip--link"
                          key={item.id}
                          href={`#/repo/${encodeURIComponent(item.id)}`}
                        >
                          {item.name}
                          {typeof item.rank === 'number' ? <span className="chip__rank">#{item.rank}</span> : null}
                        </a>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="table-note">
          依据：<code>_reports/summary_report.md</code> 第二节「五条技术路线的原理与代价」；
          项目数与均分由 <code>data/cua_rank.json</code> 聚合。
        </p>
      </Section>

      <Section
        id="extra"
        index={2}
        title="另外三类：框架、高危与基础设施"
        lead="它们也常被提到，但不属于上面五条能直接落地的路线。"
      >
        <div className="route-extra">
          {cua.extraRoutes.map((route) => (
            <article className="route-extra__item" key={route.name}>
              <div className="route-extra__head">
                <h3>{route.name}</h3>
                <span className="route-extra__count">{route.count} 个</span>
              </div>
              <p>{route.note}</p>
              <div className="chips chips--stack">
                {route.top.map((item) => (
                  <a
                    className="chip chip--link"
                    key={item.id}
                    href={`#/repo/${encodeURIComponent(item.id)}`}
                  >
                    {item.name}
                    {typeof item.rank === 'number' ? <span className="chip__rank">#{item.rank}</span> : null}
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section
        id="decide"
        index={3}
        title="怎么按任务选：决策树"
        lead="从你的任务出发，不需要先懂技术名词。"
      >
        <ul className="decisions">
          {cua.decisions.map((item) => (
            <li key={item.label}>
              <strong>{item.label}</strong>
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        id="tiers"
        index={4}
        title="推荐等级怎么读"
        lead="等级是研究结论，不是官方认证；它回答「值不值得优先评估」，不回答「能不能直接上线」。"
      >
        <div className="tier-meanings">
          {cua.tierMeanings.map((item) => (
            <div className="tier-meanings__item" key={item.tier}>
              <TierBadge tier={item.tier} showNote />
              <p>{item.meaning}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="case"
        index={5}
        title="真实案例：企业微信外部消息"
        lead="旧版调研的场景，用来展示「官方接口 + 人工确认」长什么样。它只是例子，不参与本页任何评分。"
      >
        <div className="case">
          <p className="case__verdict">
            <strong>结论：</strong>能走，但只能走「官方群发 + 本人确认」；无人值守批量群发不存在合规方案。
          </p>
          <ol className="facts facts--compact">
            {wecom.facts.map((fact, index) => (
              <li className="fact" key={fact.text}>
                <span className="fact__num" aria-hidden="true">
                  0{index + 1}
                </span>
                <div className="fact__body">
                  <p>{fact.text}</p>
                  <a
                    className="fact__source"
                    href={fact.source.url}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    来源：{fact.source.title}
                    <span aria-hidden="true"> ↗</span>
                  </a>
                </div>
              </li>
            ))}
          </ol>
          <p className="table-note">
            完整论证见 <code>_reports/wecom_research.md</code> 与 <code>_reports/wecom_solution_rank.md</code>；
            该结论只适用于企业微信，不代表其他软件。
          </p>
        </div>
      </Section>

      <Section id="sources" index={6} title="来源" lead="研究结论均可追溯到本地报告或官方文档。">
        <ul className="bullets">
          <li>
            <code>_reports/summary_report.md</code>：五条路线、档位分布、决策树与落地建议（本页主要依据）。
          </li>
          <li>
            <code>_reports/cua_top_list.md</code>：Top 30 与七个用途分组（首页用途入口的参考）。
          </li>
          <li>
            <code>data/cua_rank.json</code>：140 条全量排名、档位、路线与六维分数（列表与详情的主要依据）。
          </li>
          <li>
            企业微信案例：<code>_reports/wecom_research.md</code>、<code>_reports/wecom_solution_rank.md</code>{' '}
            及其中的官方链接（<ExternalLink href="https://developer.work.weixin.qq.com/">企业微信开发者中心</ExternalLink>）。
          </li>
        </ul>
      </Section>
    </div>
  );
}
