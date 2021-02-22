/* CONSTS */
let BOARD_SIZE = 6; // board height, width is always + 1
let PLAYER_ONE_BASE = [[1, 1], [1, 2], [1, 3], [1, 4]]; // the base locations in the board of player 1
let PLAYER_TWO_BASE = [[5, 1], [5, 2], [5, 3], [5, 4]]; // the base locations in the board of player 2
let NOT_CHOSEN = -1; // used multiple times for all cases where some element not found in a search
/* end - CONSTS */

/* changeable consts */
let GAME_HEIGHT = 600;
let GAME_WIDTH = GAME_HEIGHT * 7 / 6;
let NEW_DIRECTION_MARK_R = 10; // the raduis from the center of the toy we print the new directions mark
let ACTION_TABLE_ID = "actions-table";
let GAME_PLACE = "game-container";
let TABLE_PLACE = "table-container";
let START_PLACE = "form-container";
/* end - changeable consts  */

/* global varibales */
let game; // the game - toys with meta data
let is_pick_toy_mode; // status flag
let is_re_jump_case; // status flag
let player_turn; // 1 or 2 according to player 0 or 1 which now playing
let pickedToy; // global info between function about what toy is now picked
let thisPossibleNextSteps; // global info between function about what next steps are possible (so we calculate them once)
let actionCount; // counter of the number of actions for the action table 

// print vars
let boxSize; // box size to print 
let aiPlayer; // the ai player
let is_ai = false;

// used to learn the game
let gameHistory;

// user ai functions
let user_do_move_code = null;
let user_do_continue_jump_move_code = null;

/* end - global varibales */

/* set with what player we want to play */
function set_second_player(type)
{
	switch(type)
	{
		case "human":
			is_ai = false;
			break;
		case "easy":
			is_ai = true;
			aiPlayer = new AiPlayer();
			break;
		case "meduim":
			is_ai = true;
			aiPlayer = new AiPlayerMinMax(1, 3);
			break;
		case "hard":
			is_ai = true;
			aiPlayer = new AiPlayerNueroEvaluationQLearning();
			break;
		case "user":
			is_ai = true;
			aiPlayer = new UserAI();
			break;
	}
	// show game
	document.getElementById(GAME_PLACE).style.display = "";
	document.getElementById(TABLE_PLACE).style.display = "";
	document.getElementById(START_PLACE).style.display = "none";
	// start game
	loop();
	// just that the form won't be submited
	return false;
}

// compile the AI player provided by the user 
function compile_ai()
{
	try
	{
		// get the code from the user 
		var do_move_code = document.getElementById("do_move_code").value;
		var do_continue_jump_move_code = document.getElementById("do_continue_jump_move_code").value;
		
		// wrap with the function calls
		/*
		do_move_code = "function do_move(game, allPossbileMoves){" + do_move_code + "}";
		do_continue_jump_move_code = "function do_continue_jump_move(game, pickedToyId, possibleMoves){" + do_move_code + "}";
		*/
		
		// set as functions inside the model
		user_do_move_code = do_move_code;
		user_do_continue_jump_move_code = do_continue_jump_move_code;
		
		// allow second player
		return set_second_player("user");
	}
	catch (error)
	{
		alert("Error at 'compile_ai' saying: " + error);
		return false;
	}
}

function show_your_ai_panel()
{
	document.getElementById("user_buttons_panel").style.display = "none";
	document.getElementById("user_code_form").style.display = "";
	return false;
}

function close_your_ai_panel()
{
	document.getElementById("user_buttons_panel").style.display = "";
	document.getElementById("user_code_form").style.display = "none";
	return false;
}

/* Setup function once called at the start */
function setup() 
{
	// create canvas
	let canvasGame = createCanvas(GAME_WIDTH, GAME_HEIGHT);
	// set to the right div
	canvasGame.parent('game');
	// do not show cursor - will be replace by the putMouse function
	noCursor();
	// just for the winning screen
	textAlign(CENTER, CENTER);
	
	// get static draw sizes
	boxSize = Math.floor(GAME_HEIGHT / 6) - 1;
	
	gameHistory = new GameHistoryAi();
	
	// create game
	new_game();
	
	// do not start game yet
	noLoop();
}

