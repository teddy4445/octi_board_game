/* game has list of toys and some logic on how they can move */
class Game
{
	constructor(toys = [])
	{
		this.shadow_toys = []; // used just for AI analysis 
		if (toys.length == 0)
		{		
			this.toys = [];
			// this is static because the game always starts in the same way 
			this.toys.push(new Toy(0, 0, 1, 1));
			this.toys.push(new Toy(1, 0, 1, 2));
			this.toys.push(new Toy(2, 0, 1, 3));
			this.toys.push(new Toy(3, 0, 1, 4));
			this.toys.push(new Toy(4, 1, 5, 1));
			this.toys.push(new Toy(5, 1, 5, 2));
			this.toys.push(new Toy(6, 1, 5, 3));
			this.toys.push(new Toy(7, 1, 5, 4));	
		}
		else
		{
			this.toys = JSON.parse(JSON.stringify(toys));
		}
	}
	
	copy()
	{
		var copyGame = new Game();
		copyGame.toys = [];
		for (var toyIndex = 0; toyIndex < this.toys.length; toyIndex++)
		{
			var thisToy = this.toys[toyIndex];
			copyGame.toys.push(new Toy(thisToy.id, thisToy.color, thisToy.x, thisToy.y, thisToy.directions));
		}
		return copyGame;
	}
	
	run_move(ai_move)
	{
		// first, make copy of the game
		let game_copy = new Game(this.toys);
		switch (ai_move.type)
		{
			case AI_MOVE_ADD_DIRECTION:
				// find the right toy and add the new direction
				for (var toyIndex = 0; toyIndex < game_copy.toys.length; toyIndex++)
				{
					if (game_copy.toys[toyIndex].id == ai_move.pickedToyId)
					{
						game_copy.toys[toyIndex].directions.push(ai_move.newDirection);
						break;
					}
				}
				break;
			case AI_MOVE_JUMP:
				let aiPickedToy;
				// find and move the right toy
				for (var toyIndex = 0; toyIndex < game_copy.toys.length; toyIndex++)
				{
					if (game_copy.toys[toyIndex].id == ai_move.pickedToyId)
					{
						game_copy.toys[toyIndex].x = ai_move.newLocation[0];
						game_copy.toys[toyIndex].y = ai_move.newLocation[1];
						aiPickedToy = game_copy.toys[toyIndex];
						break;
					}
				}
				// kill the toys we jump over
				for (var killToyIndex = 0; killToyIndex < ai_move.killList.length; killToyIndex++)
				{
					if (ai_move.killList[killToyIndex] != NOT_CHOSEN)
					{
						game_copy.kill_list_from_jump(new Move(aiPickedToy, NOT_CHOSEN, NOT_CHOSEN, true, ai_move.killList[killToyIndex]));	
					}
				}
				break;
		}
		return game_copy; // return the game after the move
	}
	
	/*
		Get game's state as the location of the toys and there directions
	*/
	state()
	{
		var answer = [];
		for (var toyId = 0; toyId < 8; toyId++)
		{
			try
			{
				var thisToy = this.get_toy_by_id(toyId);
				answer.push(thisToy.color);
				answer.push(thisToy.x);
				answer.push(thisToy.y);
				var directionStatus = thisToy.directions_status();
				for (var directionIndex = 0; directionIndex < directionStatus.length; directionIndex++)
				{
					answer.push(directionStatus[directionIndex]);
				}	
			}
			catch (error)
			{
				answer.push(-1);
				answer.push(-1);
				answer.push(-1);
				for (var directionIndex = 0; directionIndex < 8; directionIndex++)
				{
					answer.push(0);
				}
			}
		}
		return answer;
	}
	
