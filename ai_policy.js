/* The AI Policy */
class AiPolicy
{
	/*
		states is a list of game state (2d array) - known in the begining
		actions is a list of list of AiAction 
		rewards is a list of list of floats 
		discount_factor is a float values manages the learning rate
		learning_rate is the learning rate of the algorithm 
		player_color is the index of the player we want to learn for
	*/
	constructor(states = [], actions = [], rewards = [], discount_factor = 0.9, learning_rate = 0.9, player_color = 1)
	{
		this.states = states;
		this.actions = actions;
		this.rewards = rewards;
		this.discount_factor = discount_factor;
		this.player_color = player_color;
	}
	
	// constract from json
	// TODO: finish here
	static fromJson(jsonObj)
	{
		return AiPolicy();
	}
	
	/*
		gameState is a vector represneting the game's state
		allPossbileMoves are a list of AiMove that are all the possible moves to do for this state
	*/
	findBestMove(game)
	{
		var gameState = game.state();
		
		var stateAlreadyFound = false;
		var statePickedIndex = 0;
		for (var stateIndex = 0; stateIndex < this.states.length; stateIndex++)
		{
			if (this.states[stateIndex] == gameState)
			{
				stateAlreadyFound = true;
				statePickedIndex = stateIndex;
			}
		}
		
		// if this is a new move, learn greedly how to play it 
		if (!stateAlreadyFound)
		{	
			statePickedIndex = this.states.length;
			
			// 1. find all the possible moves we can decide from
			var allPossbileMoves = game.all_players_possible_moves(this.player_color);
			
			// for the q-learning process //
			// add the state 
			this.states.push(gameState);
			// add possible moves to the actions list
			this.actions.push(allPossbileMoves);
			
			// add greedy score to each action 
			this.rewards.push(this.greedy_score(game, allPossbileMoves));
		}
		
		// find the best action given the state 
		var bestAction = this.actions[statePickedIndex][0];
		var bestActionReward = this.rewards[statePickedIndex][0];
		for (var actionIndex = 1; actionIndex < this.actions[statePickedIndex].length; actionIndex++)
		{
			if (this.rewards[statePickedIndex][actionIndex] > bestActionReward)
			{
				bestActionReward = this.rewards[statePickedIndex][actionIndex];
				bestAction = this.actions[statePickedIndex][actionIndex];
			}
		}
		return bestAction;
	}
	
	// give score to each action (either new direction or jump), update the action's score and return the best score for later use
	greedy_score(game, actions)
	{
		var answer = [];
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
			answer.push(score);
		}
		return answer;
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
			return Math.floor(LARGEST_SCORE / (game.count_player_toys((this.player_color + 1) % 2)));
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