/* set the start conditions for a new game */
function new_game()
{
	game = new Game();
	is_pick_toy_mode = false;
	is_re_jump_case = false;
	player_turn = 1;
	actionCount = 0;
	pickedToy = NOT_CHOSEN;
	document.getElementById(ACTION_TABLE_ID).innerHTML = "";
}

/* Called every x seconds */
function draw() 
{
	// draw the board and toys 
	drawGame();
	// if status that a player picked a toy, draw the relevent possible actions
	if (is_pick_toy_mode)
	{
		drawPickMode();
	}
	// if jumped, show the new relevent possible actions
	else if (is_re_jump_case)
	{
		drawReJumpMode();
	}
	// draw lines in the end cause otherwise different elements shadow them
	drawLines();
	// put the curser according to the status and locaiton on the screen
	putMouse();
	
	// check if the player won, if someone won, show winning screen
	// TODO: calc once in the onMouseClick event and keep in flag 
	let playerWin = is_win();
	if (playerWin != NOT_CHOSEN)
	{
		win_senario(playerWin);
	}
}


/* the logic of what happens when a player wins */
function win_senario(playerWin)
{
	textSize(32);
	// the color of the player used for the text
	if (playerWin == 2)
	{
		fill(211, 2, 41);
		stroke(211, 2, 41);
	}
	else // if second player win
	{
		fill(0, 93, 80);
		stroke(0, 93, 80);
	}
	// record move for later use 
	actionRowHTML("Player " + playerWin + " win the Game", ai_move);
	// show wining text
	text("player " + playerWin + " win!", GAME_WIDTH / 2, GAME_HEIGHT / 2);
	// download game history for train later
	gameHistory.download();
	// stop draw loop for a bit
	noLoop();
	// wait a bit for drama and re-start the game
	setTimeout(function (){
		new_game();
		loop();
	}, 2000);
}

/* check if one of the player does not hae toys or one of it's toys on the second player's base tiles */
function is_win()
{
	let playerOneToyscounter = 0;
	let playerTwoToyscounter = 0;
	// check if a player's toy on second player's base tile
	for (var toyIndex = 0; toyIndex < game.toys.length; toyIndex++)
	{
		if (game.toys[toyIndex].color == 0)
		{
			playerOneToyscounter++;
			if (game.toys[toyIndex].is_in_location(PLAYER_TWO_BASE))
			{
				return 1;
			}
		}
		else if (game.toys[toyIndex].color == 1)
		{
			playerTwoToyscounter++;
			if (game.toys[toyIndex].is_in_location(PLAYER_ONE_BASE))
			{
				return 2;	
			}
		}
	}
	// if the second player does not have players to play with
	if (playerOneToyscounter == 0)
	{
		return 2;
	}
	else if (playerTwoToyscounter == 0)
	{
		return 1;
	}
	return NOT_CHOSEN;
}

/* just to make sence of the draw order - DO NOT CHANGE IT! */ 
function drawGame()
{
	drawBoard();
	drawToys();
}

/* draw the lines on the border */
function drawLines()
{
	strokeWeight(1);
	stroke(0);
	// print - lines 
	for (var index = 1; index < BOARD_SIZE; index++)
	{
		line(0, boxSize * index, GAME_WIDTH, boxSize * index);
	}
	// print | lines 
	for (var index = 1; index < BOARD_SIZE + 1; index++)
	{
		line(boxSize * index, 0, boxSize * index, GAME_WIDTH);
	}
	// edges of board
	strokeWeight(2);
	line(0, GAME_HEIGHT - 1, GAME_WIDTH, GAME_HEIGHT - 1);
	line(0, 1, GAME_WIDTH, 1);
	line(1, 0, 1, GAME_WIDTH);
	line(GAME_WIDTH - 1, 0, GAME_WIDTH - 1, GAME_WIDTH);
}

