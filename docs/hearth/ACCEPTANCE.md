# 验收清单

- [ ] 冷启动完整体验
- [ ] 375px 竖屏截图审查
- [ ] 无 console error
- [ ] 离线刷新测试
- [ ] 真实设备性能测试
- [ ] 功能和合规终审

- [x] 麦克风为用户主动授权、关闭时停止采集；代码检查：`index.html` 中 `getUserMedia` / `stopMic`，`node tests/check.mjs` PASS（仍需浏览器权限实测）
- [x] 模拟信号入口保留；代码检查：`node tests/check.mjs` PASS（仍需视觉验证）
- [ ] 麦克风授权/拒绝/关闭在真实浏览器验证
- [ ] 四态音景独立实现并盲听验证
- [ ] 375px 截图与 40fps 真机验证
- [x] 四态音景有独立程序化音源：`index.html` 中 `function audio()` 的四个 mode 分支；JavaScript 解析通过（**不代表盲听通过**）
- [ ] 四态音景真实设备盲听及切换无残留音源验证
