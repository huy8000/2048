# 2048（现代化重制版）

基于 Gabriele Cirulli 经典游戏 [2048](https://github.com/gabrielecirulli/2048) 进行现代重构的高性能、轻量化版本，采用 **原生 ES 模块（Native ES Modules）**、**Vite 6** 与 **Vitest** 构建。

100% 还原原版的视觉样式、动画过渡、配色方案和响应式布局，同时彻底移除了所有陈旧历史遗留代码与冗余资源。

---

## ✨ 现代化改进

- ⚡ **原生 ES 模块（零运行时框架负担）**：使用现代化 ES6+ 类完整重构（`Grid`、`Tile`、`GameManager`、`HTMLActuator`、`KeyboardInputManager`、`LocalStorageManager`）。
- 📦 **Vite 6 构建系统**：极速现代化打包体验，开发环境秒级热重载（HMR），生产构建采用 10 位内容哈希资源命名（`app.[hash].js`、`css.[hash].css`）。
- 🧹 **移除陈旧兼容代码**：剔除 2014 年代过时的 Polyfill（`animframe_polyfill.js`、`bind_polyfill.js`、`classlist_polyfill.js`）以及旧版 IE10 / Windows Phone MSPointer 事件处理。
- 🪶 **静态资源极致优化**：
  - 移除体积臃肿的 `.svg` 和 `.eot` 字体文件（节省约 300KB 体积）。
  - 仅保留更清晰小巧的 `.woff` 字体文件，并配合现代系统字体回退方案（fallback）。
  - 清理 CSS 中冗余的浏览器私有前缀（`-webkit-`、`-moz-`、`-ms-`）。
  - 生产打包体积仅约：**~12KB JS + ~6KB CSS**（Gzip 压缩后 **< 7KB**）。
- 🧪 **Vitest 单元测试**：针对网格操作、方块移动、合并算法、2048 胜利判定、失败判定、localStorage 本地持久化及键盘输入实现全面测试覆盖。
- 🤖 **自动化 CI 工作流**：配置 GitHub Actions CI，在每次 push / PR 时自动执行测试与构建验证。
- 📱 **移动端触摸优化**：优化触摸事件监听器（`{ passive: false }`），提供丝滑流畅的滑动控制体验。

---

## 🎮 游戏操作与玩法

- **桌面端**：
  - **方向键（↑ ↓ ← →）** / **WASD** / **Vim 键位（HJKL）**：向对应方向移动方块。
  - **R 键**：重新开始游戏。
- **移动端**：
  - **向上 / 向下 / 向左 / 向右滑动屏幕**：移动方块。
  - 两个数值相同的方块碰撞接触时，会**合并成一个数值翻倍的方块**！

---

## 🛠️ 本地开发与构建

```bash
# 安装依赖
npm install

# 启动本地开发服务器
npm run dev

# 运行单元测试
npm test

# 构建生产环境代码
npm run build

# 本地预览生产构建
npm run preview
```

---

## 📄 开源许可

原版游戏由 [Gabriele Cirulli](http://gabrielecirulli.com) 创建。基于 [Veewo Studio 的 1024](https://itunes.apple.com/us/app/1024!/id823499224) 制作，并在设计概念上借鉴了 [Asher Vollmer 的 Threes](http://asherv.com/threes/)。

本项目基于 [MIT 许可证](./LICENSE) 开源。