/* draw the board as tiles of base after all board in the same color */
function drawBoard()
{
	// draw game board
	background("#f0e6dd");
	// draw lines 
	// draw win boxes
	for (var winBoxIndex = 0; winBoxIndex < 4; winBoxIndex++)
	{
		tile(PLAYER_ONE_BASE[winBoxIndex][0], PLAYER_ONE_BASE[winBoxIndex][1], boxSize, 0, 162, 101);
	}
	for (var winBoxIndex = 0; winBoxIndex < 4; winBoxIndex++)
	{
		tile(PLAYER_TWO_BASE[winBoxIndex][0], PLAYER_ONE_BASE[winBoxIndex][1], boxSize, 233, 110, 66);
	}
}

/* draw the toys. color set according to player index and directions according to the Toy instance */
function drawToys()
{
	strokeWeight(1);
	stroke(0);
	// first, draw game board
	for (var toyIndex = 0; toyIndex < game.toys.length; toyIndex++)
	{
		stroke(0);
		/*
		fill(0);
		polygon((game.toys[toyIndex].x + 0.5) * boxSize - 2, (game.toys[toyIndex].y + 0.5) * boxSize - 2, boxSize * 0.34, 8);
		*/
		
		strokeWeight(0);
		// mark the players we can play with
		if (player_turn == 1 && game.toys[toyIndex].color == 0 && !is_pick_toy_mode)
		{
			fill(color(255, 255, 255, 130));
			strokeWeight(1);
			stroke(0, 0, 0);
			polygon((game.toys[toyIndex].x + 0.5) * boxSize , (game.toys[toyIndex].y + 0.5) * boxSize , boxSize * 0.42, 8);
		}
		else if (player_turn == 2 && game.toys[toyIndex].color == 1 && !is_pick_toy_mode)
		{
			fill(color(255, 255, 255, 130));
			strokeWeight(1);
			stroke(0, 0, 0);
			polygon((game.toys[toyIndex].x + 0.5) * boxSize , (game.toys[toyIndex].y + 0.5) * boxSize , boxSize * 0.42, 8);
		}
		strokeWeight(1);
		
		
		if (game.toys[toyIndex].color == 0) // first player is the green one
		{
			fill(0, 93, 80);
		}
		else // if second player
		{
			fill(211, 2, 41);
		}
		
		// draw polygon itself
		if (pickedToy == game.toys[toyIndex].id)
		{
			stroke(255);
			strokeWeight(2);
		}
		else
		{
			stroke(0);
			strokeWeight(1);
		}
		polygon((game.toys[toyIndex].x + 0.5) * boxSize, (game.toys[toyIndex].y + 0.5) * boxSize, boxSize * 0.33, 8);
		fill(255);
		stroke(255);
		if (game.toys[toyIndex].color == 0) // first player is the green one
		{
			triangle((game.toys[toyIndex].x + 0.5) * boxSize - 5, (game.toys[toyIndex].y + 0.5) * boxSize - 5, 
						(game.toys[toyIndex].x + 0.5) * boxSize - 5, (game.toys[toyIndex].y + 0.5) * boxSize + 5,
						(game.toys[toyIndex].x + 0.5) * boxSize + 5, (game.toys[toyIndex].y + 0.5) * boxSize);
		}
		else // if second player
		{				
			triangle((game.toys[toyIndex].x + 0.5) * boxSize + 5, (game.toys[toyIndex].y + 0.5) * boxSize - 5, 
						(game.toys[toyIndex].x + 0.5) * boxSize + 5, (game.toys[toyIndex].y + 0.5) * boxSize + 5,
						(game.toys[toyIndex].x + 0.5) * boxSize - 5, (game.toys[toyIndex].y + 0.5) * boxSize);
		}
		
		// draw directions steaks 
		strokeWeight(10);
		stroke(150,75,0);
		for (var directionIndex = 0; directionIndex < game.toys[toyIndex].directions.length; directionIndex++)
		{			
			switch (game.toys[toyIndex].directions[directionIndex])
			{
				case 0:
					line((game.toys[toyIndex].x + 0.5) * boxSize - boxSize * 0.33, (game.toys[toyIndex].y + 0.5) * boxSize, (game.toys[toyIndex].x + 0.5) * boxSize - boxSize * 0.33 - 10, (game.toys[toyIndex].y + 0.5) * boxSize);
					break;
				case 1:
					line((game.toys[toyIndex].x + 0.5) * boxSize - boxSize * 0.25, (game.toys[toyIndex].y + 0.5) * boxSize + boxSize * 0.25, (game.toys[toyIndex].x + 0.5) * boxSize - boxSize * 0.25 - 7, (game.toys[toyIndex].y + 0.5) * boxSize + boxSize * 0.25 + 7);
					break;
				case 2:
					line((game.toys[toyIndex].x + 0.5) * boxSize, (game.toys[toyIndex].y + 0.5) * boxSize + boxSize * 0.33, (game.toys[toyIndex].x + 0.5) * boxSize, (game.toys[toyIndex].y + 0.5) * boxSize + boxSize * 0.33 + 10);
					break;
				case 3:
					line((game.toys[toyIndex].x + 0.5) * boxSize + boxSize * 0.25, (game.toys[toyIndex].y + 0.5) * boxSize + boxSize * 0.25, (game.toys[toyIndex].x + 0.5) * boxSize + boxSize * 0.25 + 7, (game.toys[toyIndex].y + 0.5) * boxSize + boxSize * 0.25 + 7);
					break;
				case 4:
					line((game.toys[toyIndex].x + 0.5) * boxSize + boxSize * 0.33, (game.toys[toyIndex].y + 0.5) * boxSize, (game.toys[toyIndex].x + 0.5) * boxSize + boxSize * 0.33 + 10, (game.toys[toyIndex].y + 0.5) * boxSize);
					break;
				case 5:
					line((game.toys[toyIndex].x + 0.5) * boxSize + boxSize * 0.25, (game.toys[toyIndex].y + 0.5) * boxSize - boxSize * 0.25, (game.toys[toyIndex].x + 0.5) * boxSize + boxSize * 0.25 + 7, (game.toys[toyIndex].y + 0.5) * boxSize- boxSize * 0.25 - 7);
					break;
				case 6:
					line((game.toys[toyIndex].x + 0.5) * boxSize, (game.toys[toyIndex].y + 0.5) * boxSize - boxSize * 0.33, (game.toys[toyIndex].x + 0.5) * boxSize, (game.toys[toyIndex].y + 0.5) * boxSize- boxSize * 0.33 - 10);
					break;
				case 7:
					line((game.toys[toyIndex].x + 0.5) * boxSize - boxSize * 0.25, (game.toys[toyIndex].y + 0.5) * boxSize - boxSize * 0.25, (game.toys[toyIndex].x + 0.5) * boxSize - boxSize * 0.25 - 7, (game.toys[toyIndex].y + 0.5) * boxSize- boxSize * 0.25 - 7);
					break;
			}
		}
	}
}

