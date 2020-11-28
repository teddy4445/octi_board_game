class Game
{
	constructor()
	{
		this.toys = [];
		this.toys.push(new Toy(0, 0, 1, 1));
		this.toys[0].add_duration(0);
		this.toys[0].add_duration(1);
		this.toys[0].add_duration(2);
		this.toys[0].add_duration(3);
		this.toys[0].add_duration(4);
		this.toys[0].add_duration(5);
		this.toys[0].add_duration(6);
		this.toys[0].add_duration(7);
		this.toys.push(new Toy(1, 0, 1, 2));
		this.toys.push(new Toy(2, 0, 1, 3));
		this.toys.push(new Toy(3, 0, 1, 4));
		this.toys.push(new Toy(4, 1, 5, 1));
		this.toys.push(new Toy(5, 1, 5, 2));
		this.toys.push(new Toy(6, 1, 5, 3));
		this.toys.push(new Toy(7, 1, 5, 4));
		this.toys[7].add_duration(0);
		this.toys[7].add_duration(1);
		this.toys[7].add_duration(2);
		this.toys[7].add_duration(3);
		this.toys[7].add_duration(4);
		this.toys[7].add_duration(5);
		this.toys[7].add_duration(6);
		this.toys[7].add_duration(7);
		this.directionSticks = 24;
	}
	
	possible_next_steps(toy_id)
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
		// PROCESS:
		let posibleLocations = [];
		// 1. check what directions are open 
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
			if (nextLocation[0] >= 0 && nextLocation[0] < BOARD_SIZE && nextLocation[1] >= 0 && nextLocation[1] < BOARD_SIZE + 1 && this.empty_location(nextLocation[0], nextLocation[1]))
			{
				posibleLocations.push(nextLocation);
			}
		}
		// 2. check if can jump over other player
		
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


class Toy
{
	constructor(id, color, x, y)
	{
		this.id = id;
		this.color = color;
		this.x = x;
		this.y = y;
		this.directions = [];
	}
	
	is_in_location(locations)
	{
		for (var location_index = 0; location_index < locations.length; location_index++)
		{
			if (self.x == locations[location_index][0] && self.y == locations[location_index][1])
			{
				return true;
			}
		}
		return false;
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