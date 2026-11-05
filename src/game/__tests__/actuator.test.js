import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { HTMLActuator } from '../HTMLActuator.js';
import { Tile } from '../Tile.js';

describe('HTMLActuator DOM Rendering', () => {
  let actuator;
  let tileContainer;
  let scoreContainer;
  let bestContainer;
  let messageContainer;

  beforeEach(() => {
    document.body.innerHTML = `
      <div class="score-container">0</div>
      <div class="best-container">0</div>
      <div class="game-container">
        <div class="game-message">
          <p></p>
          <div class="lower">
            <button type="button" class="keep-playing-button">Keep going</button>
            <button type="button" class="retry-button">Try again</button>
          </div>
        </div>
        <div class="tile-container"></div>
      </div>
    `;

    tileContainer = document.querySelector('.tile-container');
    scoreContainer = document.querySelector('.score-container');
    bestContainer = document.querySelector('.best-container');
    messageContainer = document.querySelector('.game-message');

    actuator = new HTMLActuator();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should initialize with score 0 and query containers', () => {
    expect(actuator.score).toBe(0);
    expect(actuator.tileContainer).toBe(tileContainer);
    expect(actuator.scoreContainer).toBe(scoreContainer);
  });

  it('should add tile with correct classes and inner value', () => {
    const tile = new Tile({ x: 0, y: 0 }, 2);
    actuator.addTile(tile);

    const tileElem = tileContainer.querySelector('.tile');
    expect(tileElem).not.toBeNull();
    expect(tileElem.classList.contains('tile-2')).toBe(true);
    expect(tileElem.classList.contains('tile-position-1-1')).toBe(true);
    expect(tileElem.classList.contains('tile-new')).toBe(true);
    expect(tileElem.querySelector('.tile-inner').textContent).toBe('2');
  });

  it('should add super tile class for values > 2048', () => {
    const tile = new Tile({ x: 1, y: 2 }, 4096);
    actuator.addTile(tile);

    const tileElem = tileContainer.querySelector('.tile');
    expect(tileElem.classList.contains('tile-super')).toBe(true);
  });

  it('should update score and show addition badge on score increase', () => {
    actuator.updateScore(100);
    expect(scoreContainer.textContent).toContain('100');

    actuator.updateScore(150);
    expect(scoreContainer.textContent).toContain('150');
    const addition = scoreContainer.querySelector('.score-addition');
    expect(addition).not.toBeNull();
    expect(addition.textContent).toBe('+50');
  });

  it('should update best score container', () => {
    actuator.updateBestScore(2048);
    expect(bestContainer.textContent).toBe('2048');
  });

  it('should show game-won and game-over messages and clear them on continueGame()', () => {
    actuator.message(true); // Win
    expect(messageContainer.classList.contains('game-won')).toBe(true);
    expect(messageContainer.querySelector('p').textContent).toBe('You win!');

    actuator.continueGame();
    expect(messageContainer.classList.contains('game-won')).toBe(false);

    actuator.message(false); // Game Over
    expect(messageContainer.classList.contains('game-over')).toBe(true);
    expect(messageContainer.querySelector('p').textContent).toBe('Game over!');

    actuator.continueGame();
    expect(messageContainer.classList.contains('game-over')).toBe(false);
  });
});
