import { describe, it, expect } from 'vitest';
import { Tile } from '../Tile.js';

describe('Tile', () => {
  it('should initialize with position and default value 2', () => {
    const tile = new Tile({ x: 1, y: 2 });
    expect(tile.x).toBe(1);
    expect(tile.y).toBe(2);
    expect(tile.value).toBe(2);
    expect(tile.previousPosition).toBeNull();
    expect(tile.mergedFrom).toBeNull();
  });

  it('should allow custom value', () => {
    const tile = new Tile({ x: 0, y: 0 }, 16);
    expect(tile.value).toBe(16);
  });

  it('should save position correctly', () => {
    const tile = new Tile({ x: 2, y: 3 });
    tile.savePosition();
    expect(tile.previousPosition).toEqual({ x: 2, y: 3 });
  });

  it('should update position', () => {
    const tile = new Tile({ x: 0, y: 0 });
    tile.updatePosition({ x: 3, y: 1 });
    expect(tile.x).toBe(3);
    expect(tile.y).toBe(1);
  });

  it('should serialize correctly', () => {
    const tile = new Tile({ x: 2, y: 1 }, 8);
    expect(tile.serialize()).toEqual({
      position: { x: 2, y: 1 },
      value: 8,
    });
  });
});
