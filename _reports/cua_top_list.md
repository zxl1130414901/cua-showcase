# 通用 CUA 能力榜单（Top 30）

> 口径：不看单一聊天场景，只看「真正能操作到什么程度」。全库 140 个仓库统一评分，权重为覆盖面 34%、易用性 22%、文档 10%、维护 10%、稳定性 10%、平台广度 6%、风险扣分 8%。四档定义为：推荐、可用、谨慎、勿用。

## 一、Top 30

| 名次 | 项目 | 路线 | 分数 | 一句话能干什么 | 最大风险 |
|---|---|---|---|---|---|
| 1 | browser-use/browser-use | 浏览器自动化 | 88.90 | 用自然语言驱动浏览器完成多步网页操作，支持点击、填表、取数与下载。 | 验证码与登录风控会导致点错或卡死；高危动作需加审批。 |
| 2 | simular-ai/Agent-S | 屏幕视觉+坐标点击 | 88.14 | 看屏幕、推理并执行鼠标键盘动作，支持多代理协作与跨应用长任务。 | 无业务级结果校验，误操作直接落盘；建议先干跑。 |
| 3 | appium/appium | 官方 API/SDK | 87.36 | 用 WebDriver 协议驱动 Android 与 iOS 应用，查找元素并点击输入。 | 驱动与系统版本不匹配会整批失败；自绘界面不可用。 |
| 4 | bytedance/UI-TARS-desktop | 屏幕视觉+坐标点击 | 85.94 | 多模态模型看屏幕后直接控制鼠标键盘，完成桌面多步任务。 | 模型服务与网络依赖；误点无回滚，敏感操作需人工确认。 |
| 5 | firerpa/lamda | 无障碍树 | 85.70 | Android 全栈设备控制，按文本、ID 或图像定位控件并可远程看屏。 | 依赖设备端服务与系统权限；高负载下远程画面掉帧。 |
| 6 | agent-sh/computer-use-linux | 无障碍树 | 83.34 | Wayland 可用的 Linux 桌面 MCP，按角色名称定位并操作窗口。 | 输入权限缺失时动作被静默丢弃；合成器差异。 |
| 7 | Yu-tao-Li/dsh-computer-use-win | 无障碍树 | 83.31 | 给指定代理宿主的 Windows 桌面插件，按观察、定位、执行、确认循环。 | 宿主绑定，迁移成本高；识别漏字导致定位失败。 |
| 8 | vercel-labs/agent-desktop | 无障碍树 | 82.10 | 读取系统无障碍树，按角色或名称定位并操作 macOS 应用。 | 系统授权缺失即不可用；同名控件易歧义，需唯一性校验。 |
| 9 | droidrun/mobilerun | Agent 框架 | 82.07 | 自然语言驱动 Android 与 iOS 真机，执行点击、滑动、输入等多步任务。 | 厂商系统差异导致定位失败；基准分数口径需核对。 |
| 10 | microsoft/Hybrid-Computer-Use | 无障碍树 | 82.06 | 给编码代理的双通道桌面 MCP，统一命令行、SDK 与守护进程。 | 批内一步超时会导致整批部分完成；需分步校验。 |
| 11 | nano-muse/nanoMuse | Agent 框架 | 81.60 | 跨端个人智能体运行时，提供会话记忆、定时任务、语音与技能。 | 权限被回收会读到旧画面；中继断连即失联。 |
| 12 | iflytek/astron-rpa | RPA/工作流 | 81.46 | 可视化拖拽搭建 RPA 流程，支持元素拾取、录制、分支与日志。 | 以 Windows 为主，跨平台能力未充分声明。 |
| 13 | ArtisanCloud/PowerWeChat | 官方 API/SDK | 80.66 | 多端开发 SDK，覆盖通讯录、应用消息、客户联系与支付。 | 权限需企业认证；SDK 落后官方接口时需自行补。 |
| 14 | wechatpy/wechatpy | 官方 API/SDK | 80.63 | 覆盖公众号与企业级通讯录、应用消息、客户联系的 Python SDK。 | 权限需企业认证；接口废弃后需等库更新。 |
| 15 | xa11y/xa11y | 无障碍树 | 80.50 | 跨平台桌面无障碍驱动库，按角色名称定位并操作实时窗口。 | 权限缺失只能读菜单栏；无控件界面直接失效。 |
| 16 | WecomTeam/wecom-cli | 官方 API/SDK | 80.47 | 官方命令行工具，配置机器人后收发消息、读写文档与日程。 | 接口权限与范围受限；普通员工无法自行开通。 |
| 17 | munimtechnologies/munim-computer-use | 无障碍树 | 80.40 | 后台输入、无障碍优先的跨平台桌面 MCP，支持边操作边观察。 | 提权窗口输入被拦截；无端到端成功率数据。 |
| 18 | tebelorg/RPA-Python | RPA/工作流 | 78.50 | 一行安装的 Python RPA 封装，提供点击、输入、读表与截图接口。 | 底层停更带来长期兼容风险；不适合高并发强校验。 |
| 19 | pywinauto/pywinauto | 无障碍树 | 78.26 | Python 操作 Windows 控件的经典库，枚举窗口、定位控件并读写值。 | 提权与安全桌面不可达；自绘区域需另配视觉方案。 |
| 20 | amontlabs/lcu | 无障碍树 | 78.10 | 脱离原客户端的桌面操控运行时，提供读窗、点击、输入与截图。 | 上游更新可能改变桥接；平台标注与实现不完全对应。 |
| 21 | ComputerUseAgent/AutoCua | Agent 框架 | 78.00 | 跨六端的多智能体桌面代理，几行代码启动并自主规划操作。 | 内核驱动增加安全与合规成本；手机需连线或同网。 |
| 22 | alper-han/CrossMacro | RPA/工作流 | 77.94 | 跨平台宏录制回放，支持图色等待、变量循环与定时触发。 | 布局变化即失效；无内容判断能力。 |
| 23 | iflytek/astron-agent | RPA/工作流 | 77.86 | 可视化编排多节点工作流，接入模型、工具、MCP 与 RPA 组件。 | 部署依赖基础设施；流程质量无公开成功率可依。 |
| 24 | TurixAI/TuriX-CUA | 屏幕视觉+坐标点击 | 77.70 | 视觉驱动的桌面代理，截屏决策、执行动作并自我反思。 | 权限未授全时静默失败；步数耗尽会中断任务。 |
| 25 | A9T9/RPA | RPA/工作流 | 77.30 | 宏录制回放的 RPA，支持网页与桌面，带文字识别与图像匹配。 | 桌面可靠性依赖商业扩展；图像匹配随环境漂移。 |
| 26 | CelestoAI/celesto | 其他 | 76.10 | 给代理的轻量持久虚拟机，本地或云端创建并执行命令与浏览。 | 本地模式需虚拟化支持；云端按资源计费。 |
| 27 | 777genius/os-ai-computer-use | 屏幕视觉+坐标点击 | 76.07 | 双模型桌面代理客户端，截图决策并实时显示动作与成本。 | 无失败回滚与二次校验；多屏坐标易错。 |
| 28 | yinkaisheng/Python-UIAutomation-for-Windows | 无障碍树 | 76.04 | Python 封装 Windows 无障碍接口，遍历控件树并按条件定位操作。 | Electron 未开可访问性时只有空壳；需按应用调参。 |
| 29 | robotframework/robotframework | RPA/工作流 | 75.46 | 关键字驱动的自动化与 RPA 框架，执行流程并生成日志报告。 | 依赖第三方界面库，库停更会让整条流程失效。 |
| 30 | WecomTeam/wecom-openclaw-plugin | 官方 API/SDK | 75.10 | 官方企业渠道插件，接收消息并流式回复，可按部门标签群发。 | 触达范围受官方限制；需管理员创建并授权机器人。 |