	// return the games state after a move
	get_state_after_move(move)
	{
		return this.copy().run_move(move).state();
	}
		
	
	/*
		get the game's general state state so humans can get sence what boards as a set of features
	*/
	general_status_state()
	{
		// the vector contains the main things we have in the game
		var firstPlayerToysCount = game.count_player_toys(0);
		var secondPlayerToysCount = game.count_player_toys(1);
		
		var firstPlayerDistanceFromBases = 0;
		var secondPlayerDistanceFromBases = 0;
		
		var firstPlayerUpgrades = 0;
		var secondPlayerUpgrades = 0;
		
		for (var toyIndex = 0; toyIndex < game.toys.length; toyIndex++)
		{
			if (game.toys[toyIndex].color == 0)
			{
				firstPlayerDistanceFromBases += minDistanceFromBase(1, game.toys[toyIndex].x, game.toys[toyIndex].y);
				
				for (var i = 0; i < game.toys[toyIndex].directions.length; i++)
				{
					switch (game.toys[toyIndex].directions[i])
					{
						case 0:
							firstPlayerUpgrades += 0;
						case 1:
							firstPlayerUpgrades += 0.5;
							break;
						case 2:
							firstPlayerUpgrades += 1;
							break;
						case 3:
							firstPlayerUpgrades += 1;
							break;
						case 4:
							firstPlayerUpgrades += 1;
							break;
						case 5:
							firstPlayerUpgrades += 1;
							break;
						case 6:
							firstPlayerUpgrades += 0.5;
							break;
						case 7:
							firstPlayerUpgrades += 0;
							break;
					}
				}
			}
			else
			{
				secondPlayerDistanceFromBases += minDistanceFromBase(1, game.toys[toyIndex].x, game.toys[toyIndex].y);
				for (var i = 0; i < game.toys[toyIndex].directions.length; i++)
				{
					switch (game.toys[toyIndex].directions[i])
					{
						case 0:
							secondPlayerUpgrades += 0;
						case 1:
							secondPlayerUpgrades += 0.5;
							break;
						case 2:
							secondPlayerUpgrades += 1;
							break;
						case 3:
							secondPlayerUpgrades += 1;
							break;
						case 4:
							secondPlayerUpgrades += 1;
							break;
						case 5:
							secondPlayerUpgrades += 1;
							break;
						case 6:
							secondPlayerUpgrades += 0.5;
							break;
						case 7:
							secondPlayerUpgrades += 0;
							break;
					}
				}
			}
		}
		return [firstPlayerToysCount, 
				secondPlayerToysCount, 
				firstPlayerDistanceFromBases, 
				secondPlayerDistanceFromBases, 
				firstPlayerUpgrades,
				secondPlayerUpgrades];
	}
	
	all_players_possible_moves(player_color = 1)
	{
		var all_possible_moves = [];
		for (var toy_index = 0; toy_index < this.toys.length; toy_index++)
		{
			if (this.toys[toy_index].color == player_color)
			{
				// add possible new directions
				var openDirections = this.get_toy_open_directions(this.toys[toy_index]);
				for (var directionIndex = 0; directionIndex < openDirections.length; directionIndex++)
				{
					all_possible_moves.push(new AiMove(AI_MOVE_ADD_DIRECTION, 
														this.toys[toy_index].id, 
														openDirections[directionIndex]));
				}
				var possibleMoves = this.possible_next_steps(this.toys[toy_index].id, true);
				for (var moveIndex = 0; moveIndex < possibleMoves.length; moveIndex++)
				{
					all_possible_moves.push(new AiMove(AI_MOVE_JUMP, 
														this.toys[toy_index].id, 
														NOT_CHOSEN,
														[possibleMoves[moveIndex].new_x, possibleMoves[moveIndex].new_y],
														[possibleMoves[moveIndex].jump_over]));
				}
			}
		}
		return all_possible_moves;
	}
	
