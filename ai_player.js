// consts //
let LARGEST_SCORE = 999;
let POSSIBLE_KILL_PANISHMENT = 100;
// end - consts //

/* the naive, greedy algorithm */
class AiPlayer
{
	constructor(player_color = 1)
	{
		this.player_color = player_color;
	}
	
	// make a greedy move by finding all possible actions, then score them, pick the best ones and pick from them randomly
	do_move(game)
	{
		// 1. find all the possible moves we can decide from
		var allPossbileMoves = game.all_players_possible_moves(this.player_color);
		// 2. give a score to the each move
		var bestScore = this.greedy_score(game, allPossbileMoves);
		// 3. filter the best moves
		var bestMoves = [];
		for (var moveIndex = 0; moveIndex < allPossbileMoves.length; moveIndex++)
		{
			if (allPossbileMoves[moveIndex].score == bestScore)
			{
				bestMoves.push(allPossbileMoves[moveIndex]);
			}
		}
		// 4. pick one in random
		return bestMoves[Math.floor(Math.random() * bestMoves.length)];
	}
	
	// decide where is the next place to jump to
	do_continue_jump_move(toyId, possibleMoves)
	{
		// convert to the object we need
		var aiPossibleMoves = [];
		for (var moveIndex = 0; moveIndex < possibleMoves.length; moveIndex++)
		{
			aiPossibleMoves.push(possibleMoves[moveIndex].convert_to_ai_move());
		}
		// score each move
		var bestScore = -999; // -inf just to be replaced 
		for (var actionIndex = 0; actionIndex < aiPossibleMoves.length; actionIndex++)
		{
			var score = this.move_score(game, aiPossibleMoves[actionIndex]);
			aiPossibleMoves[actionIndex].score = score;
			if (score > bestScore)
			{
				bestScore = score;
			}
		}
		// pick the best one
		var bestMoves = [];
		for (var moveIndex = 0; moveIndex < aiPossibleMoves.length; moveIndex++)
		{
			if (aiPossibleMoves[moveIndex].score == bestScore)
			{
				bestMoves.push(aiPossibleMoves[moveIndex]);
			}
		}
		// 4. pick one in random
		return bestMoves[Math.floor(Math.random() * bestMoves.length)];
	}
	
	// give score to each action (either new direction or jump), update the action's score and return the best score for later use
	greedy_score(game, actions)
	{
		var bestScore = -999; // -inf just to be replaced 
		for (var actionIndex = 0; actionIndex < actions.length; actionIndex++)
		{
			var score = 0;
			switch (actions[actionIndex].type)
			{
				case AI_MOVE_ADD_DIRECTION:
					score = this.new_direction_score(game, actions[actionIndex]);
					break;
				case AI_MOVE_JUMP:
					score = this.move_score(game, actions[actionIndex]);
					break;
			}
			actions[actionIndex].score = score;
			if (score > bestScore)
			{
				bestScore = score;
			}
		}
		return bestScore;
	}
	
	// give a score to direction if it helps to move closer to the goal
	new_direction_score(game, action)
	{
		var currentToyLocation = game.get_toy_location_by_id(action.pickedToyId);
		var baseLineDistance = minDistanceFromBase((this.player_color + 1) % 2, currentToyLocation[0], currentToyLocation[1]);
		switch (action.newDirection)
		{
			case 0:
				currentToyLocation[0] -= 1;
				break;
			case 1:
				currentToyLocation[0] -= 1;
				currentToyLocation[1] += 1;
				break;
			case 2:
				currentToyLocation[1] += 1;
				break;
			case 3:
				currentToyLocation[0] += 1;
				currentToyLocation[1] += 1;
				break;
			case 4:
				currentToyLocation[0] += 1;
				break;
			case 5:
				currentToyLocation[0] += 1;
				currentToyLocation[1] -= 1;
				break;
			case 6:
				currentToyLocation[1] -= 1;
				break;
			case 7:
				currentToyLocation[0] -= 1;
				currentToyLocation[1] -= 1;
				break;
		}
		var newLineDistance = minDistanceFromBase((this.player_color + 1) % 2, currentToyLocation[0], currentToyLocation[1]);
		return baseLineDistance - 1.5 * newLineDistance;
	}
	
