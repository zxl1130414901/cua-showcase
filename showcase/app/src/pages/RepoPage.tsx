import { getRepo, getRepoByName, meta } from '../data';
import { formatDate, formatMonths, formatStars, tierKey } from '../lib/format';
import { scoreOf, scoreRepo } from '../lib/relevance';
import {
  EmptyDetail,
  ExternalLink,
  RouteTag,
  ScoreBar,
  Section,
  Stars,
  TierBadge,
  TypeBadge,
} from '../components/ui';

const SECTION_TITLES = [
  '定位',
  '一句话总结',
  '它到底能做什么',
  '能操作哪些应用',
  '技术方案',
  '落地步骤',
  '成功率与稳定性',
  '优点',
  '缺点',
  '边界与风险',
  '最适合的场景 / 谁不该用',
  '证据',
  '和谁比怎么选',
];

export function RepoPage({ id }: { id: string }) {
  const repo = getRepo(id);

  if (!repo) {
    return (
      <div className="page">
        <div className="notice notice--warn">
          <span className="notice__icon" aria-hidden="true">
            !
          </span>
          <div>
            找不到编号为「{id}」的项目，可能链接有误。
            <a className="link-button" href="#/all">
              回到完整清单
            </a>
          </div>
        </div>
      </div>
    );
  }

  const now = new Date();
  const scored = scoreRepo(repo, now);
  const fitScore = scoreOf(repo, now);

  return (
    <div className="page page--repo">
      <nav className="breadcrumb" aria-label="面包屑">
        <a href="#/">决策首页</a>
        <span aria-hidden="true">/</span>
        <a href="#/all">完整清单</a>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{repo.name}</span>
      </nav>

      <header className="repo-head">
        <div className="repo-head__main">
          <div className="repo-head__tags">
            <TierBadge tier={repo.tier} showNote />
            <RouteTag route={repo.primaryRoute} />
            <TypeBadge type={repo.cuaType} />
          </div>
          <h1>{repo.taglineZh || repo.name}</h1>
          <p className="repo-head__name">{repo.name}</p>
          {repo.summaryZh ? <p className="repo-head__summary">{repo.summaryZh}</p> : null}
        </div>
        <aside className="repo-head__side" aria-label="项目关键数据">
          <div className="metric">
            <span>综合分</span>
            <strong>{fitScore}</strong>
            <small>/ 100</small>
          </div>
          {typeof repo.rank === 'number' ? (
            <div className="metric metric--rank">
              <span>全库排名</span>
              <strong>第 {repo.rank} 名</strong>
              <small>/ {meta.total} 个项目</small>
            </div>
          ) : null}
          <div className="metric">
            <span>星标</span>
            <strong>{formatStars(repo.stars)}</strong>
          </div>
          <div className="metric">
            <span>最近更新</span>
            <strong>{formatDate(repo.pushedAt)}</strong>
            <small>{formatMonths(repo.pushedAt, now)}</small>
          </div>
          <div className="repo-head__actions">
            <a
              className="button button--primary button--small"
              href={`#/compare?ids=${encodeURIComponent(repo.id)}`}
            >
              加入对比
            </a>
            <ExternalLink href={repo.url} label={`在 GitHub 打开 ${repo.name}`}>
              GitHub
            </ExternalLink>
          </div>
        </aside>
      </header>

      {!repo.hasDetail ? (
        <>
          <EmptyDetail>
            <strong>档案整理中。</strong>
            这个项目的分区档案（技术方案、落地步骤、优缺点、证据等）还没写完，下面先展示清单里已有的基础信息，不影响你判断它是否值得进一步看。
          </EmptyDetail>
          <Section id="fallback" index={1} title="定位（来自原始清单）">
            {repo.description ? <p className="lead-text">{repo.description}</p> : null}
            <p className="muted">中文定位尚未整理，以下为基础信息。</p>
          </Section>
          <Section id="fallback-info" index={2} title="基础信息（来自原始清单）">
            <dl className="kv">
              <div>
                <dt>项目全名</dt>
                <dd>{repo.name}</dd>
              </div>
              <div>
                <dt>类型</dt>
                <dd>{repo.cuaType}</dd>
              </div>
              <div>
                <dt>平台</dt>
                <dd>{repo.platforms.join(' / ') || '未标注'}</dd>
              </div>
              <div>
                <dt>主要语言</dt>
                <dd>{repo.language || '未标注'}</dd>
              </div>
              <div>
                <dt>许可证</dt>
                <dd>{repo.license || '未标注'}</dd>
              </div>
              <div>
                <dt>星标 / Fork</dt>
                <dd>
                  <Stars value={repo.stars} /> / {formatStars(repo.forks)}
                </dd>
              </div>
              <div>
                <dt>创建时间</dt>
                <dd>{formatDate(repo.createdAt)}</dd>
              </div>
              <div>
                <dt>最近推送</dt>
                <dd>{formatDate(repo.pushedAt)}</dd>
              </div>
            </dl>
            {repo.description ? (
              <div className="prose-block">
                <h3>原始简介（英文）</h3>
                <p>{repo.description}</p>
              </div>
            ) : null}
            {repo.topics.length > 0 ? (
              <div className="chips">
                {repo.topics.map((topic) => (
                  <span className="topic" key={topic}>
                    #{topic}
                  </span>
                ))}
              </div>
            ) : null}
            <p className="table-note">
              已收录的档案分区将在重新构建后自动出现：{SECTION_TITLES.join(' / ')}。
            </p>
          </Section>
          <Section id="estimate" index={3} title="综合分（估算）">
            <p>
              档案未完成，当前按项目描述、标签与近 {formatMonths(repo.pushedAt, now)} 的活跃度估算；
              整理完成后会替换为具体结论。
            </p>
            <p className="table-note">
              估算分 {fitScore} 分：{scored.reason}
            </p>
          </Section>
        </>
      ) : (
        <>
          <Section id="position" index={1} title="定位">
            <dl className="inline-meta">
              <div>
                <dt>成熟度</dt>
                <dd>{repo.maturityZh || '未标注'}</dd>
              </div>
              <div>
                <dt>语言</dt>
                <dd>{repo.language || '未标注'}</dd>
              </div>
              <div>
                <dt>许可证</dt>
                <dd>{repo.license || '未标注'}</dd>
              </div>
              <div>
                <dt>星标</dt>
                <dd>
                  <Stars value={repo.stars} />
                </dd>
              </div>
            </dl>
            {repo.description ? (
              <div className="prose-block">
                <h3>仓库原始简介（英文）</h3>
                <p>{repo.description}</p>
              </div>
            ) : null}
          </Section>

          <Section id="summary" index={2} title="一句话总结">
            <p>{repo.summaryZh}</p>
          </Section>

          <Section id="what" index={3} title="它到底能做什么">
            <p>{repo.whatItDoesZh}</p>
            {repo.useCasesZh.length > 0 ? (
              <>
                <h3>典型使用场景</h3>
                <ul className="bullets">
                  {repo.useCasesZh.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </>
            ) : null}
          </Section>

          <Section id="apps" index={4} title="能操作哪些应用">
            {repo.appsZh.length > 0 ? (
              <div className="chips">
                {repo.appsZh.map((app) => (
                  <span className="chip chip--plain" key={app}>
                    {app}
                  </span>
                ))}
              </div>
            ) : (
              <p className="muted">档案未列出具体应用。</p>
            )}
            <dl className="inline-meta">
              <div>
                <dt>支持平台</dt>
                <dd>{repo.platformsZh.join(' / ') || repo.platforms.join(' / ') || '未标注'}</dd>
              </div>
            </dl>
          </Section>

          <Section id="tech" index={5} title="技术方案">
            <p>{repo.techApproachZh || '档案未说明技术方案。'}</p>
            {repo.requirementsZh.length > 0 ? (
              <>
                <h3>使用门槛 / 前置条件</h3>
                <ul className="bullets">
                  {repo.requirementsZh.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </>
            ) : null}
          </Section>

          <Section id="steps" index={6} title="落地步骤">
            {repo.howToUseZh ? (
              <p className="callout">
                <span className="callout__label">怎么用起来</span>
                {repo.howToUseZh}
              </p>
            ) : null}
            {repo.stepsZh.length > 0 ? (
              <ol className="ordered">
                {repo.stepsZh.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            ) : (
              <p className="muted">档案未给出落地步骤。</p>
            )}
          </Section>

          <Section id="success" index={7} title="成功率与稳定性">
            <p>{repo.successRateZh || '档案未给出成功率说法。任何「99% 成功率」的宣传都要求对方提供可复现依据。'}</p>
            <div className="scores">
              <ScoreBar label="覆盖能力" value={repo.scores.coverage} />
              <ScoreBar label="易用性" value={repo.scores.usability} />
              <ScoreBar label="文档" value={repo.scores.docs} />
              <ScoreBar label="维护活跃" value={repo.scores.maintenance} />
              <ScoreBar label="性能" value={repo.scores.performance} />
              <ScoreBar label="稳定性" value={repo.scores.stability} />
            </div>
            <p className="table-note">评分为档案整理者的 1–10 分主观判断，含义见「口径说明」页。</p>
          </Section>

          <Section id="pros" index={8} title="优点">
            {repo.prosZh.length > 0 ? (
              <ul className="bullets">
                {repo.prosZh.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="muted">档案未列出优点。</p>
            )}
          </Section>

          <Section id="cons" index={9} title="缺点">
            {repo.consZh.length > 0 ? (
              <ul className="bullets bullets--bad">
                {repo.consZh.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="muted">档案未列出缺点。</p>
            )}
          </Section>

          <Section id="limits" index={10} title="边界与风险">
            <p>{repo.limitsZh || '档案未说明边界。'}</p>
            {repo.riskFlags.length > 0 ? (
              <div className="notice notice--bad">
                <span className="notice__icon" aria-hidden="true">
                  ×
                </span>
                <div>
                  实现方式包含 <strong>{repo.riskFlags.join('、')}</strong>{' '}
                  类关键词，可能违反目标软件的服务条款，带来账号封禁或法律风险。用于生产前请先确认授权与合规性。
                </div>
              </div>
            ) : null}
          </Section>

          <Section id="fit" index={11} title="最适合的场景 / 谁不该用">
            <div className="fit-block">
              <div className="fit-block__col">
                <h3 className="fit-block__title">最适合</h3>
                <p>{repo.bestForZh || '档案未单独给出适用场景，请参考上面的「能做什么」与「落地步骤」。'}</p>
                {repo.capabilityZh ? (
                  <p className="table-note">它的核心能力：{repo.capabilityZh}</p>
                ) : null}
              </div>
              <div className="fit-block__col fit-block__col--risk">
                <h3 className="fit-block__title">谁不该用</h3>
                <p>{repo.riskZh || repo.limitsZh || '档案未单独列出不适用人群。'}</p>
                {typeof repo.rank === 'number' ? (
                  <div className={`relation-rank relation-rank--${tierKey(repo.tier) ?? 'none'}`}>
                    <span className="relation-rank__label">全库位置</span>
                    <strong>
                      第 {repo.rank} 名 / 综合分 {fitScore}
                    </strong>
                    {repo.tier ? <TierBadge tier={repo.tier} showNote /> : null}
                  </div>
                ) : null}
              </div>
            </div>
            {repo.subScores ? (
              <div className="subscores">
                <h3 className="fit-block__title">研究的六维打分（0–10）</h3>
                <div className="subscores__grid">
                  {[
                    ['覆盖', repo.subScores.coverage],
                    ['易用', repo.subScores.usability],
                    ['文档', repo.subScores.docs],
                    ['维护', repo.subScores.maintenance],
                    ['稳定', repo.subScores.stability],
                    ['通用', repo.subScores.breadth],
                  ].map(([label, value]) => (
                    <div className="subscore" key={String(label)}>
                      <span>{label}</span>
                      <div className="bar" aria-hidden="true">
                        <span style={{ width: `${(Number(value) / 10) * 100}%` }} />
                      </div>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>
                {repo.subScores.riskPenalty > 0 ? (
                  <p className="table-note">风险扣分：−{repo.subScores.riskPenalty} 分。</p>
                ) : null}
              </div>
            ) : null}
          </Section>

          <Section id="evidence" index={12} title="证据">
            {repo.evidence.length > 0 ? (
              <ul className="evidence">
                {repo.evidence.map((item) => (
                  <li key={`${item.claim}-${item.source}`}>
                    <p className="evidence__claim">{item.claim}</p>
                    {item.quote ? <blockquote>{item.quote}</blockquote> : null}
                    <p className="evidence__source">
                      来源：
                      {/^https?:\/\//.test(item.source) ? (
                        <ExternalLink href={item.source}>{item.source}</ExternalLink>
                      ) : (
                        <span>{item.source || '未标注'}</span>
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">档案未附证据条目；建议直接看仓库文档与 Issue，不要只看 README 宣传。</p>
            )}
          </Section>

          <Section id="compare" index={13} title="和谁比怎么选">
            {repo.compareTips.whenZh ? <p>{repo.compareTips.whenZh}</p> : null}
            {repo.compareTips.vs.length > 0 ? (
              <div className="chips">
                {repo.compareTips.vs.map((name) => {
                  const target = getRepoByName(name) || getRepo(name);
                  return target ? (
                    <a className="chip chip--link" key={name} href={`#/repo/${encodeURIComponent(target.id)}`}>
                      对比 {target.name} <span aria-hidden="true">→</span>
                    </a>
                  ) : (
                    <span className="chip chip--plain" key={name}>
                      {name}
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="muted">档案未给出同类对比对象。</p>
            )}
            <p className="table-note">
              当前档案最后更新：{formatDate(repo.pushedAt)}（仓库推送时间）。
            </p>
          </Section>

          {repo.wecomUseZh ? (
            <details className="legacy-case">
              <summary>历史场景举例（企业微信）</summary>
              <p>{repo.wecomUseZh}</p>
              <p className="table-note">
                此段仅为旧版调研留下的用法示例，不参与综合分、推荐等级与筛选。
              </p>
            </details>
          ) : null}
        </>
      )}
    </div>
  );
}
