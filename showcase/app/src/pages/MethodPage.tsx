import { cua, meta, repos } from '../data';
import { rankRepos } from '../lib/relevance';
import { formatDate, typeLabel } from '../lib/format';
import { Section, TierBadge } from '../components/ui';

const DIMENSIONS = [
  { key: 'coverage', label: '覆盖能力', desc: '能覆盖多少目标场景与应用。10 分代表覆盖面最广。' },
  { key: 'usability', label: '易用性', desc: '从零到跑起来要多久：安装、配置、写脚本的门槛。10 分代表几乎开箱即用。' },
  { key: 'docs', label: '文档', desc: '文档是否完整、是否有可照抄的示例。10 分代表看文档就能上手。' },
  { key: 'maintenance', label: '维护活跃', desc: '最近是否还在更新、Issue 是否有人回。10 分代表高频维护。' },
  { key: 'stability', label: '稳定性', desc: '目标软件改版后还能不能跑。10 分代表长期稳定。' },
  { key: 'breadth', label: '通用性', desc: '是否跨平台、跨软件，还是只能服务一个特定产品。10 分代表适用面最广。' },
];

const TERMS = [
  ['CUA', 'Computer Use Agent：让 AI 像人一样看屏幕、点鼠标、敲键盘来操作电脑。'],
  ['RPA', 'Robotic Process Automation：按预先写好的固定步骤模拟人操作软件，不会自己判断。'],
  ['UI Automation / 无障碍树', '操作系统提供的「读界面控件」能力。能按控件名点击，比固定坐标稳，但遇到自绘界面会失效。'],
  ['浏览器自动化', '通过浏览器调试协议直接控制网页，比如 Playwright、Selenium；网页任务里最稳、最便宜的一条路。'],
  ['屏幕视觉 + 坐标点击', '截图交给模型判断，再按像素坐标点击。通用性最强，但界面一改版就容易点偏。'],
  ['Hook / 协议破解', '直接改客户端内存或模拟私有协议。看起来最自动，但违反平台协议，有封号与法律风险。'],
  ['Agent 框架', '负责拆任务、排顺序、调工具的框架；本身不一定能操作界面，要配执行层才有手。'],
  ['成功率', '本站在缺少可复现证据时不采用百分比；档案里的成功率说法会原样展示，供你自行核验。'],
];

