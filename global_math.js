
/* finds the minimal distance between a place on the board to the other's players base*/
function minDistanceFromBase(color_index, x, y)
{
	// which base we aiming for
	let baseLocationList = PLAYER_TWO_BASE;
	if (color_index == 0)
	{
		baseLocationList = PLAYER_ONE_BASE;
	}
	// find the minimal manhattan distance
	var minDistance = BOARD_SIZE * BOARD_SIZE;
	for (var baseIndex = 0; baseIndex < baseLocationList.length; baseIndex++)
	{
		var baseDistance = manhattan_distance(x, y, baseLocationList[baseIndex][0], baseLocationList[baseIndex][1]);
		if (baseDistance < minDistance)
		{
			minDistance = baseDistance;
		}
	}
	return minDistance;
}

function manhattan_distance(x1, y1, x2, y2)
{
	return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}