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
  destroy() {}
}

class MockActuator {
  constructor() {
    this.lastGrid = null;
    this.lastMeta = null;
    this.continueGameCalled = false;
  }
  actuate(grid, meta) {
    this.lastGrid = grid;
    this.lastMeta = meta;
  }
  continueGame() {
    this.continueGameCalled = true;
  }
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

describe('GameManager Core & Edge Cases', () => {
  let gm;
  let mockStorage;
  let mockActuator;

  beforeEach(() => {
    mockStorage = new MockStorageManager();
    mockActuator = new MockActuator();
    gm = new GameManager(4, MockInputManager, function() { return mockActuator; }, function() { return mockStorage; });
  });

  it('should start with 2 tiles and score 0', () => {
    expect(gm.score).toBe(0);
    expect(gm.over).toBe(false);
    expect(gm.won).toBe(false);
    expect(gm.grid.availableCells().length).toBe(14); // 16 - 2
  });

  describe('Merging algorithms across all directions', () => {
    it('should correctly merge [2, 2, 2, 2] into [4, 4, 0, 0] when moving left (no chain reaction)', () => {
      gm.grid = new gm.grid.constructor(4);
      for (let x = 0; x < 4; x++) {
        gm.grid.insertTile(new Tile({ x, y: 0 }, 2));
      }

      // Move left (3)
      gm.move(3);

      expect(gm.grid.cellContent({ x: 0, y: 0 })?.value).toBe(4);
      expect(gm.grid.cellContent({ x: 1, y: 0 })?.value).toBe(4);
      expect(gm.grid.cellContent({ x: 2, y: 0 })).toBeNull();
      expect(gm.score).toBe(8);
    });

    it('should correctly merge [4, 2, 2, 0] into [4, 4, 0, 0] moving left', () => {
      gm.grid = new gm.grid.constructor(4);
      gm.grid.insertTile(new Tile({ x: 0, y: 0 }, 4));
      gm.grid.insertTile(new Tile({ x: 1, y: 0 }, 2));
      gm.grid.insertTile(new Tile({ x: 2, y: 0 }, 2));

      gm.move(3); // Left

      expect(gm.grid.cellContent({ x: 0, y: 0 })?.value).toBe(4);
      expect(gm.grid.cellContent({ x: 1, y: 0 })?.value).toBe(4);
      expect(gm.grid.cellContent({ x: 2, y: 0 })).toBeNull();
      expect(gm.score).toBe(4);
    });

    it('should move tiles Up (0)', () => {
      gm.grid = new gm.grid.constructor(4);
      gm.grid.insertTile(new Tile({ x: 1, y: 2 }, 2));
      gm.grid.insertTile(new Tile({ x: 1, y: 3 }, 2));

      gm.move(0); // Up

      expect(gm.grid.cellContent({ x: 1, y: 0 })?.value).toBe(4);
      expect(gm.score).toBe(4);
    });

    it('should move tiles Right (1)', () => {
      gm.grid = new gm.grid.constructor(4);
      gm.grid.insertTile(new Tile({ x: 0, y: 1 }, 2));
      gm.grid.insertTile(new Tile({ x: 1, y: 1 }, 2));

      gm.move(1); // Right

      expect(gm.grid.cellContent({ x: 3, y: 1 })?.value).toBe(4);
      expect(gm.score).toBe(4);
    });

    it('should move tiles Down (2)', () => {
      gm.grid = new gm.grid.constructor(4);
      gm.grid.insertTile(new Tile({ x: 2, y: 0 }, 4));
      gm.grid.insertTile(new Tile({ x: 2, y: 1 }, 4));

      gm.move(2); // Down

      expect(gm.grid.cellContent({ x: 2, y: 3 })?.value).toBe(8);
      expect(gm.score).toBe(8);
    });
  });

  describe('Winning and Continuation Persistence', () => {
    it('should detect 2048 winning condition', () => {
      gm.grid = new gm.grid.constructor(4);
      gm.grid.insertTile(new Tile({ x: 0, y: 0 }, 1024));
      gm.grid.insertTile(new Tile({ x: 0, y: 1 }, 1024));

      gm.move(0);

      expect(gm.won).toBe(true);
      expect(gm.isGameTerminated()).toBe(true);
    });

    it('should immediately persist keepPlaying state to storage', () => {
      gm.won = true;
      gm.keepPlaying();

      expect(gm.isGameTerminated()).toBe(false);
      expect(mockActuator.continueGameCalled).toBe(true);

      // Verify that actuate() was called and saved to storage
      const saved = mockStorage.getGameState();
      expect(saved).not.toBeNull();
      expect(saved.keepPlayingState).toBe(true);
      expect(saved.won).toBe(true);
    });
  });

  describe('Resilience and Corrupted Storage Validation', () => {
    it('should reject invalid / corrupted storage and fallback cleanly to fresh game', () => {
      const corruptedStates = [
        {},
        { score: 'not-a-number' },
        { score: 100, over: false, won: false, grid: null },
        { score: 100, over: false, won: false, grid: { size: 3 } },
        { score: 100, over: false, won: false, grid: { size: 4, cells: 'corrupted' } },
        { score: 100, over: false, won: false, grid: { size: 4, cells: [[null]] } },
        {
          score: 100,
          over: false,
          won: false,
          grid: {
            size: 4,
            cells: Array.from({ length: 4 }, (_, x) =>
              Array.from({ length: 4 }, (_, y) => (x === 0 && y === 0 ? { position: { x: 99, y: 99 }, value: 2 } : null))
            ),
          },
        },
      ];

      for (const badState of corruptedStates) {
        mockStorage.setGameState(badState);
        expect(() => {
          gm.setup();
        }).not.toThrow();

        // Fresh game must be started
        expect(gm.score).toBe(0);
        expect(gm.grid.size).toBe(4);
        expect(gm.grid.availableCells().length).toBe(14);
        expect(mockStorage.getGameState()).not.toBe(badState);
      }
    });

    it('should restore valid stored state correctly', () => {
      const validState = gm.serialize();
      mockStorage.setGameState(validState);

      const newGm = new GameManager(4, MockInputManager, function() { return mockActuator; }, function() { return mockStorage; });
      expect(newGm.score).toBe(validState.score);
      expect(newGm.won).toBe(validState.won);
    });
  });

  it('should restart game and reset score', () => {
    gm.score = 500;
    gm.restart();
    expect(gm.score).toBe(0);
    expect(gm.over).toBe(false);
    expect(gm.grid.availableCells().length).toBe(14);
  });
});