/* draw the edges we can add to the toy and the possible locations to move to */
function drawPickMode()
{
	drawReJumpMode();
	
	// draw the possible edges we can add 
	for (var directionIndex = 0; directionIndex < thisPossibleNewDirections.length; directionIndex++)
	{
		fill(50);
		stroke(30);
		addDirectionDot(pickedToy.x, pickedToy.y, thisPossibleNewDirections[directionIndex]);
	}
}

/* draw the possible locations to move to for a picked toy */
function drawReJumpMode()
{
	fill(color(255, 255, 255, 130));
	strokeWeight(1);
	stroke(0, 0, 0);
	polygon((pickedToy.x + 0.5) * boxSize , (pickedToy.y + 0.5) * boxSize , boxSize * 0.42, 8);
	
	// print all possible_next_steps
	for (var locationIndex = 0; locationIndex < thisPossibleNextSteps.length; locationIndex++)
	{
		tile(thisPossibleNextSteps[locationIndex].new_x, thisPossibleNextSteps[locationIndex].new_y, boxSize, 219, 195, 173);
	}
}

/* IMPORTANT FUNCTION - put some draw over the mouse's location as curser which change according to the status and location */
function putMouse()
{
	strokeWeight(3);
	
	if (is_pick_toy_mode)
	{
		if (NextToNextStep(mouseX, mouseY) != NOT_CHOSEN)
		{
			stroke(0);	
			xMouseMark();
		}
		else if (NextToAddDirection(pickedToy.x, pickedToy.y, mouseX, mouseY) != NOT_CHOSEN)
		{
			vMouseMark();
		}
		else if (onSamePickToy(mouseX, mouseY))
		{
			fill(0);
			stroke(0);	
			line(mouseX - 5, mouseY + 5, mouseX + 5, mouseY - 5);
			line(mouseX + 5, mouseY + 5, mouseX - 5, mouseY - 5);
		}
		else
		{
			fill(0);
			stroke(0);	
			circle(mouseX, mouseY, 15);
		}
	}
	else if (is_re_jump_case)
	{
		stroke(0);	
		if (NextToNextStep(mouseX, mouseY) != NOT_CHOSEN)
		{
			xMouseMark();
		}
		else if (onSamePickToy(mouseX, mouseY))
		{
			vMouseMark();
		}
		else
		{
			fill(0);
			circle(mouseX, mouseY, 15);
		}
	}
	else
	{	
		stroke(0);	
		// check if toy we can pick
		if (clickNextToPickToy(mouseX, mouseY) != NOT_CHOSEN)
		{
			xMouseMark();
		}
		else
		{
			fill(0);
			circle(mouseX, mouseY, 15);
		}
	}
}

