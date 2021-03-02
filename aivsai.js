/* CONSTS */
let BOARD_SIZE = 6; // board height, width is always + 1
let PLAYER_ONE_BASE = [[1, 1], [1, 2], [1, 3], [1, 4]]; // the base locations in the board of player 1
let PLAYER_TWO_BASE = [[5, 1], [5, 2], [5, 3], [5, 4]]; // the base locations in the board of player 2
let NOT_CHOSEN = -1; // used multiple times for all cases where some element not found in a search
/* end - CONSTS */

/* changeable consts */
let ACTION_TABLE_ID = "actions-table";
/* end - changeable consts  */

/* global varibales */
let game; // the game - toys with meta data
let player_turn; // 1 or 2 according to player 0 or 1 which now playing
let pickedToy; // global info between function about what toy is now picked
let thisPossibleNextSteps; // global info between function about what next steps are possible (so we calculate them once)
let actionCount; // counter of the number of actions for the action table 

// print vars
let steps;

let aiPlayer; // the ai player
let aiPlayerName = ""; // the ai player
let aiPlayer2; // the ai player
let aiPlayerName2 = ""; // the ai player

// used to learn the game
let gameHistory;

let gameIndex;

// manul repeat training set
let REPEATS = {"Greedy-Greedy": 1,
				"Greedy-MinMax (1)": 1,
				"MinMax (1)-Greedy": 1,
				"Greedy-MinMax (2)": 1,
				"MinMax (2)-Greedy": 1,
				"Greedy-MinMax (3)": 1,
				"MinMax (3)-Greedy": 1,
				"MinMax (1)-MinMax (1)": 1,
				"MinMax (1)-MinMax (2)": 1,
				"MinMax (2)-MinMax (1)": 1,
				"MinMax (1)-MinMax (3)": 1,
				"MinMax (3)-MinMax (1)": 1,
				"MinMax (2)-MinMax (2)": 1,
				"MinMax (2)-MinMax (3)": 1,
				"MinMax (3)-MinMax (2)": 1,
				"MinMax (3)-MinMax (3)": 1,
				"MinMax (3)-MinMax (3)": 1,
				"Greedy-RL": 50,
				"RL-Greedy": 50,
				"MinMax (1)-RL": 50,
				"RL-MinMax (1)": 50,
				"MinMax (2)-RL": 150,
				"RL-MinMax (2)": 150,
				"MinMax (3)-RL": 150,
				"RL-MinMax (3)": 150,
				"RL-RL": 1000}

/* end - global varibales */


/* Setup function once called at the start */
function setup() 
{
	// start the service that record important stuff 
	gameHistory = new GameHistoryAi();
	
	// create game
	game = new Game();
	
	gameIndex = 1;
	steps = 0;
	
	player_turn = 0;
	
	// close the P5 loop
	noLoop();
	
	// run the game manully
	pick_ai_game_and_run();
}

function pick_ai_game_and_run()
{
	var names = ["Greedy", "MinMax (1)", "MinMax (2)", "MinMax (3)", "RL"];
	var aiPlayers1 = [new AiPlayer(), new AiPlayerMinMax(0, 1), new AiPlayerMinMax(0, 2), new AiPlayerMinMax(0, 3), new AiPlayer()]; // new AiPlayerQLearning()];
	var aiPlayers2 = [new AiPlayer(), new AiPlayerMinMax(1, 1), new AiPlayerMinMax(1, 2), new AiPlayerMinMax(1, 3), new AiPlayer()]; // new AiPlayerQLearning()];
	// set players
	
	for (var i = 0; i < names.length; i++)
	{
		for (var j = 0; j < names.length; j++)
		{
			// init the players of the match
			aiPlayerName = names[i];
			aiPlayer = aiPlayers1[i];
			aiPlayerName2 = names[j];
			aiPlayer2 = aiPlayers2[j];
			
			// run the matches
			run_game();
			
			// TODO: delete later when all players will be ready
			return false;
		}
	}
}

function run_game()
{
	var statusElement = document.getElementById("game_status");
	var stateElement = document.getElementById("game_state");
	let is_win_id = NOT_CHOSEN;
	
	let repeats = REPEATS[aiPlayerName + "-" + aiPlayerName2];
	
	for (var i = 0; i < repeats; i++)
	{
		// if win, run logic and and return to the next game
		while (is_win_id == NOT_CHOSEN)
		{
			// count step
			steps++;
			// make a step for a player 
			do_ai_move();
			// update the player we make move for
			player_turn = (player_turn + 1)%2;
			
			// debug prints
			statusElement.innerHTML = "Steps: " + steps;
			stateElement.innerHTML = "State:[" + game.state() + "]";
			
			// update flag win in the end of the turn
			is_win_id = is_win();
		}
		// download file and reset
		win_senario();	
		// reset game steps 
		steps = 0;
		// count this game 
		gameIndex++;
		// mark this event in the table
		document.getElementById(ACTION_TABLE_ID).innerHTML = '<tr><th scope="row">' + aiPlayerName + '</th><th scope="row">' + aiPlayerName2 + '</th><th scope="row">' + (is_win_id - 1) + '</th></tr>' + document.getElementById(ACTION_TABLE_ID).innerHTML;
	}
}

function do_ai_move()
{
	try
	{
		// pick player
		let ai_move;
		if (player_turn == 0)
		{
			ai_move = aiPlayer.do_move(game);
		}
		else
		{
			ai_move = aiPlayer2.do_move(game);	
		}
		
		switch (ai_move.type)
		{
			case AI_MOVE_ADD_DIRECTION:
				// find the right toy and add the new direction
				for (var toyIndex = 0; toyIndex < game.toys.length; toyIndex++)
				{
					if (game.toys[toyIndex].id == ai_move.pickedToyId)
					{
						game.toys[toyIndex].add_duration(ai_move.newDirection);
						record_state();
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
						game.toys[toyIndex].x = ai_move.newLocation[0];
						game.toys[toyIndex].y = ai_move.newLocation[1];
						record_state();
						aiPickedToy = game.toys[toyIndex];
						break;
					}
				}
				// kill the toys we jump over
				for (var killToyIndex = 0; killToyIndex < ai_move.killList.length; killToyIndex++)
				{
					if (ai_move.killList[killToyIndex] != NOT_CHOSEN)
					{
						game.kill_list_from_jump(new Move(aiPickedToy, NOT_CHOSEN, NOT_CHOSEN, true, ai_move.killList[killToyIndex]));	
						record_state();
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
	}
	catch (error)
	{
		var error_message = "AI currently not working... please make its move. The error recorded is: " + error;
		console.error(error_message);
		throw error;
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
			record_state();
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
			record_state();
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

/* the logic of what happens when a player wins */
function win_senario(playerWin)
{
	// record move for later use 
	record_state();
	// download game history for train later
	gameHistory.add_win(playerWin);
	
	// if Q-learning ai, update policy
	if (aiPlayerName == "RL")
	{
		aiPlayer.online_learn_policy(gameHistory);
	}
	if (aiPlayerName2 == "RL")
	{
		aiPlayer2.online_learn_policy(gameHistory);
	}
	// download the results of the game for AI learning offline 
	gameHistory.download();
	
	// reset game
	game = new Game();
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

/* add a raw to the action table in the main page */
function record_state()
{
	// store for later
	gameHistory.add_move(game.state(), player_turn);	
}