## 二、四档数量

| 档位 | 数量 | 含义 | 代表项目 |
|---|---|---|---|
| 推荐 | 5 | 覆盖面、易用性、维护与稳定性都过关，风险可控，可作为首选。 | browser-use/browser-use、simular-ai/Agent-S、appium/appium、bytedance/UI-TARS-desktop |
| 可用 | 45 | 能力成立，但有明确边界或需要额外工程，适合有技术的人落地。 | agent-sh/computer-use-linux、Yu-tao-Li/dsh-computer-use-win、vercel-labs/agent-desktop、droidrun/mobilerun |
| 谨慎 | 61 | 能跑但不稳、偏窄、维护弱或依赖模型，只适合试验与辅助。 | aisingapore/TagUI、mochat-cloud/mochat、Tongyi-MAI/MAI-UI、guangfubill-crypto/SoftAuto-MCP |
| 勿用 | 29 | 存在法律、账号、安全风险，或实质停更/无法落地，理由写在 whyZh 或 riskZh。 | wechaty/wechaty、xlrpa/FlowBot、cs-lazy-tools/ChatGPT-On-CS、fanyuantaier/wechatauto-replica |

## 三、按用途分组

> 每组只列 3–8 个，按组内分数从高到低；同组更可比，跨组看 whyZh 里的取舍。

### 浏览器自动化

