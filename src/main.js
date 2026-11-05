import './style/main.css';
import { GameManager } from './game/GameManager.js';
import { KeyboardInputManager } from './game/KeyboardInputManager.js';
import { HTMLActuator } from './game/HTMLActuator.js';
import { LocalStorageManager } from './game/LocalStorageManager.js';

// Wait till the browser is ready to render the game (avoids glitches)
window.requestAnimationFrame(() => {
  window.game = new GameManager(
    4,
    KeyboardInputManager,
    HTMLActuator,
    LocalStorageManager
  );
});
