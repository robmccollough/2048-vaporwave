/*
Add your code for Game here
 */
export default class Game {
	constructor(size, animate) {
		this.size = size;
		this.gameState = {};
		this.hints = false;
		this.totalMoves = 0;
		this.win_observers = [];
		this.move_observers = [];
		this.animation_index_map = {};
		this.lose_observers = [];
		this.isContinuing = false;
		this.animation_coordinate_map = {};
		this.animate = animate;
		this.setupNewGame();
	}

	// resets the game back to a random starting position
	setupNewGame() {
		this.gameState = {
			board: this.addRandomTile(
				this.addRandomTile(new Array(this.size * this.size).fill(0))
			),
			score: 0,
			won: false,
			over: false
		};
		this.totalmoves = 0;
		this.validmoves = this.getHints().length;
	}

	// given a gameState object, it loads that position, score, etc...
	loadGame(gameState) {
		this.gameState = gameState;
	}

	// given up, down, left, or right as string input, it makes the appropriate shifts and adds a random tile.
	move(direction) {
		let slide_dir = direction == "right" || direction == "down" ? -1 : 1;
		let newboard;
		if (direction == "right" || direction == "left") {
			newboard = this.operate(this.gameState.board, slide_dir, direction);
		} else {
			newboard = this.transpose(
				this.operate(this.transpose(this.gameState.board), slide_dir, direction)
			);
		}

		let changed = this.areDifferent(this.gameState.board, newboard);
		this.gameState.board = changed ? this.addRandomTile(newboard) : newboard;

		if (this.hasValidMoves()) {
			this.gameState.over = false;
			this.notifyMoveObservers(direction);
			// this.animate(direction, changed);
			this.totalMoves += 1;
		} else {
			this.gameState.over = true;
			this.notifyLoseObservers();
		}

		if (this.hasWon()) {
			this.gameState.over = true;
			this.gameState.won = true;
			if (!this.isContinuing) {
				this.notifyWinObservers();
			}
		}
	}

	operate(board, dir, animate) {
		//if dir valid

		let operated = [];
		if (dir == 0) {
			return arr;
		}

		//goes through rows of board
		for (let i = 0; i < this.size; i++) {
			let index_range = [i * this.size, i * this.size + this.size];

			let row = board.slice(index_range[0], index_range[1]);
			let newRow = this.slide(this.combine(this.slide(row, dir)), dir);
			operated = operated.concat(newRow);

			//build mapping to new indexes for animation
			//always start from left edge of row
			if (animate === "right" || animate === "left") {
				for (let j = index_range[0]; j < index_range[1]; j++) {
					let new_index;
					if (dir > 0) {
						//left
						//if left check everything to the left of each j
						new_index = index_range[0];
						for (let k = j; k >= index_range[0]; k--) {
							if (board[k] !== board[j] && board[k] !== 0) {
								new_index += 1;
							}
						}
					} else {
						//right
						//if right check everythining to right of each j
						new_index = index_range[1] - 1;
						for (let k = index_range[1] - 1; k < index_range[1]; k++) {
							if (board[k] !== board[j] && board[k] !== 0) {
								new_index -= 1;
							}
						}
					}

					this.animation_index_map[j] = new_index;
				}
			}
		}

		return operated;
	}

	//slides row based on direction 1 -> left, -1 -> right
	slide(row, dir) {
		let nonzero = row.filter(val => val);
		nonzero = nonzero.concat(new Array(row.length - nonzero.length).fill(0));
		return dir > 0 ? nonzero : nonzero.reverse();
	}

	combine(row) {
		let combined = Array.from(row);
		for (let i = 0; i < combined.length - 1; i++) {
			if (combined[i] === combined[i + 1]) {
				combined[i] = 2 * combined[i];
				this.gameState.score += combined[i];
				combined[i + 1] = 0;
			}
		}
		return combined;
	}

	hasValidMoves() {
		//save time, if there is an empty spot theres always a valid move
		if (this.gameState.board.includes(0)) {
			return true;
		}
		//otherwise, handle rare case where every spot is full but valid moves remain
		// search for ortogonally equal values
		return this.gameState.board.some((val, i, b) => {
			//if on some edge just dont check that part and make it false
			return (
				(i % this.size == this.size - 1 ? false : val === b[i + 1]) ||
				(i % this.size == 0 ? false : val === b[i - 1]) ||
				(b.length - this.size < i && i < b.length
					? false
					: val === b[i + this.size]) ||
				(0 < i && i < this.size ? false : val === b[i - this.size])
			);
		});
	}

