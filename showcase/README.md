# CUA 选型决策台

给非技术读者的离线决策站点：先判断「要操作什么」（网页 / Windows / macOS / 手机 / 文档），再在 140 个 CUA、RPA、Agent 开源项目里挑合适的方案，并直接看到每个项目的优劣、最大风险与全库排名。

- 决策首页：`#/`
- 完整清单：`#/all`
- 项目详情：`#/repo/<id>`
- 项目对比：`#/compare?ids=<id>,<id>`
- 技术路线：`#/routes`
- 口径说明：`#/method`

## 怎么用

直接双击打开：

```
F:\coding_cua\showcase\app\dist\index.html
```

`dist/index.html` 是**单文件离线产物**：CSS / JS / 数据全部内联，不需要联网、不需要起服务器，也不依赖任何 CDN 或外部字体。页面里的「来源」链接是外部链接，只有点开时才需要网络。

## 目录

```
F:\coding_cua\showcase
├─ app\                     # Vite + React + TypeScript 工程
│  ├─ src\
│  │  ├─ lib\               # 纯函数：评分、筛选排序、自然语言搜索、路由、格式化
│  │  ├─ pages\             # 6 个页面（首页/清单/详情/对比/技术路线/口径）
│  │  ├─ components\        # 复用组件（等级徽章、路线标签、风险块、章节等）
│  │  ├─ data\              # generated.json（构建产物，勿手改）
│  │  └─ styles.css
│  ├─ scripts\
│  │  ├─ build-data.mjs     # manifest + details + cua_rank + 报告 → generated.json
│  │  ├─ inline-html.mjs    # 把 Vite 产物压成单文件
│  │  └─ verify.mjs         # Playwright(file://) 实测 + 截图
│  └─ dist\index.html       # 交付产物
├─ data\
│  ├─ details\<id>.json     # 140 份中文档案
│  └─ cua_rank.json         # 140 条全量排名（rank/score/tier/primaryRoute/capabilityZh/bestForZh/whyZh/riskZh/subScores），优先采用
├─ shots\                   # 实测截图（首页/清单/详情/对比/技术路线/口径）
├─ docs\DESIGN.md           # 信息架构、排序理由、评分算法
└─ README.md
```

上游只读数据：

- `F:\coding_cua\manifest.json`（140 条原始清单）
- `F:\coding_cua\_reports\summary_report.md`（通用版九节汇总：五条路线、档位分布、决策树）
- `F:\coding_cua\_reports\cua_top_list.md`（Top 30 + 七个用途分组）
- `F:\coding_cua\data\cua_rank.json`（140 条排名）

构建脚本不会修改以上任何文件。

## 构建

环境：Node.js 20+（开发时使用 Node 24）。

```powershell
cd F:\coding_cua\showcase\app
npm install --cache F:\coding_cua\_tmp\npm-cache
npm run build
```

`npm run build` 依次执行：

1. `node scripts/build-data.mjs`：合并数据；
2. `tsc --noEmit`：TypeScript strict 类型检查；
3. `vite build`：产出 `app.js` / `app.css`（IIFE，无 ESM）；
4. `node scripts/inline-html.mjs`：内联为单文件，并校验：
   - 无 `type="module"`
   - 无 `crossorigin`
   - 无 `import.meta`
   - 无外部 `<script src>` 或样式表

其它命令：

```powershell
npm run dev        # 本地开发（先跑数据脚本）
npm test           # Vitest：评分 / 排序 / 筛选 / 自然语言搜索 / 路由
npm run lint       # ESLint
npm run typecheck  # 仅类型检查
node scripts/verify.mjs   # 需已安装 Edge：file:// 实测 + 截图
```

## 数据合并规则

- 以 `manifest.json` 的 140 条为主键；
- 读取 `data/details/<id>.json`，id 既支持 manifest 的数字 id，也支持 `owner__repo` 文件名形式；
- 缺失档案时：`hasDetail: false`，列表用 manifest 字段兜底，详情页显示「档案整理中」而不是白屏；
- `data/cua_rank.json` 存在时，其 `rank`、`score`、`tier`、`primaryRoute`、`capabilityZh`、`bestForZh`、`whyZh`、`riskZh`、`subScores` 全部优先采用；本地算法仅在该文件缺失时兜底。当前 140/140 条均来自该文件；
- 推荐等级（推荐 / 可用 / 谨慎 / 勿用）与技术路线直接显示在清单与详情页，「勿用」额外附「（有封禁风险）」文字警示；
- 通用筛选维度 `needGpu` / `needPaidApi` / `chineseFriendly` 由档案文本关键词估算，页面标注为估算口径；
- `summary_report.md` 在构建时被解析为：三条硬事实、五条技术路线（原理 / 适合谁 / 开发量 / 稳定性 / 风险）、三类补充路线、决策树与档位含义；
- 企业微信相关内容只保留在技术路线页的「真实案例」一节与详情页折叠的「历史场景举例」，不参与评分、等级与筛选。

档案随时可能被其它会话补写，重新执行 `npm run build` 即可自动吸收，无需改代码。

## 数据更新后

1. 重新 `npm run build`；
2. 可选：`node scripts/verify.mjs` 复跑实测并刷新 `shots/`；
3. 打开 `dist/index.html` 确认首页统计与「已整理中文档案」数量已变化。

## 当前数据与产物

| 项目 | 数值 |
| --- | --- |
| 原始清单 | 140 条 |
| 中文档案 | 140 份（缺失 0 份） |
| 排名数据 | 140 条（`cua_rank.json`，rank 1–140） |
| 推荐等级分布 | 推荐 5 / 可用 45 / 谨慎 61 / 勿用 29 |
| 技术路线 | 5 条主路线 + 3 类补充 |
| 单文件产物 | `dist/index.html`，约 1224 KB（1,253,239 字节） |
| 自动化检查 | 类型检查通过、ESLint 0 报错、单元测试 23/23、实测 24 组页面×宽度无溢出、控制台 0 error |

## 已知局限

- 中文档案由 AI 阅读仓库后整理，可能有个别理解偏差；结论以官方文档原文为准。
- 没有可信的公开「成功率」数据，页面不转述档案里无法核实的百分比。
- 星标与更新时间是构建时快照。
- `needGpu` / `needPaidApi` / `chineseFriendly` 是关键词估算，可能漏判，页面已标注。
- 排名文件的 tier / primaryRoute 是研究结论，不等同于官方认证；「推荐」只表示值得优先评估，不代表可直接上线。
- 综合分是相对排序，不是成功率；同一路线内部差距小的时候不要过度解读名次。

更详细的设计与算法说明见 [docs/DESIGN.md](docs/DESIGN.md)。
