/* global varibales */

let GAME_STATES = ["START", "InGame", "WIN"];
let game_state = GAME_STATES[0];

/* end - global varibales */


/* Setup function once called at the start */
function setup() 
{
	createCanvas(windowWidth, windowHeight);
}

/* Called every x seconds */
function draw() 
{
	
}

/* Eventhandler function provided by p5 */
function windowResized() 
{
	resizeCanvas(windowWidth, windowHeight);
}