	//returns an array in the form [{index1, index2}] representing position of match
	//similar to validmoves search
	getHints(singular = false) {
		if (!this.hasValidMoves()) {
			return null;
		}

		let match_pairs = [];
		let match_index = new Set();
		this.gameState.board.forEach((val, index, board) => {
			if (val == 0) {
				return;
			}
			if (!(index % this.size == this.size - 1) && val === board[index + 1]) {
				match_index.add(index);
				match_pairs.push({
					index1: index,
					index2: index + 1
				});
			} else if (!(index % this.size == 0) && val === board[index - 1]) {
				match_index.add(index);
				match_pairs.push({
					index1: index,
					index2: index - 1
				});
			} else if (
				!(board.length - this.size < index && index < board.length) &&
				val === board[index + this.size]
			) {
				match_index.add(index);
				match_pairs.push({
					index1: index,
					index2: index + this.size
				});
			} else if (
				!(0 < index && index < this.size) &&
				val === board[index - this.size]
			) {
				match_index.add(index);
				match_pairs.push({
					index1: index,
					index2: index - this.size
				});
			}
		});
		return singular ? match_index : match_pairs;
	}

	hasWon() {
		return this.gameState.board.includes(2048);
	}

	//Compare 2 boards, returns immediately if discrepancy found
	areDifferent(b1, b2) {
		if (b1.length !== b2.length) {
			return true;
		}
		return b1.some((val, index) => val !== b2[index]);
	}

	//dont need this, but might be useful
	to2DArray(board) {
		let newarr = [];
		while (board.length) {
			newarr.push(board.splice(0, this.size));
		}
		return newarr;
	}

	//same here
	to1DArray(board_2D) {
		return board_2D.reduce((total = [], val) => total.concat(val));
	}

	//2D arr input returns 2d array
	//1D arr input returns 1D
	transpose(arr) {
		if (Array.isArray(arr[0])) {
			return arr[0].map((col, i) => arr.map(row => row[i]));
		} else {
			let t = new Array(arr.length);
			for (let i = 0; i < this.size; i++) {
				for (let j = 0; j < this.size; j++) {
					t[i + this.size * j] = arr[j + this.size * i];
				}
			}
			return t;
		}
	}

	//adds tile and returns new board
	addRandomTile(board) {
		//open indicies
		let open = [];
		board.forEach((elt, index) => {
			if (elt === 0) {
				open.push(index);
			}
		});
		board[open[Math.floor(Math.random() * open.length)]] =
			Math.floor(Math.random() * 100) < 10 ? 4 : 2;
		return board;
	}

	// returns a string that is a text/ascii version of the game. See the gameState section above for an example.
	//This will not be graded, but it useful for your testing purposes when you run the game in the console.
	//(run_in_console.js trying to print the .toString() function after every move).
	toString() {
		//parse individual indexes
		let hints = this.getHints(true);
		let hintnum = this.getHints().length;
		let gameboard = this.gameState.board.map((val, index) => {
			return this.hints
				? val !== 0 && hints.has(index)
					? `[\x1b[32m${val}\x1b[0m]`
					: `[${val}]`
				: `[${val}]`;
		});
		let gamestr = "\t";

		for (let i = 0; i < gameboard.length; i++) {
			gamestr +=
				(i + 1) % this.size == 0 ? `${gameboard[i]}\n\t` : `${gameboard[i]} `;
		}
		gamestr += `Score: ${this.gameState.score}\tValid Moves: ${hintnum}\n\tTotal Moves: ${this.totalMoves}`;
		return gamestr;
	}

	// Takes a callback, when a move is made, every observer should be called with the games current gameState
	onMove(callback) {
		this.move_observers.push(callback);
	}

	notifyMoveObservers() {
		this.move_observers.forEach(callback => {
			callback(this.gameState);
		});
	}

	//Takes a callback, when the game is won, every observer should be called with the games current gameState.
	onWin(callback) {
		this.win_observers.push(callback);
	}

	notifyWinObservers() {
		this.win_observers.forEach(callback => {
			callback(this.gameState);
		});
	}

	// Takes a callback, when the game is lost, every observer should be called with the games current gameState.
	onLose(callback) {
		this.lose_observers.push(callback);
	}

	notifyLoseObservers() {
		this.lose_observers.forEach(callback => {
			callback(this.gameState);
		});
	}

	// returns a accurate gameState object.
	getGameState() {
		return this.gameState;
	}

	toggleHints() {
		this.hints = !this.hints;
	}

	continueAfterWin() {
		this.isContinuing = true;
	}
}
