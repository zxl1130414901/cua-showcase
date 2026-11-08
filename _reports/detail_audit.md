# 详情档案审计报告（140 份）

- 审计对象：`F:\coding_cua\showcase\data\details\*.json`（140 份）
- 审计日期：2026-11-07
- 对照材料：`F:\coding_cua\manifest.json` 与各仓库 `F:\coding_cua\<owner>__<repo>` 下的 README、源码、配置
- 审计脚本：`F:\coding_cua\_scripts\audit_details.py`
- 初筛基线：`F:\coding_cua\_tmp\C1\audit_before.json`（修改前快照）

## 一、审计方法

1. **机器初筛（宽口径，宁多勿漏）**
   - 结构：JSON 可解析、20 个顶层字段齐全且无增删、无 null/空值、类型正确（字符串 / 字符串数组 / evidence 对象数组 / compareTips / scores）、`id` 与文件名一致。
   - 字数：`taglineZh≤30`、`summaryZh 150–250`、`whatItDoesZh 120–220`、`techApproachZh 100–200`、`limitsZh 80–160`、`wecomUseZh 60–140`、`maturityZh 60–140`、`successRateZh 60–140`。
   - 空话：扫描 `prosZh`/`consZh` 中的「功能强大、易于使用、社区活跃、生态完善、开箱即用、用户友好」等无事实支撑词，并检测「跨平台/仅支持 Windows」「免费/付费」等自相矛盾组合。
   - apps：扫描「各种应用、大部分软件、任意应用」等不可验证表述。
   - 平台：`platformsZh` 与 `techApproachZh` 的技术族（UIAutomation / AppleScript / AT-SPI / CDP）互斥检测；`requirementsZh` 与 `appsZh` 中出现的平台是否被 `platformsZh` 覆盖。
   - 成功率：出现百分比时检查是否有 README/论文/官方/自述等来源；无来源且未声明「无公开成功率数据」的标记。
   - 边界：`limitsZh` 是否含登录态、验证码、权限、多显示器、风控、版本、窗口、环境等具体边界词。
   - 证据：解析 `source` 到本地仓库真实文件（先按相对路径，再按 basename 兜底遍历），`quote` 做 CRLF 归一后要求**逐字命中**；仅空白折叠后命中的视为不合格。
2. **人工复核**
   - 对 E/F/G 的初筛命中逐条阅读原文，区分「真冲突」与「宿主环境说明、否定句、文档引用」等误报。
   - 对每个确认问题回到仓库 README/代码核对事实后再改写，不凭印象补内容。
   - 额外做 `appsZh`↔`platformsZh` 交叉核对，补出初筛未覆盖的平台漏列。
3. **只改确认不合格的条目**，不改字段契约、不增删字段、不写 null、不删档案。

## 二、问题分布（初筛命中与复核结论）

| 检查点 | 初筛命中条目 | 初筛命中条数 | 复核确认 | 处置 |
|---|---|---|---|---|
| A 结构/类型 | 0 | 0 | 0 | — |
| B 字数越界 | 28 | 47 | 47 个字段 | 全部压缩回区间 |
| C 空话/矛盾 | 5 | 5 | 5 | 全部改写为可核对事实 |
| D apps 泛化 | 1 | 1 | 1 | 改为具体可操作对象 |
| E 平台矛盾 | 23 | 24 | 13 份真冲突 | 另交叉核对新增 10 份，共改 23 份 |
| F 成功率 | 20 | 21 | 5 份表述不完整 | 未发现编造百分比；补「无公开数据/自测」表述 |
| G 边界 | 33 | 33 | 0 | 均为关键词表过窄造成的误报，档案不改 |
| H 证据 | 4 | 5 | 4 份 / 5 条 quote | 改为单行逐字片段 |

说明：E 的 23 份初筛命中里，10 份属于「requirements 提到但明确不支持 / 属于宿主机 / 属于服务器部署」等合理表述；F 的 20 份百分比全部能追到 README、论文或作者自述，不存在凭空数字；G 的 33 份 limitsZh 均写了具体边界（界面类型、权限、验证码、窗口/焦点、版本、容器、集群等），是脚本词表覆盖不足。

## 三、逐条修改清单（55 份 / 86 个字段）

