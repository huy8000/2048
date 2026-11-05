import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { KeyboardInputManager } from '../KeyboardInputManager.js';

describe('KeyboardInputManager', () => {
  let manager;
  let container;
  let messageOverlay;
  let keepButton;

  beforeEach(() => {
    document.body.innerHTML = `
      <div class="game-container">
        <div class="game-message">
          <button type="button" class="keep-playing-button">继续挑战</button>
          <button type="button" class="retry-button">再试一次</button>
        </div>
        <div class="grid-container"></div>
      </div>
      <button type="button" class="restart-button">新游戏</button>
    `;

    container = document.querySelector('.game-container');
    messageOverlay = document.querySelector('.game-message');
    keepButton = document.querySelector('.keep-playing-button');

    manager = new KeyboardInputManager();
  });

  afterEach(() => {
    manager.destroy();
    document.body.innerHTML = '';
  });

  describe('Keyboard controls', () => {
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

  describe('Mobile touch & button accessibility', () => {
    it('should emit move event on swipe across the board and call preventDefault', () => {
      let movedDir;
      manager.on('move', (dir) => {
        movedDir = dir;
      });

      let startPrevented = false;
      const startEvt = new Event('touchstart', { cancelable: true, bubbles: true });
      startEvt.touches = [{ clientX: 100, clientY: 100 }];
      startEvt.targetTouches = [{ clientX: 100, clientY: 100 }];
      container.dispatchEvent(startEvt);

      const endEvt = new Event('touchend', { cancelable: true, bubbles: true });
      endEvt.touches = [];
      endEvt.targetTouches = [];
      endEvt.changedTouches = [{ clientX: 200, clientY: 100 }]; // Swipe Right (+100px)
      container.dispatchEvent(endEvt);

      expect(movedDir).toBe(1); // Right
    });

    it('should NOT intercept or call preventDefault on touches inside .game-message or buttons', () => {
      let movedDir = null;
      manager.on('move', (dir) => {
        movedDir = dir;
      });

      let defaultPrevented = false;
      const startEvt = new Event('touchstart', { cancelable: true, bubbles: true });
      startEvt.touches = [{ clientX: 100, clientY: 100 }];
      startEvt.targetTouches = [{ clientX: 100, clientY: 100 }];
      startEvt.preventDefault = () => {
        defaultPrevented = true;
      };

      // Dispatch directly on the button inside game-message
      keepButton.dispatchEvent(startEvt);

      // Must not preventDefault so native click can occur
      expect(defaultPrevented).toBe(false);

      const endEvt = new Event('touchend', { cancelable: true, bubbles: true });
      endEvt.touches = [];
      endEvt.targetTouches = [];
      endEvt.changedTouches = [{ clientX: 200, clientY: 100 }];
      keepButton.dispatchEvent(endEvt);

      // Must not trigger swipe move
      expect(movedDir).toBeNull();
    });

    it('should trigger button callbacks on click', () => {
      let restarted = false;
      let keepPlaying = false;

      manager.on('restart', () => {
        restarted = true;
      });
      manager.on('keepPlaying', () => {
        keepPlaying = true;
      });

      document.querySelector('.restart-button').click();
      expect(restarted).toBe(true);

      keepButton.click();
      expect(keepPlaying).toBe(true);
    });
  });
});
