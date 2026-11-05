import { describe, it, expect, beforeEach } from 'vitest';
import { LocalStorageManager } from '../LocalStorageManager.js';

describe('LocalStorageManager', () => {
  let manager;

  beforeEach(() => {
    window.localStorage.clear();
    manager = new LocalStorageManager();
  });

  it('should get default best score 0', () => {
    expect(manager.getBestScore()).toBe(0);
  });

  it('should save and retrieve best score', () => {
    manager.setBestScore(1024);
    expect(manager.getBestScore()).toBe(1024);
  });

  it('should save, retrieve and clear game state', () => {
    const state = { score: 100, over: false, won: false };
    manager.setGameState(state);

    expect(manager.getGameState()).toEqual(state);

    manager.clearGameState();
    expect(manager.getGameState()).toBeNull();
  });
});
