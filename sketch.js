/* global varibales */
let BOARD_SIZE = 6;
let TOYS_PER_PLAYER = 4;
let PLAYER_ONE_BASE = [[1, 1], [1, 2], [1, 3], [1, 4]];
let PLAYER_TWO_BASE = [[5, 1], [5, 2], [5, 3], [5, 4]];
let GAME_STATES = ["START", "InGame", "WIN"];
let game_state = GAME_STATES[0];
let GAME_HEIGHT = 600;
let GAME_WIDTH = GAME_HEIGHT * 7 / 6;
let NOT_CHOSEN = -1;
let NEW_DIRECTION_MARK_R = 10;

// global game varable
let game;
let is_pick_toy_mode;
let is_re_jump_case;
let player_turn;
let pickedToy;
let thisPossibleNextSteps;


// print vars
let boxSize;

/* end - global varibales */


/* Setup function once called at the start */
function setup() 
{
	let canvasGame = createCanvas(GAME_WIDTH, GAME_HEIGHT);
	canvasGame.parent('game');
	noCursor();
	textAlign(CENTER, CENTER);
	
	// get static draw sizes
	boxSize = Math.floor(GAME_HEIGHT / 6) - 1;
	
	// create game
	game = new Game();
	is_pick_toy_mode = false;
	is_re_jump_case = false;
	player_turn = 1;
	pickedToy = NOT_CHOSEN;
}

/* Called every x seconds */
function draw() 
{
	drawGame();
	if (is_pick_toy_mode)
	{
		drawPickMode();
	}
	else if (is_re_jump_case)
	{
		drawReJumpMode();
	}
	drawLines();
	putMouse();
	
	let playerWin = is_win();
	if (playerWin != NOT_CHOSEN)
	{
		textSize(32);
		if (playerWin == 2)
		{
			fill(211, 2, 41);
			stroke(211, 2, 41);
		}
		else // if second player win
		{
			fill(0, 93, 80);
			stroke(0, 93, 80);
		}
		text("player " + playerWin + " win!", GAME_WIDTH / 2, GAME_HEIGHT / 2);
		noLoop();
		setTimeout(function (){
			game = new Game();
			is_pick_toy_mode = false;
			player_turn = 1;
			pickedToy = NOT_CHOSEN;
			loop();
		}, 2000);
	}
}

function is_win()
{
	let playerOneToyscounter = 0;
	let playerTwoToyscounter = 0;
	for (var toyIndex = 0; toyIndex < game.toys.length; toyIndex++)
	{
		if (game.toys[toyIndex].color == 0)
		{
			playerOneToyscounter++;
			if (game.toys[toyIndex].is_in_location(PLAYER_TWO_BASE))
			{
				return 1;
			}
		}
		else if (game.toys[toyIndex].color == 1)
		{
			playerTwoToyscounter++;
			if (game.toys[toyIndex].is_in_location(PLAYER_ONE_BASE))
			{
				return 2;	
			}
		}
	}
	// if the second player does not have players to play with
	if (playerOneToyscounter == 0)
	{
		return 2;
	}
	else if (playerTwoToyscounter == 0)
	{
		return 1;
	}
	return NOT_CHOSEN;
}

function drawGame()
{
	drawBoard();
	drawToys();
}

function drawLines()
{
	strokeWeight(1);
	stroke(0);
	// print - lines 
	for (var index = 1; index < BOARD_SIZE; index++)
	{
		line(0, boxSize * index, GAME_WIDTH, boxSize * index);
	}
	// print | lines 
	for (var index = 1; index < BOARD_SIZE + 1; index++)
	{
		line(boxSize * index, 0, boxSize * index, GAME_WIDTH);
	}
	// edges of board
	strokeWeight(2);
	line(0, GAME_HEIGHT - 1, GAME_WIDTH, GAME_HEIGHT - 1);
	line(0, 1, GAME_WIDTH, 1);
	line(1, 0, 1, GAME_WIDTH);
	line(GAME_WIDTH - 1, 0, GAME_WIDTH - 1, GAME_WIDTH);
}

