export class KeyboardInputManager {
  constructor() {
    this.events = {};
    this.handlers = [];

    this.listen();
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  emit(event, data) {
    const callbacks = this.events[event];
    if (callbacks) {
      callbacks.forEach((callback) => {
        callback(data);
      });
    }
  }

  listen() {
    // 0: up, 1: right, 2: down, 3: left
    const keyMap = {
      ArrowUp: 0,
      KeyW: 0,
      KeyK: 0,
      ArrowRight: 1,
      KeyD: 1,
      KeyL: 1,
      ArrowDown: 2,
      KeyS: 2,
      KeyJ: 2,
      ArrowLeft: 3,
      KeyA: 3,
      KeyH: 3,
    };

    const whichMap = {
      38: 0, // Up
      39: 1, // Right
      40: 2, // Down
      37: 3, // Left
      75: 0, // Vim K
      76: 1, // Vim L
      74: 2, // Vim J
      72: 3, // Vim H
      87: 0, // W
      68: 1, // D
      83: 2, // S
      65: 3, // A
    };

    // Respond to direction keys
    const keydownHandler = (event) => {
      const modifiers =
        event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;

      let mapped;
      if (event.code && Object.prototype.hasOwnProperty.call(keyMap, event.code)) {
        mapped = keyMap[event.code];
      } else if (event.key && Object.prototype.hasOwnProperty.call(keyMap, event.key)) {
        mapped = keyMap[event.key];
      } else if (event.which && Object.prototype.hasOwnProperty.call(whichMap, event.which)) {
        mapped = whichMap[event.which];
      }

      if (!modifiers) {
        if (mapped !== undefined) {
          event.preventDefault();
          this.emit('move', mapped);
        }

        // R key restarts the game
        if (event.code === 'KeyR' || event.key === 'r' || event.key === 'R' || event.which === 82) {
          event.preventDefault();
          this.emit('restart');
        }
      }
    };

    document.addEventListener('keydown', keydownHandler);
    this.handlers.push({ target: document, type: 'keydown', fn: keydownHandler });

    // Respond to button presses
    this.bindButtonPress('.retry-button', (e) => this.restart(e));
    this.bindButtonPress('.restart-button', (e) => this.restart(e));
    this.bindButtonPress('.keep-playing-button', (e) => this.keepPlaying(e));

    // Respond to swipe events
    let touchStartClientX = 0;
    let touchStartClientY = 0;
    const gameContainer = document.querySelector('.game-container');

    if (gameContainer) {
      const touchstartHandler = (event) => {
        if (event.touches.length > 1 || (event.targetTouches && event.targetTouches.length > 1)) {
          return; // Ignore if touching with more than 1 finger
        }

        touchStartClientX = event.touches[0].clientX;
        touchStartClientY = event.touches[0].clientY;

        event.preventDefault();
      };

      const touchmoveHandler = (event) => {
        event.preventDefault();
      };

      const touchendHandler = (event) => {
        if (event.touches.length > 0 || (event.targetTouches && event.targetTouches.length > 0)) {
          return; // Ignore if still touching with one or more fingers
        }

        const touchEndClientX = event.changedTouches[0].clientX;
        const touchEndClientY = event.changedTouches[0].clientY;

        const dx = touchEndClientX - touchStartClientX;
        const absDx = Math.abs(dx);

        const dy = touchEndClientY - touchStartClientY;
        const absDy = Math.abs(dy);

        if (Math.max(absDx, absDy) > 10) {
          // (right : left) : (down : up)
          this.emit('move', absDx > absDy ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0));
        }
      };

      gameContainer.addEventListener('touchstart', touchstartHandler, { passive: false });
      gameContainer.addEventListener('touchmove', touchmoveHandler, { passive: false });
      gameContainer.addEventListener('touchend', touchendHandler, { passive: false });

      this.handlers.push({ target: gameContainer, type: 'touchstart', fn: touchstartHandler });
      this.handlers.push({ target: gameContainer, type: 'touchmove', fn: touchmoveHandler });
      this.handlers.push({ target: gameContainer, type: 'touchend', fn: touchendHandler });
    }
  }

  restart(event) {
    if (event && event.preventDefault) event.preventDefault();
    this.emit('restart');
  }

  keepPlaying(event) {
    if (event && event.preventDefault) event.preventDefault();
    this.emit('keepPlaying');
  }

  bindButtonPress(selector, fn) {
    const buttons = document.querySelectorAll(selector);
    buttons.forEach((button) => {
      button.addEventListener('click', fn);
      this.handlers.push({ target: button, type: 'click', fn });
    });
  }

  destroy() {
    this.handlers.forEach(({ target, type, fn }) => {
      target.removeEventListener(type, fn);
    });
    this.handlers = [];
    this.events = {};
  }
}
