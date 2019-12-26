import Game from "./engine/game.js";

const game = new Game(4, animate);
game.onMove(renderBoard);
game.onMove(updateMenu);
game.onWin(renderWin);
game.onLose(renderLose);

function loadGame() {
	let gamecontainer = $("<div/>", {
		class: "board-container",
		id: "board-container"
	});

	let menu = $("<div/>", {
		class: "menu-container"
	}).append(
		$(`<div class='menu-header'></div>`).append(
			...[..."2048"].map(i =>
				$("<img/>", {
					src:
						i !== "0"
							? `./lib/cm-retrofuturism-otf-vaporwave-font-3597346/PNG/123/${i}.png`
							: "./lib/cm-retrofuturism-otf-vaporwave-font-3597346/PNG/ABC/15.png",
					alt: i,
					class: "menu-header-letter"
				})
			)
		),
		$(`<div class='menu-score-label'></div>`),
		$(`<span class='menu-score-value'> 0 </span>`),
		$("<button/>", { class: "new-game-button", html: "New Game" }).on(
			"click",
			() => {
				game.setupNewGame();
				renderBoard(game.getGameState());
				updateMenu(game.getGameState());
			}
		),
		$("<button/>", { class: `toggle-hints`, html: "Toggle Hints" }).on(
			"click",
			() => {
				game.toggleHints();
				updateMenu(game.getGameState());
				renderBoard(game.getGameState());
			}
		)
		// ,
		// $('<button/>',{html:'win'}).on('click', renderWin)
	);

	$("#root").append(menu, gamecontainer);
	renderBoard(game.getGameState());
}

function updateBoard(gamestate) {
	//manipulates dom instead of rerendering
	let hints = game.hints ? game.getHints(true) : false;

	gamestate.board.forEach((value, index) => {
		let tile = $(`.${index}`).children(".tile-inner");

		if (value === 0) {
			tile.addClass("tile-empty");
		} else {
			tile.removeClass("tile-empty");
		}

		if (hints && hints.has(index)) {
			tile.closest("tile_outer").css({
				"background-color": "rgba(0, 255, 0, 0.6)"
			});
		} else {
			tile.closest("tile-outer").css({
				"background-color": "rgba(255, 255, 255, 0.6)"
			});
		}
		tile.html(value);

		// //animation time
		// let old_x = game.animation_coordinate_map[index].x
		// let new_x = game.animation_coordinate_map[game.animation_index_map[index]].x;

		// let dir = new_x - old_x > 0 ? -1 : 1 ;
		// let translation = ( new_x - old_x ) * dir

		//     anime({
		//     targets: `.tile-outer .${index}`,
		//     translateX: translation,
		//     duration: 300,
		//     easing: 'easeOutExpo',
		//     complete: () => console.log('complete')
		// })
	});
}

function renderBoard(gamestate) {
	let dim = (window.innerHeight * 0.8) / game.size;

	let tiles = gamestate.board
		.map(
			//inner tile
			tile =>
				$("<div/>", {
					class: `tile-inner ${tile !== 0 ? "" : "tile-empty"}`,
					html: tile
				})
		)
		.map(
			//outer tile
			(tile, index) => {
				let x = index % game.size;
				let y = Math.floor(index / game.size);

				game.animation_coordinate_map[index] = {
					x: x * dim,
					y: y * dim
				};

				//was trying to make animations but ran out of time

				return $("<div/>", { class: `tile-outer ${index}` })
					.css({
						position: "absolute",
						left: x * dim,
						top: y * dim,
						"background-color": game.hints
							? game.getHints(true).has(index)
								? "rgba(0, 255, 0, 0.6)"
								: "rgba(255, 255, 255, 0.6)"
							: "rgba(255, 255, 255, 0.6)"
					})
					.append(tile);
			}
		);
	$(".board-container").html(tiles);
}

function updateMenu(gameState) {
	$(".menu-score-value").html(gameState.score);
	$(".toggle-hints").css({
		"background-color": game.hints
			? "rgb(147, 241, 147)"
			: "rgba(255, 255, 255, 0.6)"
	});
}

//adds the class, wait for it to finish, then remove the class
let vector_map = {
	left: [-1, 0],
	right: [1, 0],
	up: [0, -1],
	down: [0, 1]
};
function animate(direction, changed) {
	if (changed) {
		$(".tile-inner").addClass(`animating-${direction}`);
		setTimeout(() => {
			$(".tile-inner").removeClass(`animating-${direction}`);
		}, 1200);
	} else {
		$(".tile-inner").addClass(`shimmy`);
		setTimeout(() => {
			// debugger
			$(".tile-inner").removeClass(`shimmy`);
		}, 500);
		// console.log(direction, vector_map[direction])
		// console.log(vector_map[direction][0] * 20,vector_map[direction][0] * -20)
		// anime({
		//     targets: '.tile-inner',
		//     keyframes: [
		//         {translateX: vector_map[direction][0] * 20},
		//         {translateY: vector_map[direction][1] * 20}
		//     ],
		//     duration: 100,
		//     complete: () => console.log('complete')
		// })

		// anime({
		//     targets: '.tile-inner',
		//     keyframes: [
		//         {translateX: vector_map[direction][0] * -20},
		//         {translateY: vector_map[direction][1] * -20}
		//     ],
		//     duration: 100,
		//     complete: () => console.log('complete')
		// })
	}
}

function renderWin() {
	let modal = $("<div/>", { class: "modal modal-win" }).append(
		$("<div/>", { class: "modal-content" }).append(
			$("<img/>", { class: "win-icon" }).attr("src", "./1390585987.jpg"),
			$("<h1/>", { class: "win-msg", html: "Congratulations!" }),
			$("<h3/>", {
				class: "win-score",
				html: `You won with a score of ${game.getGameState().score}`
			}),
			$("<button/>", { class: "continue-button", html: "Continue" }).on(
				"click",
				() => {
					//remove win modal with anime js
					game.continueAfterWin();

					anime({
						targets: ".modal-win",
						translateY: $(".modal-win").height() * -1,
						direction: "normal",
						loop: false,
						easing: "easeOutExpo",
						complete: () => {
							$(".modal-win").remove();
						}
					});
				}
			)
		)
	);

	$(".board-container").append(modal);
}

function renderLose(state) {
	$(".board-container").append(
		$("<div/>", { class: "modal modal-lose" }).append(
			$("<div/>", { class: "modal-content" }).append(
				$("<img/>", { class: "lose-icon" }).attr("src", "./sadface.png"),
				$("<h1/>", { class: "lose-msg", html: "Better Luck Next Time!" }),
				$("<h3/>", {
					class: "lose-score",
					html: `You lost with a score of ${state.score}`
				}),
				$("<button/>", { class: "continue-button", html: "New Game" }).on(
					"click",
					() => {
						//remove lose modal with anime js after the click
						anime({
							targets: ".modal-lose",
							translateY: $(".modal-lose").height() * -1,
							direction: "normal",
							loop: false,
							easing: "easeOutExpo",
							complete: () => {
								$(".lose").remove();
								game.setupNewGame();
								updateBoard(game.getGameState());
								updateMenu(game.getGameState());
							}
						});
					}
				)
			)
		)
	);
}

$(document).keydown(e => {
	//only listen if there is no modal
	if ($(".modal").length == 0) {
		game.move(e.key.slice(5).toLowerCase());
	}
});
$(loadGame);