| # | id | 改动字段 | 改动摘要 |
|---|---|---|---|
| 1 | Anionex__agent-vision-toolkit | summaryZh | 删去无证据的「核心论断」句，258→226 字 |
| 2 | ComputerUseAgent__AutoCua | whatItDoesZh | 合并手机驱动说明，237→217 字 |
| 3 | Meirtz__Shinken | maturityZh, successRateZh | maturity 141→139；SR 删去重复数字，154→139 |
| 4 | PavanVAkula__computer-use-capability-engine | successRateZh | 删去无来源的示例金额，改为「无公开数据 + 50 次回放自测」，154→104 |
| 5 | SouravBeraAkaSpeed__xiryn | taglineZh | 「Docker 隔离桌面加多 agent 编排…」压到 29 字 |
| 6 | TongUI-agent__TongUI-agent | techApproachZh | 补「训练与评测脚本全部开源」，99→109 字 |
| 7 | Tongyi-MAI__MAI-UI | limitsZh, successRateZh, platformsZh | limits 169→158；SR 144→136；platforms 增 Linux（apps 已声明 Linux 评测） |
| 8 | TurixAI__TuriX-CUA | successRateZh, platformsZh | SR 删括号分数字，146→134；platforms 由 Web 改为 macOS（limits 已注明实际是 macOS 桌面应用） |
| 9 | aditya-nadkarni__spongecake | taglineZh | 「Docker 里自建…」31→30 |
| 10 | agent-sh__computer-use-linux | summaryZh | 删除重复的「可在…环境」，255→250 |
| 11 | amontlabs__lcu | limitsZh | 删去与平台无关的补句，172→157 |
| 12 | anaishowland__agent-CE | summaryZh, whatItDoesZh, techApproachZh | 三字段分别压到 250 / 215 / 196 字，保留 episode、GCS、judge 事实 |
| 13 | awlevin__typesafe-computer-use | techApproachZh, successRateZh | tech 214→197；SR 149→132 |
| 14 | barkleyli__LVGL-UI-Automation-Framework | limitsZh | 合并平台说明，173→155 |
| 15 | firerpa__lamda | appsZh, maturityZh | apps「任意应用」→「已安装的 Android 应用」；maturity 144→132 |
| 16 | fyzhang1__ExpActivator | whatItDoesZh, techApproachZh, successRateZh | 分别压到 214 / 198 / 138 字 |
| 17 | huzjie__screenforge | successRateZh | 删去「指标全为 monotone」等冗余，158→136 |
| 18 | inclusionAI__UI-Venus | limitsZh, maturityZh, successRateZh | limits 166→150；maturity 141→136；SR 141→140 |
| 19 | microsoft__Hybrid-Computer-Use | platformsZh, whatItDoesZh, techApproachZh, maturityZh, successRateZh | platforms 增 macOS/Linux；其余四字段压回区间 |
| 20 | microsoft__Mage | taglineZh, platformsZh, limitsZh | tagline 32→29；platforms 增 Linux（apps 已声明 Linux 任务环境）；limits 同步改写 |
| 21 | microsoft__OmniParser | successRateZh | 144→128，明确 39.5% 是定位准确率而非任务成功率 |
| 22 | microsoft__magentic-ui | taglineZh, consZh | tagline 31→30；cons 去掉「开箱即用」空话，改为首次配置成本 |
| 23 | ranjitdontineni09__computer-use-runtime | summaryZh, techApproachZh, successRateZh | 分别压到 250 / 190 / 140 字 |
| 24 | showlab__ShowUI | summaryZh, whatItDoesZh | summary 251→237；whatItDoes 221→220 |
| 25 | steel-dev__steel-browser | summaryZh, platformsZh | summary 255→250；platforms 保持 Web，requirements 的 Linux 属无头宿主 |
| 26 | vercel-labs__ai-sdk-computer-use | taglineZh | 34→30 字 |
| 27 | xa11y__xa11y | summaryZh, whatItDoesZh, wecomUseZh, successRateZh | 四字段压回区间，保留 AX/AT-SPI/UIA 与选择器事实 |
| 28 | zai-org__CogAgent | summaryZh, successRateZh | summary 260→240；SR 150→137，删去「方差」等未给出的指标 |
| 29 | bytedance__UI-TARS-desktop | prosZh | 「39k 星，文档与社区活跃」→「39.6k 星，2026-10 仍在发版，文档覆盖桌面端与 CLI 安装」 |
| 30 | HenryXiaoYang__XYBot | prosZh, platformsZh | 「开箱即用」→「随仓库提供，装好即可启用」；platforms 增 Windows |
| 31 | iflytek__astron-rpa | prosZh | 「国内生态完善」→「官方提供中文文档与示例工程，组件清单列在仓库文档中」 |
| 32 | robotframework__robotframework | prosZh | 「库生态丰富」→ 点名 Selenium/Appium/White 三库覆盖 Web/移动/桌面 |
| 33 | 777genius__os-ai-computer-use | platformsZh | 去掉 Web（桌面客户端），改为 Windows/macOS/Linux |
| 34 | DaizeDong__grokbot-cdp | platformsZh, evidence | platforms Web→Windows/macOS/Linux；quote 改为单行逐字片段 |
| 35 | Xeakaes__computer-use-for-all-agents | platformsZh | 补 Linux（apps 已声明 Linux 桌面） |
| 36 | ctoldigital__axuse | platformsZh | 补 Android（apps 已声明 axdroid 设备） |
| 37 | dcc-mcp__dcc-cua | platformsZh | 补 macOS（requirements 与 apps 均已覆盖） |
| 38 | kanishka089__computer-use-mcp | platformsZh | Web→Windows（纯 Windows 桌面 MCP） |
| 39 | scottfly189__WeChatAuto.SDK | platformsZh | Web→Windows（limits 已注明实际只做 Windows SDK） |
| 40 | iFurySt__open-computer-use | platformsZh | 补 Windows/Linux（pros 与 requirements 均声明三平台） |
| 41 | instavm__clickclickclick | platformsZh | 补 macOS（apps 已声明 macOS 桌面） |
| 42 | droidrun__mobilerun | platformsZh, successRateZh | 补 iOS；SR 补「本场景无公开数据 + 50 次自测」 |
| 43 | sandraschi__windows-computer-use-mcp | platformsZh, successRateZh | 去掉 Web（React 控制台不是被操作平台）；SR 补「无公开数据 + 自测」 |
| 44 | CelestoAI__celesto | platformsZh | Web→Linux/macOS/Web（本地宿主与云端 API） |
| 45 | wwwzzzxxx__winch-opencode-computer-use-mcp | successRateZh | 补「无公开成功率数据」与 50 次控件定位自测 |
| 46 | FluidInference__FluidUse | successRateZh, evidence | SR 补「无公开」措辞；两条 quote 改为单行逐字片段 |
| 47 | alper-han__CrossMacro | evidence | quote 改为单行逐字片段（原文跨行导致仅空白命中） |
| 48 | vercel-labs__agent-desktop | evidence | 同上，改为 snapshot 段首单行片段 |
| 49 | zavora-ai__computer-use-mcp | platformsZh | 补 Linux（requirements 与 README 均声明支持） |
| 50 | A9T9__RPA | platformsZh | 补 Windows（apps 已声明 XModules 桌面应用） |
| 51 | injaneity__pi-computer-use | platformsZh | 补 Linux（apps 已注明仓库声明支持） |
| 52 | shortsspectrumai-del__flash-computer-use | platformsZh | Web→Web/Windows/macOS/Linux（README 明确三平台无障碍接口） |
| 53 | sjkncs__gui-agent-framework | platformsZh | Web→Web/Windows/macOS/Linux（pyautogui 桌面通道） |
| 54 | xlang-ai__OSWorld | platformsZh | 补 Windows（README 的 `os_type` 支持 Ubuntu/Windows 虚拟机） |
| 55 | cs-lazy-tools__ChatGPT-On-CS | successRateZh | 补「无公开成功率数据」，保留 20 条真实咨询自测方案 |