function drawBoard()
{
	// draw game board
	background("#f0e6dd");
	// draw lines 
	// draw win boxes
	for (var winBoxIndex = 0; winBoxIndex < 4; winBoxIndex++)
	{
		tile(PLAYER_ONE_BASE[winBoxIndex][0], PLAYER_ONE_BASE[winBoxIndex][1], boxSize, 0, 162, 101);
	}
	for (var winBoxIndex = 0; winBoxIndex < 4; winBoxIndex++)
	{
		tile(PLAYER_TWO_BASE[winBoxIndex][0], PLAYER_ONE_BASE[winBoxIndex][1], boxSize, 233, 110, 66);
	}
}

function drawToys()
{
	strokeWeight(1);
	stroke(0);
	// first, draw game board
	for (var toyIndex = 0; toyIndex < game.toys.length; toyIndex++)
	{
		stroke(0);
		/*
		fill(0);
		polygon((game.toys[toyIndex].x + 0.5) * boxSize - 2, (game.toys[toyIndex].y + 0.5) * boxSize - 2, boxSize * 0.34, 8);
		*/
		
		strokeWeight(0);
		// mark the players we can play with
		if (player_turn == 1 && game.toys[toyIndex].color == 0 && !is_pick_toy_mode)
		{
			fill(color(255, 255, 255, 130));
			strokeWeight(1);
			stroke(0, 0, 0);
			polygon((game.toys[toyIndex].x + 0.5) * boxSize , (game.toys[toyIndex].y + 0.5) * boxSize , boxSize * 0.42, 8);
		}
		else if (player_turn == 2 && game.toys[toyIndex].color == 1 && !is_pick_toy_mode)
		{
			fill(color(255, 255, 255, 130));
			strokeWeight(1);
			stroke(0, 0, 0);
			polygon((game.toys[toyIndex].x + 0.5) * boxSize , (game.toys[toyIndex].y + 0.5) * boxSize , boxSize * 0.42, 8);
		}
		strokeWeight(1);
		
		
		if (game.toys[toyIndex].color == 0) // first player is the green one
		{
			fill(0, 93, 80);
		}
		else // if second player
		{
			fill(211, 2, 41);
		}
		
		// draw polygon itself
		if (pickedToy == game.toys[toyIndex].id)
		{
			stroke(255);
			strokeWeight(2);
		}
		else
		{
			stroke(0);
			strokeWeight(1);
		}
		polygon((game.toys[toyIndex].x + 0.5) * boxSize, (game.toys[toyIndex].y + 0.5) * boxSize, boxSize * 0.33, 8);
		fill(255);
		stroke(255);
		if (game.toys[toyIndex].color == 0) // first player is the green one
		{
			triangle((game.toys[toyIndex].x + 0.5) * boxSize - 5, (game.toys[toyIndex].y + 0.5) * boxSize - 5, 
						(game.toys[toyIndex].x + 0.5) * boxSize - 5, (game.toys[toyIndex].y + 0.5) * boxSize + 5,
						(game.toys[toyIndex].x + 0.5) * boxSize + 5, (game.toys[toyIndex].y + 0.5) * boxSize);
		}
		else // if second player
		{				
			triangle((game.toys[toyIndex].x + 0.5) * boxSize + 5, (game.toys[toyIndex].y + 0.5) * boxSize - 5, 
						(game.toys[toyIndex].x + 0.5) * boxSize + 5, (game.toys[toyIndex].y + 0.5) * boxSize + 5,
						(game.toys[toyIndex].x + 0.5) * boxSize - 5, (game.toys[toyIndex].y + 0.5) * boxSize);
		}
		
		// draw directions steaks 
		strokeWeight(10);
		stroke(150,75,0);
		for (var directionIndex = 0; directionIndex < game.toys[toyIndex].directions.length; directionIndex++)
		{			
			switch (game.toys[toyIndex].directions[directionIndex])
			{
				case 0:
					line((game.toys[toyIndex].x + 0.5) * boxSize - boxSize * 0.33, (game.toys[toyIndex].y + 0.5) * boxSize, (game.toys[toyIndex].x + 0.5) * boxSize - boxSize * 0.33 - 10, (game.toys[toyIndex].y + 0.5) * boxSize);
					break;
				case 1:
					line((game.toys[toyIndex].x + 0.5) * boxSize + boxSize * 0.25, (game.toys[toyIndex].y + 0.5) * boxSize - boxSize * 0.25, (game.toys[toyIndex].x + 0.5) * boxSize + boxSize * 0.25 + 7, (game.toys[toyIndex].y + 0.5) * boxSize- boxSize * 0.25 - 7);
					break;
				case 2:
					line((game.toys[toyIndex].x + 0.5) * boxSize + boxSize * 0.25, (game.toys[toyIndex].y + 0.5) * boxSize + boxSize * 0.25, (game.toys[toyIndex].x + 0.5) * boxSize + boxSize * 0.25 + 7, (game.toys[toyIndex].y + 0.5) * boxSize + boxSize * 0.25 + 7);
					break;
				case 3:
					line((game.toys[toyIndex].x + 0.5) * boxSize - boxSize * 0.25, (game.toys[toyIndex].y + 0.5) * boxSize + boxSize * 0.25, (game.toys[toyIndex].x + 0.5) * boxSize - boxSize * 0.25 - 7, (game.toys[toyIndex].y + 0.5) * boxSize + boxSize * 0.25 + 7);
					break;
				case 4:
					line((game.toys[toyIndex].x + 0.5) * boxSize, (game.toys[toyIndex].y + 0.5) * boxSize - boxSize * 0.33, (game.toys[toyIndex].x + 0.5) * boxSize, (game.toys[toyIndex].y + 0.5) * boxSize- boxSize * 0.33 - 10);
					break;
				case 5:
					line((game.toys[toyIndex].x + 0.5) * boxSize, (game.toys[toyIndex].y + 0.5) * boxSize + boxSize * 0.33, (game.toys[toyIndex].x + 0.5) * boxSize, (game.toys[toyIndex].y + 0.5) * boxSize + boxSize * 0.33 + 10);
					break;
				case 6:
					line((game.toys[toyIndex].x + 0.5) * boxSize + boxSize * 0.33, (game.toys[toyIndex].y + 0.5) * boxSize, (game.toys[toyIndex].x + 0.5) * boxSize + boxSize * 0.33 + 10, (game.toys[toyIndex].y + 0.5) * boxSize);
					break;
				case 7:
					line((game.toys[toyIndex].x + 0.5) * boxSize - boxSize * 0.25, (game.toys[toyIndex].y + 0.5) * boxSize - boxSize * 0.25, (game.toys[toyIndex].x + 0.5) * boxSize - boxSize * 0.25 - 7, (game.toys[toyIndex].y + 0.5) * boxSize- boxSize * 0.25 - 7);
					break;
			}
		}
	}
}

