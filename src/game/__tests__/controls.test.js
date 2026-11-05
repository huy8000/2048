import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { KeyboardInputManager } from '../KeyboardInputManager.js';

describe('KeyboardInputManager', () => {
  let manager;

  beforeEach(() => {
    manager = new KeyboardInputManager();
  });

  afterEach(() => {
    manager.destroy();
  });

  it('should map arrow keys to directions', () => {
    let lastDirection;
    manager.on('move', (dir) => {
      lastDirection = dir;
    });

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', code: 'ArrowUp' }));
    expect(lastDirection).toBe(0); // Up

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', code: 'ArrowRight' }));
    expect(lastDirection).toBe(1); // Right

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', code: 'ArrowDown' }));
    expect(lastDirection).toBe(2); // Down

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', code: 'ArrowLeft' }));
    expect(lastDirection).toBe(3); // Left
  });

  it('should map WASD keys to directions', () => {
    let lastDirection;
    manager.on('move', (dir) => {
      lastDirection = dir;
    });

    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }));
    expect(lastDirection).toBe(0);

    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD' }));
    expect(lastDirection).toBe(1);

    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyS' }));
    expect(lastDirection).toBe(2);

    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA' }));
    expect(lastDirection).toBe(3);
  });

  it('should trigger restart on R key', () => {
    let restarted = false;
    manager.on('restart', () => {
      restarted = true;
    });

    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyR' }));
    expect(restarted).toBe(true);
  });

  it('should ignore keypresses with modifier keys', () => {
    let moved = false;
    manager.on('move', () => {
      moved = true;
    });

    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW', ctrlKey: true }));
    expect(moved).toBe(false);
  });
});
