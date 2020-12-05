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


/* toy has location, belongs to a player by it's color, has ID to be indentified and directions it can move upon */
class Toy
{
	constructor(id, color, x, y, directions = [])
	{
		this.id = id;
		this.color = color;
		this.x = x;
		this.y = y;
		this.directions = directions;
	}
	
	copy()
	{
		return new Toy(this.id, this.color, this.x, this.y, this.directions);
	}
	
	is_in_location(locations)
	{
		for (var location_index = 0; location_index < locations.length; location_index++)
		{
			if (this.x == locations[location_index][0] && this.y == locations[location_index][1])
			{
				return true;
			}
		}
		return false;
	}
	
	get_open_directions()
	{
		var answer = [];
		for (var i = 0; i < 8; i++)
		{
			if (!this.directions.includes(i))
			{
				answer.push(i);
			}
		}
		return answer;
	}
	
	add_duration(new_duration)
	{
		if (this.directions.includes(new_duration))
		{
			throw new Execption("Duration " + new_duration + " is already taken for toy (%" + this.id + ")");
		}
		this.directions.push(new_duration);
	}
	
	jump(x, y)
	{
		this.x = x;
		this.y = y;
	}
	
	move(duration)
	{
		if (!this.directions.includes(duration))
		{
			throw new Execption("Duration " + duration + " is not avalible for toy (%" + this.id + ")");
		}
		switch (duration)
		{
			case 0:
				self.x -= 1;
				break;
			case 1:
				self.x -= 1;
				self.y += 1;
				break;
			case 2:
				self.y += 1;
				break;
			case 3:
				self.x += 1;
				self.y += 1;
				break;
			case 4:
				self.x += 1;
				break;
			case 5:
				self.x += 1;
				self.y -= 1;
				break;
			case 6:
				self.y -= 1;
				break;
			case 7:
				self.x -= 1;
				self.y -= 1;
				break;
		}
	}
}