/* IMPORTANT FUNCTION - on click of mouse change the game's status as user's decision interface  */
function mouseClicked() 
{
	var nowMouseX = mouseX;
	var nowMouseY = mouseY;
	
	// if click outside the panel, ignore it
	if (nowMouseX > GAME_WIDTH || nowMouseX < 0 || nowMouseY > GAME_HEIGHT || nowMouseY < 0)
	{
		return;
	}
	
	if (is_pick_toy_mode)
	{
		let nextDirection = NextToAddDirection(pickedToy.x, pickedToy.y, nowMouseX, nowMouseY);
		if (nextDirection != NOT_CHOSEN)
		{
			pickedToy.add_duration(nextDirection);
			actionRowHTML("Add direction " + nextDirection + " to toy " + pickedToy.id, new AiMove(AI_MOVE_ADD_DIRECTION,
																									pickedToy.id,
																									nextDirection,
																									[],
																									[]));
			swithPlayer();
		}
		else if(onSamePickToy(nowMouseX, nowMouseY))
		{
			is_pick_toy_mode = false;
			pickedToy = NOT_CHOSEN;
		}
		var nextLocationCheck = NextToNextStep(nowMouseX, nowMouseY);
		if (nextLocationCheck != NOT_CHOSEN)
		{
			actionRowHTML("Move toy " + pickedToy.id + " from (" + pickedToy.x + ", " + pickedToy.y + ") to (" + thisPossibleNextSteps[nextLocationCheck].new_x + ", " + thisPossibleNextSteps[nextLocationCheck].new_y + ")", ai_move);
			pickedToy.jump(thisPossibleNextSteps[nextLocationCheck].new_x, thisPossibleNextSteps[nextLocationCheck].new_y);
			if (thisPossibleNextSteps[nextLocationCheck].is_jump)
			{
				game.kill_list_from_jump(thisPossibleNextSteps[nextLocationCheck]);	
				// if same group or not 
				if ((pickedToy.id < 4 && thisPossibleNextSteps[nextLocationCheck].jump_over < 4) || (4 <= pickedToy.id && pickedToy.id < 8 && 4 <= thisPossibleNextSteps[nextLocationCheck].jump_over && thisPossibleNextSteps[nextLocationCheck].jump_over < 8))
				{
					actionRowHTML("Toy " + pickedToy.id + " jump over toy " + thisPossibleNextSteps[nextLocationCheck].jump_over, ai_move);
				}
				else
				{
					actionRowHTML("Toy " + pickedToy.id + " kill toy " + thisPossibleNextSteps[nextLocationCheck].jump_over, ai_move);
				}
				thisPossibleNextSteps = game.possible_next_steps(pickedToy.id, false);
				if (thisPossibleNextSteps.length > 0)
				{
					is_re_jump_case = true;
					is_pick_toy_mode = false;
				}
				else
				{
					swithPlayer();
				}
			}
			else
			{
				swithPlayer();
			}
		}
	}
	else if (is_re_jump_case)
	{
		if(onSamePickToy(nowMouseX, nowMouseY))
		{
			swithPlayer();
		}
		var nextLocationCheck = NextToNextStep(nowMouseX, nowMouseY);
		if (nextLocationCheck != NOT_CHOSEN)
		{
			actionRowHTML("Move toy " + pickedToy.id + " from (" + pickedToy.x + ", " + pickedToy.y + ") to (" + thisPossibleNextSteps[nextLocationCheck].new_x + ", " + thisPossibleNextSteps[nextLocationCheck].new_y + ")", ai_move);
			pickedToy.jump(thisPossibleNextSteps[nextLocationCheck].new_x, thisPossibleNextSteps[nextLocationCheck].new_y);
			if (thisPossibleNextSteps[nextLocationCheck].is_jump)
			{
				game.kill_list_from_jump(thisPossibleNextSteps[nextLocationCheck]);	
				// if same group or not 
				if ((pickedToy.id < 4 && thisPossibleNextSteps[nextLocationCheck].jump_over < 4) || (4 <= pickedToy.id && pickedToy.id < 8 && 4 <= thisPossibleNextSteps[nextLocationCheck].jump_over && thisPossibleNextSteps[nextLocationCheck].jump_over < 8))
				{
					actionRowHTML("Toy " + pickedToy.id + " jump over toy " + thisPossibleNextSteps[nextLocationCheck].jump_over, ai_move);
				}
				else
				{
					actionRowHTML("Toy " + pickedToy.id + " kill toy " + thisPossibleNextSteps[nextLocationCheck].jump_over, ai_move);
				}
				thisPossibleNextSteps = game.possible_next_steps(pickedToy.id, false);
				if (thisPossibleNextSteps.length > 0)
				{
					is_re_jump_case = true;
					is_pick_toy_mode = false;
				}
				else
				{
					swithPlayer();
				}
			}
			else
			{
				swithPlayer();
			}
		}
	}
	else
	{
		// find if hiting some node
		var nextToNode = clickNextToPickToy(nowMouseX, nowMouseY);
		
		if(nextToNode != NOT_CHOSEN)
		{
			is_pick_toy_mode = true;
			// set the toy we are using now
			pickedToy = nextToNode;
			// find where it can go
			thisPossibleNextSteps = game.possible_next_steps(pickedToy.id, true);
			thisPossibleNewDirections = pickedToy.get_open_directions();
		}		
	}
}

