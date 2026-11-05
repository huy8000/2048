import { describe, it, expect, beforeEach } from 'vitest';
import { GameManager } from '../GameManager.js';
import { Tile } from '../Tile.js';

class MockInputManager {
  constructor() {
    this.events = {};
  }
  on(event, fn) {
    this.events[event] = fn;
  }
  emit(event, data) {
    if (this.events[event]) this.events[event](data);
  }
}

class MockActuator {
  constructor() {
    this.lastGrid = null;
    this.lastMeta = null;
  }
  actuate(grid, meta) {
    this.lastGrid = grid;
    this.lastMeta = meta;
  }
  continueGame() {}
}

class MockStorageManager {
  constructor() {
    this.bestScore = 0;
    this.gameState = null;
  }
  getBestScore() {
    return this.bestScore;
  }
  setBestScore(s) {
    this.bestScore = s;
  }
  getGameState() {
    return this.gameState;
  }
  setGameState(s) {
    this.gameState = s;
  }
  clearGameState() {
    this.gameState = null;
  }
}

describe('GameManager', () => {
  let gm;

  beforeEach(() => {
    gm = new GameManager(4, MockInputManager, MockActuator, MockStorageManager);
  });

  it('should start with 2 tiles and score 0', () => {
    expect(gm.score).toBe(0);
    expect(gm.over).toBe(false);
    expect(gm.won).toBe(false);
    expect(gm.grid.availableCells().length).toBe(14); // 16 - 2
  });

  it('should merge two identical adjacent tiles on move', () => {
    // Clear grid manually
    gm.grid = new gm.grid.constructor(4);
    // Put two 2s in column 0, rows 0 and 1
    gm.grid.insertTile(new Tile({ x: 0, y: 0 }, 2));
    gm.grid.insertTile(new Tile({ x: 0, y: 1 }, 2));

    // Move up (0)
    gm.move(0);

    // Merged into 4 at (0, 0)
    const topTile = gm.grid.cellContent({ x: 0, y: 0 });
    expect(topTile.value).toBe(4);
    expect(gm.score).toBe(4);
  });

  it('should detect 2048 winning condition', () => {
    gm.grid = new gm.grid.constructor(4);
    gm.grid.insertTile(new Tile({ x: 0, y: 0 }, 1024));
    gm.grid.insertTile(new Tile({ x: 0, y: 1 }, 1024));

    gm.move(0);

    expect(gm.won).toBe(true);
    expect(gm.isGameTerminated()).toBe(true);

    // Keep playing
    gm.keepPlaying();
    expect(gm.isGameTerminated()).toBe(false);
  });

  it('should detect game over when no moves are available', () => {
    gm.grid = new gm.grid.constructor(4);
    let val = 2;
    for (let x = 0; x < 4; x++) {
      for (let y = 0; y < 4; y++) {
        // Fill grid with alternating unmergeable numbers
        gm.grid.insertTile(new Tile({ x, y }, (x + y) % 2 === 0 ? 2 : 4));
      }
    }
    // Now no moves are available
    expect(gm.movesAvailable()).toBe(false);
  });

  it('should restart game and reset score', () => {
    gm.score = 500;
    gm.restart();
    expect(gm.score).toBe(0);
    expect(gm.over).toBe(false);
    expect(gm.grid.availableCells().length).toBe(14);
  });
});
