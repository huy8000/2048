# 2048 (Modernized Edition)

A modernized, high-performance, and lightweight edition of Gabriele Cirulli's classic [2048](https://github.com/gabrielecirulli/2048) game, redesigned with **Native ES Modules**, **Vite 8**, and **Vitest**.

100% faithful to the original visual styling, animations, colors, and responsive layout, with all obsolete legacy code and heavy assets removed.

---

## ✨ Modern Improvements & Engineering Highlights

- ⚡ **Native ES Modules (Zero Runtime Framework Overhead)**:
  - Clean ES6+ classes (`Grid`, `Tile`, `GameManager`, `HTMLActuator`, `KeyboardInputManager`, `LocalStorageManager`).
  - No global namespace pollution; fully decoupled architecture with dependency injection for input, storage, and rendering.
- 📦 **Vite 8 Build System**:
  - Blazing fast builds (< 50ms) and HMR.
  - Outputs 10-char hashed production assets (`app.[hash].js`, `css.[hash].css`) configured via modern `rolldownOptions` and `rollupOptions` aliases for long-term immutable caching.
- 🛡️ **Storage Resilience & Schema Validation**:
  - Full structural validation for saved games in `localStorage` (grid dimensions, coordinate integrity, numeric validity).
  - Gracefully recovers from malformed or corrupted save data without throwing runtime exceptions.
  - **Immediate Persistence**: Clicking "Keep going" after reaching 2048 immediately persists the continued state, preventing dialog re-triggering upon refresh.
- 📱 **Mobile Touch & Accessibility**:
  - **Touch Fix**: Touch-based swipe detection is strictly scoped to the playing board, preventing suppression of click events on dialog buttons (`Keep going`, `Try again`).
  - **Semantic HTML**: Converted non-semantic `<a>` buttons to accessible `<button type="button">` elements with native keyboard navigation (Tab/Enter/Space) while preserving 100% pixel-perfect retro styling.
  - **User Zoom**: Viewport allows scaling for accessibility.
- 🪶 **Asset Size Optimization**:
  - Removed outdated, heavy `.svg` and `.eot` font files (~300KB deleted).
  - Kept only clean `.woff` font files with modern system font fallbacks.
  - Stripped redundant vendor prefixes (`-webkit-`, `-moz-`, `-ms-`) from CSS.
  - Total production bundle: **~11KB JS + ~8KB CSS** (Gzip **< 6KB**).
- 🧪 **Comprehensive Unit Test Suite**:
  - 36 tests across 6 suites covering tile operations, grid boundaries, merge logic across all 4 directions (including `[2,2,2,2]` no-chain-reaction rule), game victory/loss conditions, corrupted storage recovery, touch event exclusion, and DOM actuator rendering.
- 🤖 **Automated CI Workflow**:
  - GitHub Actions CI workflow running tests and production builds on Node.js 22.

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

# Run unit tests (36 tests)
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