function do_ai_move()
{
	try
	{
		let ai_move = aiPlayer.do_move(game);
		switch (ai_move.type)
		{
			case AI_MOVE_ADD_DIRECTION:
				// find the right toy and add the new direction
				for (var toyIndex = 0; toyIndex < game.toys.length; toyIndex++)
				{
					if (game.toys[toyIndex].id == ai_move.pickedToyId)
					{
						actionRowHTML("Add direction " + ai_move.newDirection + " to toy " + ai_move.pickedToyId, ai_move);
						game.toys[toyIndex].add_duration(ai_move.newDirection);
						break;
					}
				}
				break;
			case AI_MOVE_JUMP:
				let aiPickedToy;
				// find and move the right toy
				for (var toyIndex = 0; toyIndex < game.toys.length; toyIndex++)
				{
					if (game.toys[toyIndex].id == ai_move.pickedToyId)
					{
						actionRowHTML("Move toy " + ai_move.pickedToyId + " from (" + game.toys[toyIndex].x + ", " + game.toys[toyIndex].y + ") to (" + ai_move.newLocation[0] + ", " + ai_move.newLocation[0] + ")", ai_move);
						game.toys[toyIndex].x = ai_move.newLocation[0];
						game.toys[toyIndex].y = ai_move.newLocation[1];
						aiPickedToy = game.toys[toyIndex];
						break;
					}
				}
				// kill the toys we jump over
				for (var killToyIndex = 0; killToyIndex < ai_move.killList.length; killToyIndex++)
				{
					if (ai_move.killList[killToyIndex] != NOT_CHOSEN)
					{
						actionRowHTML("Toy " + ai_move.pickedToyId + " kill toy " + ai_move.killList[killToyIndex], ai_move);
						game.kill_list_from_jump(new Move(aiPickedToy, NOT_CHOSEN, NOT_CHOSEN, true, ai_move.killList[killToyIndex]));	
					}
				}
				// check if we can do next jump steps
				if (ai_move.killList.length > 0 && ai_move.killList[0] != NOT_CHOSEN)
				{
					thisPossibleNextSteps = game.possible_next_steps(ai_move.pickedToyId, false);
					if (thisPossibleNextSteps.length > 0)
					{
						do_ai_jump_move(ai_move.pickedToyId);
					}	
				}
		}
		swithPlayer();
	}
	catch (error)
	{
		var error_message = "AI currently not working... please make its move. The error recorded is: " + error;
		console.error(error_message);
		alert(error_message);
	}
	return false;
}

