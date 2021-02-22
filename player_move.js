/* AI statuses */
let AI_MOVE_ADD_DIRECTION = 1;
let AI_MOVE_JUMP = 2;
/* end - AI statuses */

/* AI player's move */
class AiMove
{
	constructor(type, pickedToyId, newDirection = NOT_CHOSEN, newLocation = [], killList = [], score = 0)
	{
		this.type = type;
		this.pickedToyId = pickedToyId;
		this.newDirection = newDirection;
		this.newLocation = newLocation;
		this.killList = killList;
		this.score = score;
	}
	
	encode()
	{
		return [this.type, this.pickedToyId, this.newDirection, this.newLocation, this.killList];
	}
	
	decode(data)
	{
		return new AiMove(data[0], data[1], data[2], data[3], data[4]);
	}
}