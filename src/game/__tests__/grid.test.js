import { describe, it, expect } from 'vitest';
import { Grid } from '../Grid.js';
import { Tile } from '../Tile.js';

describe('Grid', () => {
  it('should initialize empty 4x4 grid', () => {
    const grid = new Grid(4);
    expect(grid.size).toBe(4);
    expect(grid.cells.length).toBe(4);
    expect(grid.availableCells().length).toBe(16);
    expect(grid.cellsAvailable()).toBe(true);
  });

  it('should check boundaries properly', () => {
    const grid = new Grid(4);
    expect(grid.withinBounds({ x: 0, y: 0 })).toBe(true);
    expect(grid.withinBounds({ x: 3, y: 3 })).toBe(true);
    expect(grid.withinBounds({ x: -1, y: 0 })).toBe(false);
    expect(grid.withinBounds({ x: 4, y: 2 })).toBe(false);
  });

  it('should insert and remove tiles', () => {
    const grid = new Grid(4);
    const tile = new Tile({ x: 1, y: 2 }, 4);

    grid.insertTile(tile);
    expect(grid.cellOccupied({ x: 1, y: 2 })).toBe(true);
    expect(grid.cellContent({ x: 1, y: 2 })).toBe(tile);
    expect(grid.availableCells().length).toBe(15);

    grid.removeTile(tile);
    expect(grid.cellOccupied({ x: 1, y: 2 })).toBe(false);
    expect(grid.cellContent({ x: 1, y: 2 })).toBeNull();
    expect(grid.availableCells().length).toBe(16);
  });

  it('should serialize and deserialize from state', () => {
    const grid = new Grid(4);
    const tile = new Tile({ x: 0, y: 1 }, 8);
    grid.insertTile(tile);

    const serialized = grid.serialize();
    expect(serialized.size).toBe(4);
    expect(serialized.cells[0][1]).toEqual({
      position: { x: 0, y: 1 },
      value: 8,
    });

    const restored = new Grid(serialized.size, serialized.cells);
    expect(restored.cellOccupied({ x: 0, y: 1 })).toBe(true);
    expect(restored.cellContent({ x: 0, y: 1 }).value).toBe(8);
  });
});
