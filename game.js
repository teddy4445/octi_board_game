/* game has list of toys and some logic on how they can move */
class Game
{
	constructor()
	{
		this.shadow_toys = [];
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
	
	all_players_possible_moves(player_color = 1)
	{
		var all_possible_moves = [];
		for (var toy_index = 0; toy_index < this.toys.length; toy_index++)
		{
			if (this.toys[toy_index].color == player_color)
			{
				// add possible new directions
				var openDirections = this.toys[toy_index].get_open_directions();
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
				if (nextLocation[0] >= 0 && nextLocation[0] <= BOARD_SIZE && nextLocation[1] >= 0 && nextLocation[1] <= BOARD_SIZE + 1 && this.empty_location(nextLocation[0], nextLocation[1]))
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
			if (nextLocation[0] >= 0 && nextLocation[0] <= BOARD_SIZE && nextLocation[1] >= 0 && nextLocation[1] <= BOARD_SIZE + 1 && this.empty_location(nextLocation[0], nextLocation[1]) && !this.empty_location(jumpLocation[0], jumpLocation[1]))
			{
				posibleLocations.push(new Move(wantedToy, nextLocation[0], nextLocation[1], true, this.toy_in_location(jumpLocation[0], jumpLocation[1])));
			}
		}	
		return posibleLocations;
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
		var other_player_toys = 0;
		for (var toy_index = 0; toy_index < this.toys.length; toy_index++)
		{
			if (this.toys[toy_index].color == 0 && this.toys[toy_index].is_in_location(PLAYER_TWO_BASE))
			{
				return true;
			}
			if (this.toys[toy_index].color == 1)
			{
				other_player_toys++;
			}
		}
		return other_player_toys == 0;
	}
	
	is_player_two_win()
	{
		var other_player_toys = 0;
		for (var toy_index = 0; toy_index < this.toys.length; toy_index++)
		{
			if (this.toys[toy_index].color == 1 && this.toys[toy_index].is_in_location(PLAYER_ONE_BASE))
			{
				return true;
			}
			if (this.toys[toy_index].color == 0)
			{
				other_player_toys++;
			}
		}
		return other_player_toys == 0;
	}
}