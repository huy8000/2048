# 2048 (Modernized Edition)

A modernized, high-performance, and lightweight edition of Gabriele Cirulli's classic [2048](https://github.com/gabrielecirulli/2048) game, redesigned with **Native ES Modules**, **Vite 6**, and **Vitest**.

100% faithful to the original visual styling, animations, colors, and responsive layout, with all obsolete legacy code and heavy assets removed.

---

## ✨ Modern Improvements

- ⚡ **Native ES Modules (Zero Runtime Framework Overhead)**: Rewritten into clean ES6+ classes (`Grid`, `Tile`, `GameManager`, `HTMLActuator`, `KeyboardInputManager`, `LocalStorageManager`).
- 📦 **Vite 6 Build System**: Fast modern bundling, instant HMR in dev, and 10-char content-hashed production assets (`app.[hash].js`, `css.[hash].css`).
- 🧹 **Removed Legacy Polyfills**: Stripped obsolete 2014-era polyfills (`animframe_polyfill.js`, `bind_polyfill.js`, `classlist_polyfill.js`) and legacy IE10 / Windows Phone MSPointer handlers.
- 🪶 **Asset Size Optimization**:
  - Removed outdated, heavy `.svg` and `.eot` font files (~300KB deleted).
  - Kept only clean `.woff` font files with modern system font fallbacks.
  - Stripped redundant vendor prefixes (`-webkit-`, `-moz-`, `-ms-`) from CSS.
  - Total production bundle: **~12KB JS + ~6KB CSS** (Gzip **< 7KB**).
- 🧪 **Unit Tests with Vitest**: 100% test coverage across grid operations, tile movement, merging algorithms, 2048 victory condition, game-over detection, localStorage persistence, and keyboard controls.
- 🤖 **CI Workflow**: Automated GitHub Actions CI for tests and builds on every push/PR.
- 📱 **Mobile & Touch Optimized**: Clean touch event listeners with `{ passive: false }` for smooth swipe controls.

---

## 🎮 How to Play

- **Desktop**:
  - **Arrow Keys** / **WASD** / **Vim Keys (HJKL)**: Move tiles in the 4 directions.
  - **R Key**: Restart game.
- **Mobile**:
  - **Swipe Up / Down / Left / Right**: Move tiles.
  - When two tiles with the same number touch, they **merge into one** with double the number!

---

## 🛠️ Development & Build

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run unit tests
npm test

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 📄 License

Original game created by [Gabriele Cirulli](http://gabrielecirulli.com). Based on [1024 by Veewo Studio](https://itunes.apple.com/us/app/1024!/id823499224) and conceptually similar to [Threes by Asher Vollmer](http://asherv.com/threes/).

Licensed under the [MIT License](./LICENSE).