	move_score(game, action)
	{
		var currentToyLocation = game.get_toy_location_by_id(action.pickedToyId);
		var baseDistance = minDistanceFromBase((this.player_color + 1) % 2, currentToyLocation[0], currentToyLocation[0]);
		var afterMoveDistance = minDistanceFromBase((this.player_color + 1) % 2, action.newLocation[0], action.newLocation[1]);
		var isKillPossible = 0;
		// if by doing this move, we win - do it
		if (afterMoveDistance == 0)
		{
			console.log("Toy #" + action.pickedToyId + " has winning move to: (" + action.newLocation[0] + ", " + action.newLocation[1] + ")");
			return LARGEST_SCORE;
		}
		else if (action.killList.length > 0 && action.killList[0] != NOT_CHOSEN) // if we kill someone, we would like to do it
		{
			console.log("Toy #" + action.pickedToyId + " has killing move to: (" + action.newLocation[0] + ", " + action.newLocation[1] + ") over toy #" + action.killList[0]);
			return Math.floor(LARGEST_SCORE / (5 - game.count_player_toys((this.player_color + 1) % 2)));
		}
		
		// shadow this toy so it won't mess with the analysis
		game.add_shadow_toy(action.pickedToyId);
		// check if can be killed in this move
		var canBeEaten = game.possible_kill((this.player_color + 1) % 2, action.newLocation[0], action.newLocation[1]);
		// release the toy back
		game.release_shadow_toy(action.pickedToyId);
		
		if (canBeEaten) // if we will be eaten next move we do not want it but in general move torwards the second player's base
		{
			isKillPossible = 1;
		}
		return baseDistance - 1.5 * afterMoveDistance - POSSIBLE_KILL_PANISHMENT * isKillPossible;
	}
}

class AiPlayerMinMax extends AiPlayer 
{
	constructor(player_color = 1, maxDepth)
	{
		super();
		this.player_color = player_color;
		this.maxDepth = maxDepth;
	}
	
	do_move(game)
	{
		// 1. find all the possible moves we can decide from
		var allPossbileMoves = game.all_players_possible_moves(this.player_color);
		// AI to make its turn
		let bestScore = -Infinity;
		let bestMove;
		for (var actionIndex = 0; actionIndex < allPossbileMoves.length; actionIndex++)
		{
			// make copy of game after a given move
			new_game = game.run_move(allPossbileMoves[actionIndex]);
			// check it's min-max score
			let score = this.minimax(new_game, 0, false);
			// if best one, do it 
			if (score > bestScore) 
			{
			  bestScore = score;
			  bestMove = allPossbileMoves[actionIndex];
			}
		}
		return bestMove;
	}
	
	minimax(game, depth, isMaximizing) 
	{
		// if we get to the max depth calc the overall score of the process
		if (depth == this.maxDepth)
		{
			// 1. find all the possible moves we can decide from
			var allPossbileMoves = game.all_players_possible_moves(this.player_color);
			// 2. give a score to the each move
			return this.greedy_score(game, allPossbileMoves);
		}
		
		// if this leads to winning or lossing, this is the decision from this move
		if (game.is_player_two_win())
		{
			return LARGEST_SCORE;
		}
		else if (game.is_player_one_win())
		{
			return -1 * LARGEST_SCORE;
		}

		if (isMaximizing) 
		{
			let bestScore = -Infinity;
			// find all the possible moves we can decide from
			var allPossbileMoves = game.all_players_possible_moves(this.player_color);
			for (var actionIndex = 0; actionIndex < actions.length; actionIndex++)
			{
				// make copy of game after a given move
				new_game = game.run_move(allPossbileMoves[actionIndex]);
				let score = minimax(board, depth + 1, false);
				bestScore = max(score, bestScore);
			}
			return bestScore;
		}
		else 
		{
			let bestScore = Infinity;
			var allPossbileMoves = game.all_players_possible_moves((this.player_color + 1)%2);
			for (var actionIndex = 0; actionIndex < actions.length; actionIndex++)
			{
				// make copy of game after a given move
				new_game = game.run_move(allPossbileMoves[actionIndex]);
				let score = minimax(board, depth + 1, false);
				bestScore = min(score, bestScore);
			}
			return bestScore;
		}
	}
	
	// decide where is the next place to jump to
	do_continue_jump_move(toyId, possibleMoves)
	{
		
		// convert to the object we need
		var aiPossibleMoves = [];
		for (var moveIndex = 0; moveIndex < possibleMoves.length; moveIndex++)
		{
			aiPossibleMoves.push(possibleMoves[moveIndex].convert_to_ai_move());
		}
		// score each move
		var bestScore = -999; // -inf just to be replaced 
		for (var actionIndex = 0; actionIndex < aiPossibleMoves.length; actionIndex++)
		{
			var score = this.move_score(game, aiPossibleMoves[actionIndex]);
			aiPossibleMoves[actionIndex].score = score;
			if (score > bestScore)
			{
				bestScore = score;
			}
		}
		// pick the best one
		var bestMoves = [];
		for (var moveIndex = 0; moveIndex < aiPossibleMoves.length; moveIndex++)
		{
			if (aiPossibleMoves[moveIndex].score == bestScore)
			{
				bestMoves.push(aiPossibleMoves[moveIndex]);
			}
		}
		// 4. pick one in random
		return bestMoves[Math.floor(Math.random() * bestMoves.length)];
	}
}

class AiPlayerDeepQLearning extends AiPlayer 
{
	constructor(player_color = 1)
	{
		super();
		this.player_color = player_color;
	}
	
	do_move(game)
	{
		return null;
	}
	
	// decide where is the next place to jump to
	do_continue_jump_move(toyId, possibleMoves)
	{
		return possibleMoves[0];
	}
}