| 名次 | 项目 | 路线 | 分数 | 适合做什么 |
|---|---|---|---|---|
| 1 | browser-use/browser-use | 浏览器自动化 | 88.90 | 网页后台批量录单、跨站点取数、表单填报与资料汇总。 |
| 36 | nanobrowser/nanobrowser | 浏览器自动化 | 73.54 | 网页检索、批量填表、内容提取与跨页汇总。 |
| 37 | steel-dev/steel-browser | 浏览器自动化 | 73.51 | 给代理批量开网页、抓取内容、截图存档与隔离浏览。 |
| 107 | google-gemini/computer-use-preview | 浏览器自动化 | 55.67 | 网页任务原型、模型能力验证与教学演示。 |
| 119 | miyahluvgames-source/helix-computer-use | 浏览器自动化 | 52.10 | 网页后台与原生窗口混合的流程，动态目标点击。 |
| 121 | shortsspectrumai-del/flash-computer-use | 无障碍树 | 50.07 | 网页表单与桌面控件的混合操作，密集页面定位。 |
| 123 | DaizeDong/grokbot-cdp | 浏览器自动化 | 49.90 | 云端代理环境的远程控制与画面取证。 |
| 126 | vercel-labs/ai-sdk-computer-use | 屏幕视觉+坐标点击 | 49.70 | 网页任务演示、工具调用链路学习。 |

### 桌面 GUI

| 名次 | 项目 | 路线 | 分数 | 适合做什么 |
|---|---|---|---|---|
| 2 | simular-ai/Agent-S | 屏幕视觉+坐标点击 | 88.14 | 桌面软件组合流程、跨应用数据搬运与半自动办公。 |
| 4 | bytedance/UI-TARS-desktop | 屏幕视觉+坐标点击 | 85.94 | 桌面软件批量操作、跨应用搬数据、重复界面流程。 |
| 6 | agent-sh/computer-use-linux | 无障碍树 | 83.34 | Linux 桌面软件的结构化操作与自动化脚本。 |
| 8 | vercel-labs/agent-desktop | 无障碍树 | 82.10 | macOS 桌面软件的结构化操作、菜单与表单的稳定点击。 |
| 10 | microsoft/Hybrid-Computer-Use | 无障碍树 | 82.06 | Windows 桌面软件的结构化操作与批量界面任务。 |
| 15 | xa11y/xa11y | 无障碍树 | 80.50 | 三平台桌面软件的结构化操作与稳定定位。 |
| 19 | pywinauto/pywinauto | 无障碍树 | 78.26 | Windows 桌面软件的表单填写、菜单点击与批量数据录入。 |
| 28 | yinkaisheng/Python-UIAutomation-for-Windows | 无障碍树 | 76.04 | Windows 桌面软件的控件级自动化与批量录单。 |

### 移动端

| 名次 | 项目 | 路线 | 分数 | 适合做什么 |
|---|---|---|---|---|
| 3 | appium/appium | 官方 API/SDK | 87.36 | 移动 App 回归测试、批量设备上的重复操作与数据采集。 |
| 5 | firerpa/lamda | 无障碍树 | 85.70 | 多台安卓设备的集中操作、批量任务与远程协助。 |
| 9 | droidrun/mobilerun | Agent 框架 | 82.07 | 移动 App 流程验证、批量真机操作与数据采集。 |
| 31 | AirtestProject/Airtest | 屏幕视觉+坐标点击 | 75.00 | 游戏与 App 的界面回归、带截图的流程验证。 |
| 74 | Core-Mate/OpenGUI | 屏幕视觉+坐标点击 | 64.23 | 安卓 App 的功能验证、界面信息整理与重复填单。 |
| 79 | X-PLUG/MobileAgent | Agent 框架 | 63.14 | 研究型移动端自动化、模型能力对比与演示验证。 |
| 127 | appium/appium-uiautomator2-server | 无障碍树 | 48.70 | 作为移动自动化驱动的设备端组件，配合上层框架使用。 |

### Office/文档

| 名次 | 项目 | 路线 | 分数 | 适合做什么 |
|---|---|---|---|---|
| 12 | iflytek/astron-rpa | RPA/工作流 | 81.46 | Windows 桌面软件与表格、邮件的批量流程，企业内常驻自动化。 |
| 18 | tebelorg/RPA-Python | RPA/工作流 | 78.50 | 快速写网页与桌面重复流程的小型脚本。 |
| 25 | A9T9/RPA | RPA/工作流 | 77.30 | 老系统的固定流程回放、填表取数与报表下载。 |
| 32 | microsoft/magentic-ui | Agent 框架 | 74.84 | 网页调研加本地文件整理的混合任务，需人盯着的流程。 |
| 42 | aisingapore/TagUI | RPA/工作流 | 71.70 | 跨网页与本地软件的重复流程，脚本化报表处理。 |
| 48 | yuruotong1/autoMate | Agent 框架 | 69.30 | 个人知识整理、半自动文件处理与轻量桌面操作。 |
| 52 | openinterpreter/openinterpreter | Agent 框架 | 68.26 | 批量文件整理、环境配置、脚本化数据处理与重复命令行任务。 |
| 90 | pphouse/screenpilot | RPA/工作流 | 59.50 | 表单填写、数据提取等固定桌面流程，替代脆弱脚本。 |