	possible_next_steps(toy_id, allow_near_move)
	{
		// find the wanted toy
		let wantedToy = null;
		for (var toy_index = 0; toy_index < this.toys.length; toy_index++)
		{
			if (this.toys[toy_index].id == toy_id)
			{
				wantedToy = this.toys[toy_index];
				break;
			}
		}
		// check if found
		if (wantedToy == null)
		{
			throw new Execption("toy not found");
		}
		let posibleLocations = [];
		// 1. check what directions are open 
		if (allow_near_move)
		{
			for (var directionIndex = 0; directionIndex < wantedToy.directions.length; directionIndex++)
			{
				var nextLocation = [];
				// get next location
				switch (wantedToy.directions[directionIndex])
				{
					case 0:
						nextLocation = [wantedToy.x - 1, wantedToy.y];
						break;
					case 1:
						nextLocation = [wantedToy.x - 1, wantedToy.y + 1];
						break;
					case 2:
						nextLocation = [wantedToy.x, wantedToy.y + 1];
						break;
					case 3:
						nextLocation = [wantedToy.x + 1, wantedToy.y + 1];
						break;
					case 4:
						nextLocation = [wantedToy.x + 1, wantedToy.y];
						break;
					case 5:
						nextLocation = [wantedToy.x + 1, wantedToy.y - 1];
						break;
					case 6:
						nextLocation = [wantedToy.x, wantedToy.y - 1];
						break;
					case 7:
						nextLocation = [wantedToy.x - 1, wantedToy.y - 1];
						break;
				}
				// check if valid and empty
				if (nextLocation[0] >= 0 && nextLocation[0] <= BOARD_SIZE && nextLocation[1] >= 0 && nextLocation[1] <= BOARD_SIZE - 1 && this.empty_location(nextLocation[0], nextLocation[1]))
				{
					posibleLocations.push(new Move(wantedToy, nextLocation[0], nextLocation[1], false, NOT_CHOSEN));
				}
			}
		}
		// 2. check if can jump over other player
		for (var directionIndex = 0; directionIndex < wantedToy.directions.length; directionIndex++)
		{
			var nextLocation = [];
			var jumpLocation = [];
			// get next location
			switch (wantedToy.directions[directionIndex])
			{
				case 0:
					nextLocation = [wantedToy.x - 2, wantedToy.y];
					jumpLocation = [wantedToy.x - 1, wantedToy.y];
					break;
				case 1:
					nextLocation = [wantedToy.x - 2, wantedToy.y + 2];
					jumpLocation = [wantedToy.x - 1, wantedToy.y + 1];
					break;
				case 2:
					nextLocation = [wantedToy.x, wantedToy.y + 2];
					jumpLocation = [wantedToy.x , wantedToy.y + 1];
					break;
				case 3:
					nextLocation = [wantedToy.x + 2, wantedToy.y + 2];
					jumpLocation = [wantedToy.x + 1, wantedToy.y + 1];
					break;
				case 4:
					nextLocation = [wantedToy.x + 2, wantedToy.y];
					jumpLocation = [wantedToy.x + 1, wantedToy.y];
					break;
				case 5:
					nextLocation = [wantedToy.x + 2, wantedToy.y - 2];
					jumpLocation = [wantedToy.x + 1, wantedToy.y - 1];
					break;
				case 6:
					nextLocation = [wantedToy.x, wantedToy.y - 2];
					jumpLocation = [wantedToy.x, wantedToy.y - 1];
					break;
				case 7:
					nextLocation = [wantedToy.x - 2, wantedToy.y - 2];
					jumpLocation = [wantedToy.x - 1, wantedToy.y - 1];
					break;
			}
			// check if valid and empty
			if (nextLocation[0] >= 0 && nextLocation[0] <= BOARD_SIZE && nextLocation[1] >= 0 && nextLocation[1] <= BOARD_SIZE - 1 && this.empty_location(nextLocation[0], nextLocation[1]) && !this.empty_location(jumpLocation[0], jumpLocation[1]))
			{
				posibleLocations.push(new Move(wantedToy, nextLocation[0], nextLocation[1], true, this.toy_in_location(jumpLocation[0], jumpLocation[1])));
			}
		}	
		return posibleLocations;
	}
	
	add_shadow_toy(toyId)
	{
		for (var toy_index = 0; toy_index < this.toys.length; toy_index++)
		{
			if (this.toys[toy_index].id == toyId)
			{
				this.shadow_toys.push(this.toys[toy_index]);
				this.toys.splice(toy_index, 1);
				break;
			}
		}
	}
	
	release_shadow_toy(toyId)
	{
		for (var toy_index = 0; toy_index < this.shadow_toys.length; toy_index++)
		{
			if (this.shadow_toys[toy_index].id == toyId)
			{
				this.toys.push(this.shadow_toys[toy_index]);
				this.shadow_toys.splice(toy_index, 1);
				break;
			}
		}
	}
	
	empty_location(x, y)
	{
		for (var toy_index = 0; toy_index < this.toys.length; toy_index++)
		{
			if (this.toys[toy_index].x == x && this.toys[toy_index].y == y)
			{
				return false;
			}
		}
		return true;
	}
	
	get_toy_location_by_id(toyId)
	{
		for (var toy_index = 0; toy_index < this.toys.length; toy_index++)
		{
			if (this.toys[toy_index].id == toyId)
			{
				return [this.toys[toy_index].x, this.toys[toy_index].y];
			}
		}
	}
	