/* allow AI to do multiple jumps if possible in the same turn */
function do_ai_jump_move(toyId)
{
	var ai_move = aiPlayer.do_continue_jump_move(game, toyId, thisPossibleNextSteps);
	for (var toyIndex = 0; toyIndex < game.toys.length; toyIndex++)
	{
		if (game.toys[toyIndex].id == ai_move.pickedToyId)
		{
			actionRowHTML("Move toy " + ai_move.pickedToyId + " from (" + game.toys[toyIndex].x + ", " + game.toys[toyIndex].y + ") to (" + ai_move.newLocation[0] + ", " + ai_move.newLocation[0] + ")", ai_move);
			game.toys[toyIndex].x = ai_move.newLocation[0];
			game.toys[toyIndex].y = ai_move.newLocation[1];
			aiPickedToy = game.toys[toyIndex];
			break;
		}
	}
	// kill the toys we jump over
	for (var killToyIndex = 0; killToyIndex < ai_move.killList.length; killToyIndex++)
	{
		if (ai_move.killList[killToyIndex] != NOT_CHOSEN)
		{
			actionRowHTML("Toy " + ai_move.pickedToyId + " kill toy " + ai_move.killList[killToyIndex], ai_move);
			game.kill_list_from_jump(new Move(aiPickedToy, NOT_CHOSEN, NOT_CHOSEN, true, ai_move.killList[killToyIndex]));	
		}
	}
	try
	{	
		// check if we can do next jump steps
		thisPossibleNextSteps = game.possible_next_steps(pickedToy.id, false);
		if (thisPossibleNextSteps.length > 0)
		{
			do_ai_jump_move(ai_move.pickedToyId);
		}	
	}
	catch (error)
	{
		console.log("Multiple jump of AI error as: " + error);
	}
}

/* switch between the first and second player and vise versa */
function swithPlayer()
{
	if (player_turn == 1)
	{
		player_turn = 2;
		if (is_ai)
		{
			// wait a bit for the player to see it's change and run the AI's move
			setTimeout(function (){
				do_ai_move();
			}, 250);
		}
	}
	else
	{
		player_turn = 1;
	}
	is_pick_toy_mode = false;
	is_re_jump_case = false;
	pickedToy = NOT_CHOSEN;	
}

/* checkc if the mouse on\clicked close to a toy */
function clickNextToPickToy(checkX, checkY)
{
	var closestToy = NOT_CHOSEN;
	var closestToyDistance = 99999;
	for (var toyIndex = 0; toyIndex < game.toys.length; toyIndex++)
	{
		var distance = dist(checkX, checkY, (game.toys[toyIndex].x + 0.5) * boxSize, (game.toys[toyIndex].y + 0.5) * boxSize);
		if ((player_turn == 1 && game.toys[toyIndex].color == 0 && distance < boxSize) || (player_turn == 2 && game.toys[toyIndex].color == 1 && distance < boxSize * 0.33))
		{
			if (distance < closestToyDistance)
			{
				closestToyDistance = distance;
				closestToy = game.toys[toyIndex];
			}
		}
	}
	return closestToy;
}

/* checkc if the mouse on\clicked close to a next possible tile to move to */
function NextToNextStep(checkX, checkY)
{	
	for (var nextLocationIndex = 0; nextLocationIndex < thisPossibleNextSteps.length; nextLocationIndex++)
	{
		if (dist((thisPossibleNextSteps[nextLocationIndex].new_x + 0.5) * boxSize, (thisPossibleNextSteps[nextLocationIndex].new_y + 0.5) * boxSize, checkX, checkY) < boxSize * 0.33)
		{
			return nextLocationIndex;
		}
	}
	return NOT_CHOSEN;
}

