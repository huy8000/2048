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

  describe('Merging algorithms across all directions (Deterministic)', () => {
    beforeEach(() => {
      // Mock addRandomTile to eliminate randomness during pure merge assertions
      gm.addRandomTile = () => {};
    });

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
      expect(gm.grid.cellContent({ x: 3, y: 0 })).toBeNull();
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

  describe('Random Tile Generation', () => {
    it('should spawn a new tile in an available cell on valid moves', () => {
      gm.grid = new gm.grid.constructor(4);
      gm.grid.insertTile(new Tile({ x: 0, y: 0 }, 2));
      gm.grid.insertTile(new Tile({ x: 0, y: 1 }, 2));

      expect(gm.grid.availableCells().length).toBe(14);
      gm.move(0); // Move Up: 2+2 merges into 4 (leaves 15 cells open), then addRandomTile spawns 1 tile -> 14 open
      expect(gm.grid.availableCells().length).toBe(14);
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

    it('should prioritize winning even if no further moves are available after reaching 2048', () => {
      gm.grid = new gm.grid.constructor(4);
      // Col 0: (0, 0)=1024, (0, 1)=1024, (0, 2)=8, (0, 3)=16
      gm.grid.insertTile(new Tile({ x: 0, y: 0 }, 1024));
      gm.grid.insertTile(new Tile({ x: 0, y: 1 }, 1024));
      gm.grid.insertTile(new Tile({ x: 0, y: 2 }, 8));
      gm.grid.insertTile(new Tile({ x: 0, y: 3 }, 16));

      // Cols 1..3: checkerboard of 32 and 64
      for (let x = 1; x < 4; x++) {
        for (let y = 0; y < 4; y++) {
          gm.grid.insertTile(new Tile({ x, y }, (x + y) % 2 === 0 ? 64 : 32));
        }
      }

      // Moving Up merges (0, 0)+(0, 1) into 2048 at (0, 0).
      // (0, 2)=8 moves to (0, 1), (0, 3)=16 moves to (0, 2), leaving (0, 3) as the only empty cell.
      // Mock addRandomTile to fill (0, 3) with an unmergeable 128:
      gm.addRandomTile = () => {
        gm.grid.insertTile(new Tile({ x: 0, y: 3 }, 128));
      };

      gm.move(0); // Up: merges into 2048 at (0, 0)
      expect(gm.won).toBe(true);
      expect(gm.movesAvailable()).toBe(false);
      expect(gm.over).toBe(true);
      // Actuator must receive won: true and terminated: true
      expect(mockActuator.lastMeta.won).toBe(true);
      expect(mockActuator.lastMeta.terminated).toBe(true);
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

    it('should transition to over with keepPlaying=true when moves run out after continuing', () => {
      // 1. Player reaches 2048 and continues
      gm.won = true;
      gm.keepPlaying();
      expect(gm.keepPlayingState).toBe(true);
      expect(gm.isGameTerminated()).toBe(false);

      // 2. Set up board to run out of moves
      gm.grid = new gm.grid.constructor(4);
      gm.grid.insertTile(new Tile({ x: 0, y: 0 }, 2));
      gm.grid.insertTile(new Tile({ x: 0, y: 1 }, 2));
      gm.grid.insertTile(new Tile({ x: 0, y: 2 }, 8));
      gm.grid.insertTile(new Tile({ x: 0, y: 3 }, 16));

      for (let x = 1; x < 4; x++) {
        for (let y = 0; y < 4; y++) {
          gm.grid.insertTile(new Tile({ x, y }, (x + y) % 2 === 0 ? 64 : 32));
        }
      }

      gm.addRandomTile = () => {
        gm.grid.insertTile(new Tile({ x: 0, y: 3 }, 128));
      };

      gm.move(0); // Up: board fills and no moves remain
      expect(gm.movesAvailable()).toBe(false);
      expect(gm.over).toBe(true);
      expect(gm.won).toBe(true);
      expect(gm.isGameTerminated()).toBe(true);
      expect(mockActuator.lastMeta.over).toBe(true);
      expect(mockActuator.lastMeta.won).toBe(true);
      expect(mockActuator.lastMeta.keepPlaying).toBe(true);
    });
  });

  describe('Game Over Detection', () => {
    it('should detect game over and set over flag when no moves are available', () => {
      gm.grid = new gm.grid.constructor(4);
      // Col 0: (0, 0)=2, (0, 1)=2, (0, 2)=8, (0, 3)=16
      gm.grid.insertTile(new Tile({ x: 0, y: 0 }, 2));
      gm.grid.insertTile(new Tile({ x: 0, y: 1 }, 2));
      gm.grid.insertTile(new Tile({ x: 0, y: 2 }, 8));
      gm.grid.insertTile(new Tile({ x: 0, y: 3 }, 16));

      // Cols 1..3: checkerboard of 32 and 64
      for (let x = 1; x < 4; x++) {
        for (let y = 0; y < 4; y++) {
          gm.grid.insertTile(new Tile({ x, y }, (x + y) % 2 === 0 ? 64 : 32));
        }
      }

      // When moving Up (0), (0, 0) and (0, 1) merge into 4 at (0, 0),
      // (0, 2) moves to (0, 1), (0, 3) moves to (0, 2), leaving (0, 3) as the only available cell!
      // Mock addRandomTile to place 128 at (0, 3):
      gm.addRandomTile = () => {
        gm.grid.insertTile(new Tile({ x: 0, y: 3 }, 128));
      };

      gm.move(0); // Up: merges 2+2 into 4, then spawns 128 at (0, 3)
      expect(gm.movesAvailable()).toBe(false);
      expect(gm.over).toBe(true);
      expect(gm.isGameTerminated()).toBe(true);
      expect(mockActuator.lastMeta.over).toBe(true);
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
        { score: 100.5, over: false, won: false, grid: { size: 4, cells: Array.from({ length: 4 }, () => Array(4).fill(null)) } },
        { score: -5, over: false, won: false, grid: { size: 4, cells: Array.from({ length: 4 }, () => Array(4).fill(null)) } },
        {
          score: 100,
          over: false,
          won: false,
          grid: {
            size: 4,
            cells: Array.from({ length: 4 }, (_, x) =>
              Array.from({ length: 4 }, (_, y) => (x === 0 && y === 0 ? { position: { x: 0, y: 0 }, value: 3 } : null))
            ),
          },
        },
        {
          score: 100,
          over: false,
          won: false,
          grid: {
            size: 4,
            cells: Array.from({ length: 4 }, (_, x) =>
              Array.from({ length: 4 }, (_, y) => (x === 0 && y === 0 ? { position: { x: 0, y: 0 }, value: 2.5 } : null))
            ),
          },
        },
        {
          score: 100,
          over: false,
          won: false,
          grid: {
            size: 4,
            cells: Array.from({ length: 4 }, (_, x) =>
              Array.from({ length: 4 }, (_, y) => (x === 0 && y === 0 ? { position: { x: 0, y: 0 }, value: 4294967298 } : null))
            ),
          },
        },
        {
          score: 100,
          over: false,
          won: false,
          grid: {
            size: 4,
            cells: Array.from({ length: 4 }, (_, x) =>
              Array.from({ length: 4 }, (_, y) => (x === 0 && y === 0 ? { position: { x: 0, y: 0 }, value: 12884901888 } : null))
            ),
          },
        },
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

    it('should correctly validate powers of two using BigInt to prevent 32-bit bitwise overflow', () => {
      expect(gm.isPowerOfTwo(2)).toBe(true);
      expect(gm.isPowerOfTwo(2048)).toBe(true);
      expect(gm.isPowerOfTwo(4294967296)).toBe(true); // 2^32
      expect(gm.isPowerOfTwo(8589934592)).toBe(true); // 2^33

      expect(gm.isPowerOfTwo(3)).toBe(false);
      expect(gm.isPowerOfTwo(2.5)).toBe(false);
      expect(gm.isPowerOfTwo(4294967298)).toBe(false); // 2^32 + 2: 32-bit bitwise overflow trap
      expect(gm.isPowerOfTwo(12884901888)).toBe(false); // 3 * 2^32
      expect(gm.isPowerOfTwo(-4)).toBe(false);
      expect(gm.isPowerOfTwo(0)).toBe(false);
      expect(gm.isPowerOfTwo(1)).toBe(false);
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
