// consts //
let LARGEST_SCORE = 999;
let POSSIBLE_KILL_PANISHMENT = 10;
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
		return baseLineDistance - newLineDistance;
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
			return LARGEST_SCORE;
		}
		else if (action.killList.length > 0) // if we kill someone, we would like to do it
		{
			return Math.floor(LARGEST_SCORE / (4 - game.count_player_toys((this.player_color + 1) % 2)));
		}
		if (game.possible_kill((this.player_color + 1) % 2, action.newLocation[0], action.newLocation[1])) // if we will be eaten next move we do not want it but in general move torwards the second player's base
		{
			isKillPossible = 1;
		}
		return baseDistance - afterMoveDistance - POSSIBLE_KILL_PANISHMENT * isKillPossible;
	}
}

class AiPlayerMinMax
{
	constructor(player_color = 1)
	{
		this.player_color = player_color;
	}
	
	do_move(game)
	{
		return null;
	}
}

class AiPlayerDeepQLearning
{
	constructor(player_color = 1)
	{
		this.player_color = player_color;
	}
	
	do_move(game)
	{
		return null;
	}
}