字段分布（第一轮）：platformsZh 23、successRateZh 18、summaryZh 8、techApproachZh 6、whatItDoesZh 6、limitsZh 5、taglineZh 5、prosZh 4、maturityZh 4、evidence 4（5 条 quote）、appsZh 1、consZh 1、wecomUseZh 1。

## 四、复核结果

在全部修改完成后运行：

```
python F:\coding_cua\_scripts\audit_details.py F:\coding_cua\_tmp\C1\audit_final.json
```

输出：

```
files 140 files_with_issue 0
按条目命中数(去重):
  A_结构       0
  B_字数       0
  C_空话矛盾     0
  D_apps泛化   0
  E_平台矛盾     0
  F_成功率      0
  G_边界       0
  H_证据       0
```

复核覆盖 140 份档案、20 个顶层字段、8 个字数区间（共 1120 个长度值）。结果：140/140 JSON 可解析，字段齐全且无增删、无 null/空值、类型合规，全部字数在区间内，证据 quote 在本地仓库文件中逐字命中。

## 五、最终统计

- 修改档案：**60 份 / 140 份**
- 修改字段：**96 个**（另有 5 条 evidence quote 的重写）
- 按检查点确认问题：字数 47、空话矛盾 5、apps 泛化 1、平台字段 27（其中宿主口径统一涉及 9 份 / 10 个字段）、成功率表述 5、证据 5
- 未修改的初筛命中：E 10 份、F 16 份、G 33 份，均为宿主/否定句/有来源基准/边界词表误报
- 复核后机器可检问题：**0**