export function MethodPage() {
  const ranked = rankRepos(repos);
  const sample = ranked.find((item) => item.repo.hasDetail) ?? ranked[0];
  const breakdown = sample
    ? sample.breakdown
    : {
        coverage: 0,
        usability: 0,
        docs: 0,
        maintenance: 0,
        stability: 0,
        riskPenalty: 0,
      };

  return (
    <div className="page page--method">
      <header className="page-head">
        <p className="eyebrow">口径说明</p>
        <h1>综合分怎么算，数据从哪来</h1>
        <p className="page-head__lead">
          这一页解释所有排序和标签的依据：综合分、推荐等级、技术路线、筛选维度、数据来源与已知局限。看不懂技术细节也没关系，至少能判断「这个排名值不值得信」。
        </p>
      </header>

      <Section
        id="formula"
        index={1}
        title="综合分（0–100）"
        lead="排名文件存在时直接采用其分数；这里展示的是文件缺失时的本地兜底公式，便于你复核。"
      >
        <div
          className="formula"
          role="img"
          aria-label="本地兜底公式：覆盖 35 分，易用 25 分，文档 15 分，维护 15 分，稳定 10 分，减去最多 15 分风险扣分"
        >
          <span className="formula__part formula__part--base">覆盖 35</span>
          <span aria-hidden="true">+</span>
          <span className="formula__part formula__part--quality">易用 25</span>
          <span aria-hidden="true">+</span>
          <span className="formula__part formula__part--fresh">文档 15 + 维护 15 + 稳定 10</span>
          <span aria-hidden="true">−</span>
          <span className="formula__part formula__part--risk">风险扣分（≤15）</span>
        </div>
        <div className="table-wrap">
          <table className="table table--method">
            <caption className="sr-only">本地兜底综合分各分项的计算方式</caption>
            <thead>
              <tr>
                <th scope="col">分项</th>
                <th scope="col">满分</th>
                <th scope="col">怎么算</th>
                <th scope="col">为什么这样定</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">覆盖</th>
                <td>35</td>
                <td>档案覆盖分（0–10）× 3.5</td>
                <td>能不能完成你的任务，永远是第一位的。</td>
              </tr>
              <tr>
                <th scope="row">易用</th>
                <td>25</td>
                <td>易用分（0–10）× 2.5</td>
                <td>非技术团队能不能自己跑起来，决定落地成本。</td>
              </tr>
              <tr>
                <th scope="row">文档</th>
                <td>15</td>
                <td>文档分（0–10）× 1.5</td>
                <td>没有示例与说明，排障成本会翻倍。</td>
              </tr>
              <tr>
                <th scope="row">维护</th>
                <td>15</td>
                <td>维护分（0–10）× 1.5</td>
                <td>停更的自动化项目，交付即报废。</td>
              </tr>
              <tr>
                <th scope="row">稳定</th>
                <td>10</td>
                <td>稳定分（0–10）× 1.0</td>
                <td>界面改版后还能不能跑。</td>
              </tr>
              <tr>
                <th scope="row">风险扣分</th>
                <td>−15</td>
                <td>含 hook / 注入 / 破解 / 多开等关键词 −10；RPA 工具 −2，最多扣 15</td>
                <td>法律、账号与安全风险需要显式降权，而不是藏在正文里。</td>
              </tr>
            </tbody>
          </table>
        </div>
        {sample ? (
          <div className="example">
            <h3>算一个给你看：{sample.repo.name}</h3>
            <p>
              覆盖 {breakdown.coverage} + 易用 {breakdown.usability} + 文档 {breakdown.docs} + 维护{' '}
              {breakdown.maintenance} + 稳定 {breakdown.stability} − 风险 {breakdown.riskPenalty} ={' '}
              <strong>{sample.score}</strong> 分（本地兜底口径）。
            </p>
            <p className="table-note">{sample.reason}</p>
            {typeof sample.repo.rank === 'number' ? (
              <p className="table-note">
                页面上最终展示的是排名文件给出的{' '}
                <strong>
                  第 {sample.repo.rank} 名 / {sample.repo.score ?? sample.score} 分
                </strong>
                ；本地公式只在 cua_rank.json 缺失时使用。
              </p>
            ) : null}
          </div>
        ) : null}
        <p className="table-note">
          当前 <code>data/cua_rank.json</code> 提供 {meta.rankCount} / {meta.total} 条排名
          {meta.rankGeneratedAt ? `（生成于 ${formatDate(meta.rankGeneratedAt)}）` : ''}；
          {meta.rankCount > 0 ? '页面上的名次与分数以它为准。' : '全部由本地算法计算。'}
        </p>
      </Section>

      <Section
        id="scores"
        index={2}
        title="六维评分是什么意思"
        lead="评分范围 0–10，是研究读完仓库后的判断，不是官方评分，也不是成功率。"
      >
        <div className="defs">
          {DIMENSIONS.map((dim) => (
            <div className="def" key={dim.key}>
              <h3>{dim.label}</h3>
              <p>{dim.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="tiers"
        index={3}
        title="推荐等级与技术路线"
        lead="等级回答「值不值得先看」，路线回答「它靠什么操作电脑」。两者都不等于「能直接上线」。"
      >
        <div className="tier-meanings">
          {cua.tierMeanings.map((item) => (
            <div className="tier-meanings__item" key={item.tier}>
              <TierBadge tier={item.tier} showNote />
              <p>{item.meaning}</p>
            </div>
          ))}
        </div>
        <div className="chips">
          {cua.routes.map((route) => (
            <span className="chip chip--plain" key={route.name}>
              {route.name}（{route.count} 个）
            </span>
          ))}
        </div>
        <p className="table-note">
          路线名称来自 <code>cua_rank.json</code> 的 primaryRoute；完整对照见 <a href="#/routes">技术路线</a> 页。
        </p>
      </Section>

      <Section id="type" index={4} title="类型标签" lead="清单里的「类型」来自原始 manifest，不是 AI 猜的。">
        <div className="chips">
          {['framework', 'agent', 'wechat-specific', 'ui-library', 'rpa-tool', 'skill', 'dataset-benchmark', 'other'].map(
            (type) => (
              <span className="chip chip--plain" key={type}>
                {typeLabel(type)}（{type}）
              </span>
            ),
          )}
        </div>
      </Section>

      <Section id="data" index={5} title="数据来源与已知局限">
        <dl className="kv kv--wide">
          <div>
            <dt>项目清单</dt>
            <dd>
              <code>F:\coding_cua\manifest.json</code>，共 {meta.total} 条，构建时只读、不修改。
            </dd>
          </div>
          <div>
            <dt>中文档案</dt>
            <dd>
              <code>showcase\data\details\&lt;id&gt;.json</code>，当前已收录 {meta.detailCount} 份，缺{' '}
              {meta.missingDetailCount} 份。缺档案的项目用 manifest 字段兜底，详情页显示「档案整理中」。
            </dd>
          </div>
          <div>
            <dt>排名与档位</dt>
            <dd>
              <code>showcase\data\cua_rank.json</code>，含 rank、score、tier、primaryRoute、bestForZh、riskZh 与六维分。
            </dd>
          </div>
          <div>
            <dt>研究结论</dt>
            <dd>
              <code>_reports\summary_report.md</code>（通用九节）与 <code>_reports\cua_top_list.md</code>
              （Top 30 + 七个用途分组），构建时自动解析成技术路线、决策树与档位说明。
            </dd>
          </div>
          <div>
            <dt>构建时间</dt>
            <dd>{formatDate(meta.generatedAt)}（每次构建自动刷新）</dd>
          </div>
        </dl>
        <ul className="bullets">
          <li>中文档案由 AI 阅读仓库后整理，可能有个别理解偏差；涉及合规与封号的结论，以官方文档原文为准。</li>
          <li>「成功率」没有可信的公开数据；档案里的说法原样展示，不额外背书，也不换算成百分比排名。</li>
          <li>星标、更新时间是构建时的快照，不代表今天的状态。</li>
          <li>「需 GPU / 需付费 API / 中文友好」是按档案关键词推断的辅助维度，会有漏判与误判，已在筛选按钮上标注「估算」。</li>
          <li>企业微信相关内容只作为历史案例，出现在技术路线页与详情页折叠区，不参与评分。</li>
        </ul>
      </Section>

      <Section id="sort" index={6} title="排序、筛选与搜索口径" lead="所有列表共用同一套纯函数，便于复核。">
        <ul className="bullets">
          <li>默认按综合分降序；同分按 rank 升序，再按星标降序、名称排序，保证结果稳定。</li>
          <li>
            推荐等级来自排名文件的 tier：<strong>推荐</strong> 优先评估、<strong>可用</strong>{' '}
            有前提、<strong>谨慎</strong> 只适合试验、<strong>勿用</strong> 有法律/账号/安全风险或不建议上线。
            列表里同时显示图标与文字，不只靠颜色。
          </li>
          <li>
            筛选可按类型、平台、推荐等级、技术路线与三个通用维度组合；组与组之间是「且」，同一组内是「或」。
          </li>
          <li>
            搜索支持一句自然语言：会先去掉「我想 / 帮我 / 怎么」等词，再按「并 / 然后 / 和」拆句，并对「填表→表单/填写/录入」「群发→批量/发送」「手机→Android/iOS」等同义词扩展。
          </li>
          <li>
            搜索范围：项目名、中文定位、中文总结、能力、最适合场景、技术方案、原始简介、标签、可操作应用与使用场景。
          </li>
          <li>对比最多 4 个；差异行依据该维度文本是否完全一致判断，标「差异」而不只靠颜色。</li>
        </ul>
      </Section>

      <Section id="terms" index={7} title="术语表（给非技术读者）">
        <dl className="terms">
          {TERMS.map(([term, desc]) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{desc}</dd>
            </div>
          ))}
        </dl>
      </Section>
    </div>
  );
}
