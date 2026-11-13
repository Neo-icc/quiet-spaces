# 三个安静的地方

三套独立的浏览器原型。发布入口在 `site/index.html`，三个产品分别位于 `city-hermitage/`、`hearth/`、`season-garden/`。

## 本地运行

```sh
python -m http.server 8000 --directory site
```

打开 http://localhost:8000/。山隐的离线体验需要先在线打开一次。壁炉的麦克风由用户主动启用，仅在安全上下文可用，浏览器会单独请求权限。

## 验证和发布

```sh
npm ci
npm test
npx playwright install chromium
npm run test:browser
```

浏览器检查在临时 HTTP 服务上复现 `/quiet-spaces/` 子路径，运行桌面和 375×667 触屏模拟，并把截图和年册 PDF 保存至 `browser-evidence/`。站点文件可直接发布，Node 依赖仅用于测试。

GitHub Actions 在推送到 `main` 后执行验证。GitHub Pages 启用并选择 **GitHub Actions** 作为发布来源后，可以从 Actions 手动运行工作流。站点包含公开的三个入口，验收状态见 [验收报告](docs/RELEASE-STATUS.md)。
