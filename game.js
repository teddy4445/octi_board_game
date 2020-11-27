class Game
{
	constructor()
	{
		this.toys = [];
		this.toys.push(new Toy(0, 0, 1, 1));
		this.toys.push(new Toy(1, 0, 1, 2));
		this.toys.push(new Toy(2, 0, 1, 3));
		this.toys.push(new Toy(3, 0, 1, 4));
		this.toys.push(new Toy(4, 1, 5, 1));
		this.toys.push(new Toy(5, 1, 5, 2));
		this.toys.push(new Toy(6, 1, 5, 3));
		this.toys.push(new Toy(7, 1, 5, 4));
		this.directionSticks = 24;
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
		this.durations = [];
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
		if (this.durations.includes(new_duration))
		{
			throw Execption("Duration " + new_duration + " is already taken for toy (%" + this.id + ")");
		}
		this.durations.push(new_duration);
	}
	
	jump(x, y)
	{
		this.x = x;
		this.y = y;
	}
	
	move(duration)
	{
		if (!this.durations.includes(duration))
		{
			throw Execption("Duration " + duration + " is not avalible for toy (%" + this.id + ")");
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