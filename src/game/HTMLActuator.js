export class HTMLActuator {
  constructor() {
    this.tileContainer = document.querySelector('.tile-container');
    this.scoreContainer = document.querySelector('.score-container');
    this.bestContainer = document.querySelector('.best-container');
    this.messageContainer = document.querySelector('.game-message');

    this.score = 0;
  }

  actuate(grid, metadata) {
    window.requestAnimationFrame(() => {
      this.clearContainer(this.tileContainer);

      grid.cells.forEach((column) => {
        column.forEach((cell) => {
          if (cell) {
            this.addTile(cell);
          }
        });
      });

      this.updateScore(metadata.score);
      this.updateBestScore(metadata.bestScore);

      if (metadata.terminated) {
        if (metadata.over) {
          if (metadata.won && !metadata.keepPlaying) {
            // Reached 2048 on the final possible move without having chosen to keep going yet:
            // Celebrate victory, but do not show "Keep going" since no moves remain.
            this.message(true, false);
          } else {
            // Either regular game over, or game over after choosing to keep playing past 2048:
            this.message(false);
          }
        } else if (metadata.won) {
          // Reached 2048 with moves still available: regular victory with "Keep going" option
          this.message(true, true);
        }
      }
    });
  }

  // Continues the game (both restart and keep playing)
  continueGame() {
    this.clearMessage();
  }

  clearContainer(container) {
    if (!container) return;
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }

  addTile(tile) {
    if (!this.tileContainer) return;

    const wrapper = document.createElement('div');
    const inner = document.createElement('div');
    const position = tile.previousPosition || { x: tile.x, y: tile.y };
    const positionClass = this.positionClass(position);

    const classes = ['tile', `tile-${tile.value}`, positionClass];

    if (tile.value > 2048) classes.push('tile-super');

    this.applyClasses(wrapper, classes);

    inner.classList.add('tile-inner');
    inner.textContent = tile.value;

    if (tile.previousPosition) {
      // Make sure that the tile gets rendered in the previous position first
      window.requestAnimationFrame(() => {
        classes[2] = this.positionClass({ x: tile.x, y: tile.y });
        this.applyClasses(wrapper, classes); // Update the position
      });
    } else if (tile.mergedFrom) {
      classes.push('tile-merged');
      this.applyClasses(wrapper, classes);

      // Render the tiles that merged
      tile.mergedFrom.forEach((merged) => {
        this.addTile(merged);
      });
    } else {
      classes.push('tile-new');
      this.applyClasses(wrapper, classes);
    }

    // Add the inner part of the tile to the wrapper
    wrapper.appendChild(inner);

    // Put the tile on the board
    this.tileContainer.appendChild(wrapper);
  }

  applyClasses(element, classes) {
    element.setAttribute('class', classes.join(' '));
  }

  normalizePosition(position) {
    return { x: position.x + 1, y: position.y + 1 };
  }

  positionClass(position) {
    const norm = this.normalizePosition(position);
    return `tile-position-${norm.x}-${norm.y}`;
  }

  updateScore(score) {
    if (!this.scoreContainer) return;
    this.clearContainer(this.scoreContainer);

    const difference = score - this.score;
    this.score = score;

    this.scoreContainer.textContent = this.score;

    if (difference > 0) {
      const addition = document.createElement('div');
      addition.classList.add('score-addition');
      addition.textContent = `+${difference}`;

      this.scoreContainer.appendChild(addition);
    }
  }

  updateBestScore(bestScore) {
    if (!this.bestContainer) return;
    this.bestContainer.textContent = bestScore;
  }

  message(won, canKeepGoing = true) {
    if (!this.messageContainer) return;
    const type = won ? 'game-won' : 'game-over';
    const message = won ? 'You win!' : 'Game over!';

    this.messageContainer.classList.add(type);
    const p = this.messageContainer.getElementsByTagName('p')[0];
    if (p) p.textContent = message;

    const keepButton = this.messageContainer.querySelector('.keep-playing-button');
    if (keepButton) {
      keepButton.style.display = won && canKeepGoing ? 'inline-block' : 'none';
    }
  }

  clearMessage() {
    if (!this.messageContainer) return;
    this.messageContainer.classList.remove('game-won', 'game-over');
    const keepButton = this.messageContainer.querySelector('.keep-playing-button');
    if (keepButton) {
      keepButton.style.display = '';
    }
  }
}