function drawPickMode()
{
	fill(color(255, 255, 255, 130));
	strokeWeight(1);
	stroke(0, 0, 0);
	polygon((pickedToy.x + 0.5) * boxSize , (pickedToy.y + 0.5) * boxSize , boxSize * 0.42, 8);
	
	// print all possible_next_steps
	for (var locationIndex = 0; locationIndex < thisPossibleNextSteps.length; locationIndex++)
	{
		tile(thisPossibleNextSteps[locationIndex].new_x, thisPossibleNextSteps[locationIndex].new_y, boxSize, 219, 195, 173);
	}
	
	// draw the possible edges we can add 
	for (var directionIndex = 0; directionIndex < thisPossibleNewDirections.length; directionIndex++)
	{
		fill(50);
		stroke(30);
		addDirectionDot(pickedToy.x, pickedToy.y, thisPossibleNewDirections[directionIndex]);
	}
}

function drawReJumpMode()
{
	fill(color(255, 255, 255, 130));
	strokeWeight(1);
	stroke(0, 0, 0);
	polygon((pickedToy.x + 0.5) * boxSize , (pickedToy.y + 0.5) * boxSize , boxSize * 0.42, 8);
	
	// print all possible_next_steps
	for (var locationIndex = 0; locationIndex < thisPossibleNextSteps.length; locationIndex++)
	{
		tile(thisPossibleNextSteps[locationIndex].new_x, thisPossibleNextSteps[locationIndex].new_y, boxSize, 219, 195, 173);
	}
}