### 原仍存疑条目（已由第六节按宿主口径统一处理）

1. `CelestoAI__celesto`：apps 含 Windows 客户机，platforms 只列 Linux/macOS/Web；Windows 是虚拟机 guest，不是宿主运行平台，未强行加入。
2. `arcboxlabs__arcbox`：apps 含 Linux 虚拟机，platforms 只列 macOS；同上，属 guest 与 host 的区别。
3. `SouravBeraAkaSpeed__xiryn`：requirements 列 macOS/Windows 宿主机，platforms 只列容器内 Linux 桌面；「可操作环境」与「宿主」两种口径并存。
4. `TurixAI__TuriX-CUA`：requirements 提到 Windows/Linux 分支，但 limits 明说分支未验证，platforms 保持 macOS。
5. `masone__iphone-cua`：requirements 的 macOS 是主机（Xcode/Appium），被操作对象是 iOS，platforms 保持 iOS。
6. `mochat-cloud__mochat`：Linux 是服务器部署环境，platforms 标 Web（SaaS 接口）。
7. `steel-dev__steel-browser`：Linux 是无头运行宿主，platforms 标 Web。
8. `pywinauto__pywinauto`：Linux 仅输入模拟模块，platforms 标 Windows（核心控件层是 Windows）。
9. `freeall12__computer-use`：requirements 的 macOS 只是部分文档引用的专有路径，platforms 标 Web。

以上 9 条已在第六节按「宿主/部署系统」口径重标；原描述保留作为问题记录。

## 六、platforms 口径统一

统一口径：**`platformsZh` = 你需要在什么系统上运行/部署它，不是它内部能操作什么系统。**

- 宿主与 guest/容器分离：`platformsZh` 只写宿主；guest、容器内系统写入 `requirementsZh` 或 `limitsZh`。
- 主机与被操作对象分离：`platformsZh` 只写主机；被操作对象留在 `appsZh`。
- 服务器/无头部署：按实际可运行环境写，如「Linux 服务器 + Web 访问」，不单写 `Web`。
- 局部模块：只保留核心可用系统，模块级能力写入 `limitsZh`。

| # | id | 原 platformsZh | 新 platformsZh | 配套说明 |
|---|---|---|---|---|
| 1 | CelestoAI__celesto | Linux / macOS / Web | 不变：Linux / macOS / Web | limits 补「Windows/macOS 客户机是 guest，不是宿主」；Windows 虚拟机保留在 appsZh |
| 2 | arcboxlabs__arcbox | macOS | 不变：macOS | requirements 补「Linux 与 Windows 仅为客户机或容器，宿主仅 macOS」 |
| 3 | SouravBeraAkaSpeed__xiryn | Linux | macOS / Linux / Windows | 宿主按 Docker Desktop 三平台写；「容器内是 Linux 桌面」保留在 limitsZh 与 appsZh |
| 4 | steel-dev__steel-browser | Web | Linux / Web | Linux 为无头运行宿主，Web 为访问方式；Xvfb 说明保留在 requirementsZh |
| 5 | freeall12__computer-use | Web | 不变：Web | requirements 改为「分册分析 macOS 实现，不代表运行环境需要 macOS」，避免把内容对象当宿主 |
| 6 | masone__iphone-cua | iOS | macOS | 宿主是 macOS（Xcode/Appium）；iPhone 与 iOS App 保留在 appsZh；limits 补「被操作对象是 iPhone，不是宿主」 |
| 7 | TurixAI__TuriX-CUA | macOS | 不变：macOS | requirements 改为「Windows 与 Linux 分支未验证，不计入平台标注」，未验证分支不进 platformsZh |
| 8 | mochat-cloud__mochat | Web | Linux / Web | Linux 为部署环境，Web 为访问方式 |
| 9 | pywinauto__pywinauto | Windows | 不变：Windows | limits 补「Linux 仅输入模拟模块可用，控件层只支持 Windows」 |

本轮改动 9 份档案、10 个字段：`platformsZh` 4 个（xiryn、steel、masone、mochat），`limitsZh` 3 个（Celesto、masone、pywinauto），`requirementsZh` 3 个（arcbox、freeall12、Turix）。

复核（`audit_details.py`，快照 `F:\coding_cua\_tmp\C1\audit_platform.json`）：

```
files 140 files_with_issue 0
A_结构 0  B_字数 0  C_空话矛盾 0  D_apps泛化 0
E_平台矛盾 0  F_成功率 0  G_边界 0  H_证据 0
```

140/140 JSON 可解析，20 个字段齐全、无 null/空值，全部字数在区间内，evidence quote 逐字命中。
