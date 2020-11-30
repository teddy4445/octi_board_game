/* AI statuses */
let AI_MOVE_ADD_DIRECTION = 1;
let AI_MOVE_JUMP = 2;
/* */


class AiPlayer
{
	constructor()
	{
		
	}
	
	do_move(game)
	{
		// first find the possible moves we can decide from
		
	}
}


class AiMove
{
	constructor(type, pickedToyId, newDirection, newLocation, killList)
	{
		this.type = type;
		this.pickedToyId = pickedToyId;
		this.newDirection = newDirection;
		this.newLocation = newLocation;
		this.killList = killList;
	}
}