'use strict';

/**
 * This class represents the game.
 * Now it has a basic structure, that is needed for testing.
 * Feel free to add more props and methods if needed.
 */

class Game {
  /**
   * Creates a new game instance.
   *
   * @param {number[][]} initialState
   * The initial state of the board.
   * @default
   * [[0, 0, 0, 0],
   *  [0, 0, 0, 0],
   *  [0, 0, 0, 0],
   *  [0, 0, 0, 0]]
   *
   * If passed, the board will be initialized with the provided
   * initial state.
   */
  state = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];
  score = 0;
  statuses = {
    IDLE: 'idle',
    PLAYING: 'playing',
    WIN: 'win',
    LOSE: 'lose',
  };
  status = this.statuses.IDLE;

  constructor(initialState) {
    // eslint-disable-next-line no-console
    console.log(initialState);

    if (initialState) {
      this.state = initialState;
    } else {
      this.init();
    }

    const table = document.querySelector('.game-field');

    this.rows = table.querySelectorAll('tbody tr');
    this.start();
  }

  moveLeft() {
    this.makeShift('left');
  }

  moveRight() {
    this.makeShift('right');
  }

  moveUp() {
    this.makeShift('up');
  }

  moveDown() {
    this.makeShift('down');
  }

  /**
   * @returns {number}
   */
  getScore() {}

  /**
   * @returns {number[][]}
   */
  getState() {
    return this.state;
  }

  /**
   * Returns the current game status.
   *
   * @returns {string} One of: 'idle', 'playing', 'win', 'lose'
   *
   * `idle` - the game has not started yet (the initial state);
   * `playing` - the game is in progress;
   * `win` - the game is won;
   * `lose` - the game is lost
   */
  getStatus() {
    return this.status;
  }

  /**
   * Starts the game.
   */
  start() {
    const startButton = document.querySelector('.button.start');

    const clickHandler = () => {
      startButton.innerText = 'Restart';
      startButton.className = 'button restart';
      this.updateField();
      this.restart();
      this.addKeyboardListeners();
      this.updateMessage();
      startButton.removeEventListener('click', clickHandler);
    };

    startButton.addEventListener('click', clickHandler);
  }

  /**
   * Resets the game.
   */
  restart() {
    const reStartButton = document.querySelector('.button.restart');
    const clickHandler = () => {
      reStartButton.innerText = 'Start';
      reStartButton.className = 'button start';
      this.state.forEach((row) => row.fill(0));
      this.updateField();
      this.init();
      this.start();
      reStartButton.removeEventListener('click', clickHandler);
    };

    reStartButton.addEventListener('click', clickHandler);
  }

  // Add your own methods here
  init() {
    let newPosition = this.getNewPosition();

    this.state[newPosition[0]][newPosition[1]] = this.getNewNumber();
    newPosition = this.getNewPosition();
    this.state[newPosition[0]][newPosition[1]] = this.getNewNumber();
  }

  getNewPosition() {
    const positions = this.getFreeCells();
    const randomPosition = Math.floor(Math.random() * positions.length);

    return positions[randomPosition];
  }

  getNewNumber() {
    const randomNumber = Math.random();

    return randomNumber > 0.9 ? 4 : 2;
  }

  getFreeCells() {
    const freeCells = [];

    for (let i = 0; i < this.state.length; i++) {
      for (let j = 0; j < this.state.length; j++) {
        if (this.state[i][j] === 0) {
          freeCells.push([i, j]);
        }
      }
    }

    return freeCells;
  }

  updateField() {
    const scoreElement = document.querySelector('.game-score');

    scoreElement.innerText = this.score;

    for (let i = 0; i < this.rows.length; i++) {
      for (let j = 0; j < this.rows.length; j++) {
        if (this.state[i][j] === 0) {
          this.rows[i].cells[j].textContent = '';
          this.rows[i].cells[j].className = 'field-cell';
        } else {
          this.rows[i].cells[j].textContent = this.state[i][j];

          this.rows[i].cells[j].className =
            `field-cell field-cell--${this.state[i][j]}`;
        }
      }
    }

    if (this.isWin()) {
      this.status = this.statuses.WIN;
      this.updateMessage();
    }
  }

  isWin() {
    let flag = false;

    this.state.forEach((row) => {
      row.forEach((cell) => {
        if (cell === 2048) {
          flag = true;
        }
      });
    });

    return flag;
  }

  addKeyboardListeners() {
    document.addEventListener('keydown', (evt) => {
      switch (evt.key) {
        case 'ArrowLeft':
          this.moveLeft();
          break;
        case 'ArrowRight':
          this.moveRight();
          break;
        case 'ArrowUp':
          this.moveUp();
          break;
        case 'ArrowDown':
          this.moveDown();
          break;
        default:
          break;
      }
    });
  }

  makeShift(direction) {
    let newState = [];
    const mergeMatrix = (matrix) => {
      const newMatrix = [];
      const cleanState = matrix.map((row) => [...row.filter((n) => n !== 0)]);

      for (let i = 0; i < matrix.length; i++) {
        newMatrix.push([]);

        for (let j = 0; j < cleanState[i].length; j++) {
          if (cleanState[i][j] === cleanState[i][j + 1]) {
            const sum = cleanState[i][j] * 2;

            newMatrix[i].push(sum);
            this.score += sum;
            j++;
          } else {
            newMatrix[i].push(cleanState[i][j]);
          }
        }
      }

      newMatrix.forEach((row) => {
        const index = row.length;

        row.length = this.state.length;
        row.fill(0, index);
      });

      return newMatrix;
    };

    if (direction === 'left') {
      newState = mergeMatrix(this.state).map((row) => [...row]);
    }

    if (direction === 'right') {
      const matrix = this.state.map((row) => [...row].reverse());

      mergeMatrix(matrix).forEach((row, i) => (newState[i] = row.reverse()));
    }

    if (direction === 'up') {
      const matrix = this.state.map((row) => row);
      const rotated90CCW = matrix[0].map((_, colIndex) => {
        return matrix.map((row) => row[row.length - 1 - colIndex]);
      });
      const mergedMatrix = mergeMatrix(rotated90CCW);

      newState = mergedMatrix[0].map((_, colIndex) => {
        return mergedMatrix.map((row) => row[colIndex]).reverse();
      });
    }

    if (direction === 'down') {
      const matrix = this.state.map((row) => row);
      const rotated90CW = matrix[0].map((_, colIndex) => {
        return matrix.map((row) => row[colIndex]).reverse();
      });
      const mergedMatrix = mergeMatrix(rotated90CW);

      newState = mergedMatrix[0].map((_, colIndex) => {
        return mergedMatrix.map((row) => row[row.length - 1 - colIndex]);
      });
    }

    if (this.getFreeCells().length === 0) {
      if (!this.isAvailableMoves()) {
        this.status = this.statuses.LOSE;
        this.updateMessage();
      }
    }

    if (JSON.stringify(newState) !== JSON.stringify(this.state)) {
      this.state = newState;

      const newPosition = this.getNewPosition();

      this.state[newPosition[0]][newPosition[1]] = this.getNewNumber();
      this.updateField();
    }
  }

  isAvailableMoves() {
    let field = this.state.map((row) => [...row]);
    let flag = false;

    for (let i = 0; i < 2; i++) {
      field.forEach((row) => {
        row.reduce((acc, el) => {
          if (acc === el) {
            flag = true;
          }

          return el;
        });
      });

      field = field[0].map((_, colIndex) => {
        return field.map((row) => row[colIndex]).reverse();
      });
    }

    return flag;
  }

  updateMessage() {
    const messages = document.querySelectorAll('.message');
    const messageForUpdate = document.querySelector(`.message-${this.status}`);

    messages.forEach((message) => {
      message.classList.add('hidden');

      if (messageForUpdate) {
        messageForUpdate.classList.remove('hidden');
      }
    });
  }
}

module.exports = Game;
