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

// global game varable
let game;
let is_pick_toy_mode;
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
	
	// get static draw sizes
	boxSize = Math.floor(GAME_HEIGHT / 6) - 1;
	
	// create game
	game = new Game();
	is_pick_toy_mode = false;
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
	drawLines();
	putMouse();
	
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
			fill(color(255, 255, 255, 70));
			polygon((game.toys[toyIndex].x + 0.5) * boxSize , (game.toys[toyIndex].y + 0.5) * boxSize , boxSize * 0.42, 8);
		}
		else if (player_turn == 2 && game.toys[toyIndex].color == 1 && !is_pick_toy_mode)
		{
			fill(color(255, 255, 255, 70));
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
					line((game.toys[toyIndex].x + 0.5) * boxSize, (game.toys[toyIndex].y + 0.5) * boxSize - boxSize * 0.33, (game.toys[toyIndex].x + 0.5) * boxSize, (game.toys[toyIndex].y + 0.5) * boxSize- boxSize * 0.33 - 10);
					break;
				case 1:
					line((game.toys[toyIndex].x + 0.5) * boxSize + boxSize * 0.25, (game.toys[toyIndex].y + 0.5) * boxSize - boxSize * 0.25, (game.toys[toyIndex].x + 0.5) * boxSize + boxSize * 0.25 + 7, (game.toys[toyIndex].y + 0.5) * boxSize- boxSize * 0.25 - 7);
					break;
				case 2:
					line((game.toys[toyIndex].x + 0.5) * boxSize + boxSize * 0.33, (game.toys[toyIndex].y + 0.5) * boxSize, (game.toys[toyIndex].x + 0.5) * boxSize + boxSize * 0.33 + 10, (game.toys[toyIndex].y + 0.5) * boxSize);
					break;
				case 3:
					line((game.toys[toyIndex].x + 0.5) * boxSize + boxSize * 0.25, (game.toys[toyIndex].y + 0.5) * boxSize + boxSize * 0.25, (game.toys[toyIndex].x + 0.5) * boxSize + boxSize * 0.25 + 7, (game.toys[toyIndex].y + 0.5) * boxSize + boxSize * 0.25 + 7);
					break;
				case 4:
					line((game.toys[toyIndex].x + 0.5) * boxSize, (game.toys[toyIndex].y + 0.5) * boxSize + boxSize * 0.33, (game.toys[toyIndex].x + 0.5) * boxSize, (game.toys[toyIndex].y + 0.5) * boxSize + boxSize * 0.33 + 10);
					break;
				case 5:
					line((game.toys[toyIndex].x + 0.5) * boxSize - boxSize * 0.25, (game.toys[toyIndex].y + 0.5) * boxSize + boxSize * 0.25, (game.toys[toyIndex].x + 0.5) * boxSize - boxSize * 0.25 - 7, (game.toys[toyIndex].y + 0.5) * boxSize + boxSize * 0.25 + 7);
					break;
				case 6:
					line((game.toys[toyIndex].x + 0.5) * boxSize - boxSize * 0.33, (game.toys[toyIndex].y + 0.5) * boxSize, (game.toys[toyIndex].x + 0.5) * boxSize - boxSize * 0.33 - 10, (game.toys[toyIndex].y + 0.5) * boxSize);
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
	fill(color(255, 255, 255, 70));
	strokeWeight(0);
	polygon((pickedToy.x + 0.5) * boxSize , (pickedToy.y + 0.5) * boxSize , boxSize * 0.42, 8);
	
	// print all possible_next_steps
	for (var locationIndex = 0; locationIndex < thisPossibleNextSteps.length; locationIndex++)
	{
		tile(thisPossibleNextSteps[locationIndex][0], thisPossibleNextSteps[locationIndex][1], boxSize, 219, 195, 173);
	}
}


function putMouse()
{
	strokeWeight(3);
	
	if (is_pick_toy_mode)
	{
		if (NextToNextStep(mouseX, mouseY))
		{
			stroke(0);	
			line(mouseX - 5, mouseY, mouseX + 5, mouseY);
			line(mouseX, mouseY - 5, mouseX, mouseY + 5);
		}
		else if (NextToNewDirection(mouseX, mouseY))
		{
			fill(0);
			circle(mouseX - 5, mouseY - 5, 5);
			circle(mouseX + 5, mouseY + 5, 5);
			line(mouseX - 5, mouseY + 5, mouseX + 5, mouseY - 5);
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
	else
	{	
		stroke(0);	
		// check if toy we can pick
		if (clickNextToPickToy(mouseX, mouseY) != NOT_CHOSEN)
		{
			line(mouseX - 5, mouseY, mouseX + 5, mouseY);
			line(mouseX, mouseY - 5, mouseX, mouseY + 5);
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
	if (mouseX > GAME_HEIGHT || mouseX < 0 || mouseY > GAME_WIDTH * 2 || mouseY < 0)
	{
		return;
	}
	
	if (is_pick_toy_mode)
	{
		if(onSamePickToy(nowMouseX, nowMouseY))
		{
			is_pick_toy_mode = false;
			pickedToy = NOT_CHOSEN;
		}
		var nextLocationCheck = NextToNextStep(nowMouseX, nowMouseY);
		if (nextLocationCheck != NOT_CHOSEN)
		{
			pickedToy.jump(thisPossibleNextSteps[nextLocationCheck][0], thisPossibleNextSteps[nextLocationCheck][1]);
			if (player_turn == 1)
			{
				player_turn = 2;
			}
			else
			{
				player_turn = 1;
			}
			is_pick_toy_mode = false;
			pickedToy = NOT_CHOSEN;
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
			thisPossibleNextSteps = game.possible_next_steps(pickedToy.id);
		}		
	}
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
		if (dist((thisPossibleNextSteps[nextLocationIndex][0] + 0.5) * boxSize, (thisPossibleNextSteps[nextLocationIndex][1] + 0.5) * boxSize, checkX, checkY) < boxSize * 0.33)
		{
			return nextLocationIndex;
		}
	}
	return NOT_CHOSEN;
}

function NextToNewDirection(checkX, checkY)
{
	return false;
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

function tile(x, y, size, color_r, color_g, color_b) 
{
	fill(color_r, color_g, color_b);
	rect(x * boxSize, y * boxSize, size);
}