function putMouse()
{
	strokeWeight(3);
	
	if (is_pick_toy_mode)
	{
		if (NextToNextStep(mouseX, mouseY) != NOT_CHOSEN)
		{
			stroke(0);	
			xMouseMark();
		}
		else if (NextToAddDirection(pickedToy.x, pickedToy.y, mouseX, mouseY) != NOT_CHOSEN)
		{
			vMouseMark();
		}
		else if (onSamePickToy(mouseX, mouseY))
		{
			fill(0);
			stroke(0);	
			line(mouseX - 5, mouseY + 5, mouseX + 5, mouseY - 5);
			line(mouseX + 5, mouseY + 5, mouseX - 5, mouseY - 5);
		}
		else
		{
			fill(0);
			stroke(0);	
			circle(mouseX, mouseY, 15);
		}
	}
	else if (is_re_jump_case)
	{
		stroke(0);	
		if (NextToNextStep(mouseX, mouseY) != NOT_CHOSEN)
		{
			xMouseMark();
		}
		else if (onSamePickToy(mouseX, mouseY))
		{
			vMouseMark();
		}
		else
		{
			fill(0);
			circle(mouseX, mouseY, 15);
		}
	}
	else
	{	
		stroke(0);	
		// check if toy we can pick
		if (clickNextToPickToy(mouseX, mouseY) != NOT_CHOSEN)
		{
			xMouseMark();
		}
		else
		{
			fill(0);
			circle(mouseX, mouseY, 15);
		}
	}
}


function mouseClicked() 
{
	var nowMouseX = mouseX;
	var nowMouseY = mouseY;
	
	// if click outside the panel, ignore it
	if (nowMouseX > GAME_WIDTH || nowMouseX < 0 || nowMouseY > GAME_HEIGHT || nowMouseY < 0)
	{
		return;
	}
	
	if (is_pick_toy_mode)
	{
		let nextDirection = NextToAddDirection(pickedToy.x, pickedToy.y, nowMouseX, nowMouseY);
		if (nextDirection != NOT_CHOSEN)
		{
			pickedToy.add_duration(nextDirection);
			swithPlayer();
		}
		else if(onSamePickToy(nowMouseX, nowMouseY))
		{
			is_pick_toy_mode = false;
			pickedToy = NOT_CHOSEN;
		}
		var nextLocationCheck = NextToNextStep(nowMouseX, nowMouseY);
		if (nextLocationCheck != NOT_CHOSEN)
		{
			pickedToy.jump(thisPossibleNextSteps[nextLocationCheck].new_x, thisPossibleNextSteps[nextLocationCheck].new_y);
			if (thisPossibleNextSteps[nextLocationCheck].is_jump)
			{
				game.kill_list_from_jump(thisPossibleNextSteps[nextLocationCheck]);	
				thisPossibleNextSteps = game.possible_next_steps(pickedToy.id, false);
				if (thisPossibleNextSteps.length > 0)
				{
					is_re_jump_case = true;
					is_pick_toy_mode = false;
				}
				else
				{
					swithPlayer();
				}
			}
			else
			{
				swithPlayer();
			}
		}
	}
	else if (is_re_jump_case)
	{
		if(onSamePickToy(nowMouseX, nowMouseY))
		{
			swithPlayer();
		}
		var nextLocationCheck = NextToNextStep(nowMouseX, nowMouseY);
		if (nextLocationCheck != NOT_CHOSEN)
		{
			pickedToy.jump(thisPossibleNextSteps[nextLocationCheck].new_x, thisPossibleNextSteps[nextLocationCheck].new_y);
			if (thisPossibleNextSteps[nextLocationCheck].is_jump)
			{
				game.kill_list_from_jump(thisPossibleNextSteps[nextLocationCheck]);	
				thisPossibleNextSteps = game.possible_next_steps(pickedToy.id, false);
				if (thisPossibleNextSteps.length > 0)
				{
					is_re_jump_case = true;
					is_pick_toy_mode = false;
				}
				else
				{
					swithPlayer();
				}
			}
			else
			{
				swithPlayer();
			}
		}
	}
	else
	{
		// find if hiting some node
		var nextToNode = clickNextToPickToy(nowMouseX, nowMouseY);
		
		if(nextToNode != NOT_CHOSEN)
		{
			is_pick_toy_mode = true;
			// set the toy we are using now
			pickedToy = nextToNode;
			// find where it can go
			thisPossibleNextSteps = game.possible_next_steps(pickedToy.id, true);
			thisPossibleNewDirections = pickedToy.get_open_directions();
		}		
	}
}

function swithPlayer()
{
	if (player_turn == 1)
	{
		player_turn = 2;
	}
	else
	{
		player_turn = 1;
	}
	is_pick_toy_mode = false;
	is_re_jump_case = false;
	pickedToy = NOT_CHOSEN;	
}

