/* game has list of toys and some logic on how they can move */
class Game
{
	constructor()
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
					posibleLocations.push(new Move(wantedToy, nextLocation[0], nextLocation[1], false, []));
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
	
	toy_in_location(x, y)
	{
		for (var toy_index = 0; toy_index < this.toys.length; toy_index++)
		{
			if (this.toys[toy_index].x == x && this.toys[toy_index].y == y)
			{
				return this.toys[toy_index].id;
			}
		}
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

/* DS to store the meta-data needed for calculate different types of move (near and jump) */
class Move
{
	constructor(toy, new_x, new_y, is_jump, jump_over)
	{
		this.toy = toy;
		this.new_x = new_x;
		this.new_y = new_y;
		this.is_jump = is_jump;
		this.jump_over = jump_over;
	}
}