### RPA/工作流

| 名次 | 项目 | 路线 | 分数 | 适合做什么 |
|---|---|---|---|---|
| 12 | iflytek/astron-rpa | RPA/工作流 | 81.46 | Windows 桌面软件与表格、邮件的批量流程，企业内常驻自动化。 |
| 22 | alper-han/CrossMacro | RPA/工作流 | 77.94 | 固定界面的重复点击、定时任务与简单批处理。 |
| 29 | robotframework/robotframework | RPA/工作流 | 75.46 | 回归测试、可维护的批量业务流程与团队协作脚本。 |
| 42 | aisingapore/TagUI | RPA/工作流 | 71.70 | 跨网页与本地软件的重复流程，脚本化报表处理。 |
| 55 | guangfubill-crypto/SoftAuto-MCP | RPA/工作流 | 67.74 | 固定后台系统的批量录单、界面回归与流程复用。 |
| 128 | ranjitdontineni09/computer-use-runtime | RPA/工作流 | 48.30 | 网页流程的确定性回放与低成本批处理。 |
| 133 | sjkncs/gui-agent-framework | RPA/工作流 | 44.90 | 把重复流程搭成流水线，中途接模型决策。 |
| 134 | PavanVAkula/computer-use-capability-engine | RPA/工作流 | 44.30 | 网页流程的发现与固化、重复任务自动回放。 |

### Agent 框架

| 名次 | 项目 | 路线 | 分数 | 适合做什么 |
|---|---|---|---|---|
| 11 | nano-muse/nanoMuse | Agent 框架 | 81.60 | 个人多设备助手、定时提醒与跨端信息汇总。 |
| 21 | ComputerUseAgent/AutoCua | Agent 框架 | 78.00 | 多平台混合任务原型、跨设备流程验证。 |
| 32 | microsoft/magentic-ui | Agent 框架 | 74.84 | 网页调研加本地文件整理的混合任务，需人盯着的流程。 |
| 35 | SouravBeraAkaSpeed/xiryn | Agent 框架 | 73.70 | 多代理并行试验、隔离的网页与脚本任务。 |
| 44 | milind-soni/OpenMausBot | Agent 框架 | 71.30 | 多任务并行、需要人工审批的日常办公自动化。 |
| 52 | openinterpreter/openinterpreter | Agent 框架 | 68.26 | 批量文件整理、环境配置、脚本化数据处理与重复命令行任务。 |
| 53 | Orkas-AI/Orkas | Agent 框架 | 68.10 | 项目式任务的编排与例行工作调度，而非界面级操作。 |
| 80 | Anil-matcha/open-duet | Agent 框架 | 62.90 | 团队式任务编排、需要人工复核的操作流程。 |

### 屏幕解析模型

| 名次 | 项目 | 路线 | 分数 | 适合做什么 |
|---|---|---|---|---|
| 40 | inclusionAI/UI-Venus | 屏幕视觉+坐标点击 | 72.74 | 移动端界面理解研究、模型部署与批量任务试验。 |
| 54 | Tongyi-MAI/MAI-UI | 屏幕视觉+坐标点击 | 67.86 | 模型研究、移动端界面理解与自动化能力对比。 |
| 58 | microsoft/Mage | 屏幕视觉+坐标点击 | 66.90 | 研究桌面与终端混合任务、做模型基座选型。 |
| 68 | zai-org/CogAgent | 屏幕视觉+坐标点击 | 64.74 | 研究型界面操作、模型微调与离线推理验证。 |
| 73 | microsoft/OmniParser | 屏幕视觉+坐标点击 | 64.26 | 给纯文本模型补视觉定位，做界面元素识别与解析前置。 |
| 89 | Mininglamp-AI/Mano-P | 屏幕视觉+坐标点击 | 59.67 | 离线环境下的界面操作、隐私敏感场景的本地推理。 |
| 108 | microsoft/fara | 屏幕视觉+坐标点击 | 55.54 | 研究网页任务代理、做模型选型与本地部署验证。 |
| 111 | showlab/ShowUI | 屏幕视觉+坐标点击 | 55.30 | 界面元素定位研究、轻量模型微调与单步点击。 |