function clickNextToPickToy(checkX, checkY)
{
	for (var toyIndex = 0; toyIndex < game.toys.length; toyIndex++)
	{
		if ((player_turn == 1 && game.toys[toyIndex].color == 0 && dist(checkX, checkY, (game.toys[toyIndex].x + 0.5) * boxSize, (game.toys[toyIndex].y + 0.5) * boxSize) < boxSize) || (player_turn == 2 && game.toys[toyIndex].color == 1 && dist(checkX, checkY, (game.toys[toyIndex].x + 0.5) * boxSize, (game.toys[toyIndex].y + 0.5) * boxSize) < boxSize * 0.33))
		{
			return game.toys[toyIndex];
		}
	}
	return NOT_CHOSEN;
}

function NextToNextStep(checkX, checkY)
{	
	for (var nextLocationIndex = 0; nextLocationIndex < thisPossibleNextSteps.length; nextLocationIndex++)
	{
		if (dist((thisPossibleNextSteps[nextLocationIndex].new_x + 0.5) * boxSize, (thisPossibleNextSteps[nextLocationIndex].new_y + 0.5) * boxSize, checkX, checkY) < boxSize * 0.33)
		{
			return nextLocationIndex;
		}
	}
	return NOT_CHOSEN;
}

function NextToAddDirection(toyX, toyY, checkX, checkY)
{	
	for (var directionIndex = 0; directionIndex < thisPossibleNewDirections.length; directionIndex++)
	{
	let shift = [];
	switch (thisPossibleNewDirections[directionIndex])
	{
		case 0:
			shift = [-1, 0];
			break;
		case 1:
			shift = [-1, 1];
			break;
		case 2:
			shift = [0, 1];
			break;
		case 3:
			shift = [1, 1];
			break;
		case 4:
			shift = [1, 0];
			break;
		case 5:
			shift = [1, -1];
			break;
		case 6:
			shift = [0, -1];
			break;
		case 7:
			shift = [-1, -1];
			break;
	}
		if (dist((toyX + 0.5 + 0.3 * shift[0]) * boxSize, (toyY + 0.5 + 0.3 * shift[1]) * boxSize, checkX, checkY) < NEW_DIRECTION_MARK_R)
		{
			return thisPossibleNewDirections[directionIndex];
		}
	}
	return NOT_CHOSEN;
}

function onSamePickToy(checkX, checkY)
{
	return dist(checkX, checkY, (pickedToy.x + 0.5) * boxSize, (pickedToy.y + 0.5) * boxSize) < boxSize * 0.33;
}

/* Eventhandler function provided by p5 */
function windowResized() 
{
	resizeCanvas(GAME_WIDTH, GAME_HEIGHT);
	boxSize = Math.floor(GAME_HEIGHT / 6) - 1;
}

function polygon(x, y, radius, npoints) 
{
  let angle = TWO_PI / npoints;
  beginShape();
  let angle_shift = 24;
  for (let a = angle_shift; a < TWO_PI + angle_shift; a += angle) 
  {
    let sx = x + cos(a) * radius;
    let sy = y + sin(a) * radius;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

function xMouseMark()
{
	line(mouseX - 5, mouseY, mouseX + 5, mouseY);
	line(mouseX, mouseY - 5, mouseX, mouseY + 5);
}

function vMouseMark()
{
	line(mouseX, mouseY, mouseX + 10, mouseY - 10);
	line(mouseX, mouseY, mouseX - 5, mouseY - 5);
}

function tile(x, y, size, color_r, color_g, color_b) 
{
	fill(color_r, color_g, color_b);
	rect(x * boxSize, y * boxSize, size);
}

function addDirectionDot(x, y, direction) 
{
	let shift = [];
	switch (direction)
	{
		case 0:
			shift = [-1, 0];
			break;
		case 1:
			shift = [-1, 1];
			break;
		case 2:
			shift = [0, 1];
			break;
		case 3:
			shift = [1, 1];
			break;
		case 4:
			shift = [1, 0];
			break;
		case 5:
			shift = [1, -1];
			break;
		case 6:
			shift = [0, -1];
			break;
		case 7:
			shift = [-1, -1];
			break;
	}
	circle((x + 0.5 + 0.3 * shift[0]) * boxSize, (y + 0.5 + 0.3 * shift[1]) * boxSize, NEW_DIRECTION_MARK_R);
}