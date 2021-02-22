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
	
	directions_status()
	{
		var answer = [];
		for (var i = 0; i < 8; i++)
		{
			if (this.directions.includes(i))
			{
				answer.push(1);
			}
			else
			{
				answer.push(0);
			}
		}
		return answer;
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