/* checkc if the mouse on\clicked close to a a direction we wish to add */
function NextToAddDirection(toyX, toyY, checkX, checkY)
{	
	for (var directionIndex = 0; directionIndex < thisPossibleNewDirections.length; directionIndex++)
	{
	let shift = [];
	switch (thisPossibleNewDirections[directionIndex])
	{
		case 0:
			shift = [-1, 0];
			break;
		case 1:
			shift = [-1, 1];
			break;
		case 2:
			shift = [0, 1];
			break;
		case 3:
			shift = [1, 1];
			break;
		case 4:
			shift = [1, 0];
			break;
		case 5:
			shift = [1, -1];
			break;
		case 6:
			shift = [0, -1];
			break;
		case 7:
			shift = [-1, -1];
			break;
	}
		if (dist((toyX + 0.5 + 0.3 * shift[0]) * boxSize, (toyY + 0.5 + 0.3 * shift[1]) * boxSize, checkX, checkY) < NEW_DIRECTION_MARK_R)
		{
			return thisPossibleNewDirections[directionIndex];
		}
	}
	return NOT_CHOSEN;
}

/* checkc if the mouse on\clicked close to the picked toy */
function onSamePickToy(checkX, checkY)
{
	return dist(checkX, checkY, (pickedToy.x + 0.5) * boxSize, (pickedToy.y + 0.5) * boxSize) < boxSize * 0.33;
}

/* Eventhandler function provided by p5 to change the game size if the window in resized */
// TODO: make it work 
function windowResized() 
{
	resizeCanvas(GAME_WIDTH, GAME_HEIGHT);
	boxSize = Math.floor(GAME_HEIGHT / 6) - 1;
}

/* draw a polygon... used mostly to draw the toys */
function polygon(x, y, radius, npoints) 
{
  let angle = TWO_PI / npoints;
  beginShape();
  let angle_shift = 24;
  for (let a = angle_shift; a < TWO_PI + angle_shift; a += angle) 
  {
    let sx = x + cos(a) * radius;
    let sy = y + sin(a) * radius;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

/* draw a mouse X curser */
function xMouseMark()
{
	line(mouseX - 5, mouseY, mouseX + 5, mouseY);
	line(mouseX, mouseY - 5, mouseX, mouseY + 5);
}

/* draw a mouse V curser */
function vMouseMark()
{
	line(mouseX, mouseY, mouseX + 10, mouseY - 10);
	line(mouseX, mouseY, mouseX - 5, mouseY - 5);
}

/* draw a game tile in the right color */
function tile(x, y, size, color_r, color_g, color_b) 
{
	fill(color_r, color_g, color_b);
	rect(x * boxSize, y * boxSize, size);
}

/* draw a new direction dot according to the direction */
function addDirectionDot(x, y, direction) 
{
	let shift = [];
	switch (direction)
	{
		case 0:
			shift = [-1, 0];
			break;
		case 1:
			shift = [-1, 1];
			break;
		case 2:
			shift = [0, 1];
			break;
		case 3:
			shift = [1, 1];
			break;
		case 4:
			shift = [1, 0];
			break;
		case 5:
			shift = [1, -1];
			break;
		case 6:
			shift = [0, -1];
			break;
		case 7:
			shift = [-1, -1];
			break;
	}
	circle((x + 0.5 + 0.3 * shift[0]) * boxSize, (y + 0.5 + 0.3 * shift[1]) * boxSize, NEW_DIRECTION_MARK_R);
}

/* add a raw to the action table in the main page */
function actionRowHTML(description, actionObj)
{
	actionCount++;
	// print to the user
	document.getElementById(ACTION_TABLE_ID).innerHTML = '<tr><th scope="row">' + actionCount + '</th><th scope="row">' + player_turn + '</th><th scope="row">' + description + '</th></tr>' + document.getElementById(ACTION_TABLE_ID).innerHTML;
	// store for later
	gameHistory.add_move(game.state(), actionObj.encode());
}