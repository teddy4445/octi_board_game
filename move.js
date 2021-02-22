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
	
	convert_to_ai_move()
	{
		return new AiMove(AI_MOVE_JUMP, this.toy.id, NOT_CHOSEN, [this.new_x, this.new_y], [this.jump_over], 0);
	}
	
	encode()
	{
		return this.convert_to_ai_move().encode();
	}
}