	count_player_toys(playerColor)
	{
		var answer = 0;
		for (var toy_index = 0; toy_index < this.toys.length; toy_index++)
		{
			if (this.toys[toy_index].color == playerColor)
			{
				answer++;
			}
		}
		return answer;
	}
	
	possible_kill(otherPlayerColor, locX, locY)
	{
		var possibleKill = false;
		// add toy there if needed
		var toyAdded = false;
		var killListItem = this.toy_in_location(locX, locY);
		if (killListItem == NOT_CHOSEN)
		{
			this.toys.push(new Toy(NOT_CHOSEN, (otherPlayerColor + 1) % 2, locX, locY));
			toyAdded = true;
		}
		try
		{
			var foundKiller = false;
			// for each other players toy, check if one of it's moves is to kill someone at this location
			for (var toy_index = 0; toy_index < this.toys.length; toy_index++)
			{
				if (this.toys[toy_index].color == otherPlayerColor)
				{			
					var thisToyPossibleMoves = this.possible_next_steps(this.toys[toy_index].id, false);
					for (var moveIndex = 0; moveIndex < thisToyPossibleMoves.length; moveIndex++)
					{
						if (thisToyPossibleMoves[moveIndex].jump_over == killListItem)
						{
							console.log("Toy at (" + locX + ", " + locY + ") can be killed by toy #" + this.toys[toy_index].id);
							possibleKill = true;
							foundKiller = true;
							break;
						}
					}
					// just to skip the others if the first one found
					if (foundKiller)
					{
						break;
					}	
				}
			}
		}
		catch (error)
		{
			// if shadow toy added, delete it
			if (toyAdded)
			{
				this.toys.pop();
			}
		}
		// if shadow toy added, delete it
		if (toyAdded)
		{
			this.toys.pop();
		}
		
		return possibleKill;
	}
	
	toy_in_location(x, y)
	{
		for (var toy_index = 0; toy_index < this.toys.length; toy_index++)
		{
			if (this.toys[toy_index].x == x && this.toys[toy_index].y == y)
			{
				return this.toys[toy_index].id;
			}
		}
		return NOT_CHOSEN;
	}
	
	can_jump(x, y)
	{
		for (var toy_index = 0; toy_index < this.toys.length; toy_index++)
		{
			if (this.toys[toy_index].x == x && this.toys[toy_index].y == y)
			{
				return false;
			}
		}
		return true;
	}
	
	kill_list_from_jump(jump_move)
	{
		for (var toy_index = 0; toy_index < this.toys.length; toy_index++)
		{
			if (jump_move.jump_over == this.toys[toy_index].id && this.toys[toy_index].color != jump_move.toy.color)
			{
				this.toys.splice(toy_index, 1);
				break;
			}
		}
	}
	
	is_there_winner()
	{
		return this.is_player_one_win() || this.is_player_two_win();
	}
	
	is_player_one_win()
	{
		return this.is_player_won(0);
	}
	
	is_player_two_win()
	{
		return this.is_player_won(1);
	}
	
	is_player_won(myPlayerColor)
	{
		var otherPlayerColor = (myPlayerColor + 1) % 2;
		var check_base = PLAYER_ONE_BASE;
		if (myPlayerColor == 0)
		{
			check_base = PLAYER_TWO_BASE;
		}
		
		var other_player_toys = 0;
		for (var toy_index = 0; toy_index < this.toys.length; toy_index++)
		{
			if (this.toys[toy_index].color == myPlayerColor && this.is_toy_in_locations(this.toys[toy_index], check_base))
			{
				return true;
			}
			if (this.toys[toy_index].color == otherPlayerColor)
			{
				other_player_toys++;
			}
		}
		return other_player_toys == 0;
	}
	
	is_toy_in_locations(toy, locations)
	{
		for (var location_index = 0; location_index < locations.length; location_index++)
		{
			if (toy.x == locations[location_index][0] && toy.y == locations[location_index][1])
			{
				return true;
			}
		}
		return false;
	}
	
	get_toy_open_directions(toy)
	{
		var answer = [];
		for (var i = 0; i < 8; i++)
		{
			if (!toy.directions.includes(i))
			{
				answer.push(i);
			}
		}
		return answer;
	}
	
	get_toy_by_id(toyId)
	{
		var answer = [];
		for (var i = 0; i < this.toys.length; i++)
		{
			if (this.toys[i].id == toyId)
			{
				return this.toys[i];
			}
		}
		throw Execption("No toy with ID:" + toyId);
	}
}
