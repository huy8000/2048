const fakeStorage = {
  _data: {},

  setItem(id, val) {
    this._data[id] = String(val);
  },

  getItem(id) {
    return Object.prototype.hasOwnProperty.call(this._data, id)
      ? this._data[id]
      : undefined;
  },

  removeItem(id) {
    delete this._data[id];
  },

  clear() {
    this._data = {};
  },
};

export class LocalStorageManager {
  constructor() {
    this.bestScoreKey = 'bestScore';
    this.gameStateKey = 'gameState';

    const supported = this.localStorageSupported();
    this.storage = supported ? window.localStorage : fakeStorage;
  }

  localStorageSupported() {
    const testKey = 'test';

    try {
      const storage = window.localStorage;
      storage.setItem(testKey, '1');
      storage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  // Best score getters/setters
  getBestScore() {
    return Number(this.storage.getItem(this.bestScoreKey)) || 0;
  }

  setBestScore(score) {
    this.storage.setItem(this.bestScoreKey, score);
  }

  // Game state getters/setters and clearing
  getGameState() {
    const stateJSON = this.storage.getItem(this.gameStateKey);
    try {
      return stateJSON ? JSON.parse(stateJSON) : null;
    } catch {
      return null;
    }
  }

  setGameState(gameState) {
    this.storage.setItem(this.gameStateKey, JSON.stringify(gameState));
  }

  clearGameState() {
    this.storage.removeItem(this.gameStateKey);
  }
}
