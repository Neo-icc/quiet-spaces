# 验证记录 · 2026-11-13

- PASS: `node tests/check.mjs`，4 个 HTML 入口、内联 JS 语法、相对静态资源、麦克风停止轨道代码、24 节气 JSON 数量。
- PASS: 情绪壁炉独立原型的 `node tests/check.mjs`，8 项代码静态检查。
- BLOCKED: Playwright + Chromium 144 在 `file://` 和本地 HTTP 均返回 `net::ERR_BLOCKED_BY_ADMINISTRATOR`。未获得截图、交互和 FPS 数据。
- NOT RUN: GitHub Actions、GitHub Pages 实际上线、手机真机、麦克风权限操作、离线刷新、声景盲听。
- NOT CLAIMED: 100% 产品验收、正式生产就绪、公开站点已经上线。

下一阶段需要 GitHub 授权连接和已发布 URL，以执行线上端到端测试与回归。

## 第八轮 · 2026-11-13

- PASS: `node tests/check.mjs && node tests/security.mjs`；新增四入口语言/编码、外部脚本、iframe、显式外发请求、表单目标、节气唯一性与数据完整性检查。
- PASS: 添加 GitHub Pages `.nojekyll` 和静态 404 页面。
- FIX: 节气心园每日到访日期改为本地日历日，避免 UTC 跨日导致错误归档。
- BLOCKED: Chromium 375×812 无头截图在 12 秒内未完成（exit 124），未取得有效截图。不能据此认定真实浏览器通过。
- NOT RUN: GitHub Actions 线上执行、实际公开网址验证、手机真机测试、麦克风实测、音景听感测试。

## 第九轮 · 2026-11-13

- PASS: 四入口 HTML/脚本/本地资源静态检查与 JSON 数据完整性检查。
- PASS: 模拟 DOM 交互测试：城市山隐入座、三个微动作、起身种树、存档恢复、分享；情绪壁炉四态选择、隐私页、麦克风初始化异常时关闭轨道；节气心园正确选取节气、日常动作、埋纸、存档与年册入口。
- PASS: 模拟 Service Worker 安装缓存及断网回退（GitHub Pages 子路径场景）。
- PASS: 本地 HTTP 访问 7 个站点资源全部 HTTP 200。
- BLOCKED: GitHub 已连接为 Neo-icc，但 0 个可访问仓库、0 个 App 安装，未能提交代码或获取在线部署链接。
- BLOCKED: Chromium headless 截图再次超时，未取得真实浏览器端到端证据。
- FIX: 情绪壁炉麦克风资源、月份跨年、损坏的存储数据；节气心园提前跳节气；城市山隐缺失的 SW 注册。
