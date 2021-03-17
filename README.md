# DIGITAL OCTI 
The OCTI board game now in a digital version. Play with friends, 3 levels of AI players and even develop your own AI to play with.

## Summery
In this repo there is a digital version of the OCTI board with three artificial intelligence (AI) players. The first two AI players are based on deterministic algorithms (greedy and MinMax) while the third is based on reinforcement learning (RL) algorithm. We train the RL player based on historical games (offline) and then personalize it using online learning against specific player. An experiment conducted with five levels of human players show that the RL is able to win 44% of the time (greedy and MinMax win 14% and 32%, respectively) making it the hardest AI player.

## OCTI
OCTI is a strategy box game for two players. The OCTI game has two main styles that differ one another in the number of pieces (toys) each player has, the board's size, base locations, and action rules. In this manuscript, we develop the less popular version of four pieces, with bases located in a column and the board is \(7 \times 6\) as this version does not have a digitized version online. 

The rules of the game are as follows: the game starts when both players have their four pieces standing on marked home base locations. The game is turn-based when the green player is the first to take a turn. In each turn, the player plays by clicking on the relevant piece. Then, he can either add a direction arrow to it, or move to a desired location. In case a player "jumps over" an adversary piece and is able to jump over additional pieces, he can do so in the same turn. The game is won by one of two ways: when a player lands a piece on one of the opponent's base tiles, or when a player manages to capture all opponent's pieces.

## Stracture
The project is stractured as follows:
1. **sketch.js** is the main file in the project that responsible for the player-game interactions and implements the P5.js logic to render the game visualization. On page load, it initializes the game and in each frame renders the board. In addition, it contains all the game's logic and events of the user's actions.
2. **toy.js** contains a player's toy class that has its current location on the board, color, id, and list of possible directions it can move to. 
3. **game.js** contains the two players as list of eight pieces (four for each player). This class manages the interaction with the AI players by providing an interface to the game's state and interpretation to the AI player's action.
4. **move.js** contains a data structure class that holds the data and meta data regarding an action.
5. **player_move.js** contains a data structure class that holds the data and meta data regarding an AI player's action.
6. **global_math.js** contains common mathematical operations.  
7. **ai_util.js** is a helper class, providing an easy to use interface to download and load from server files (specifically, the AI's models).
8. **game_history_ai.js** is a class that operates as a logger to the game which later used to train a RL agent which is based on sampling multiple games and their results.
9. **extended_game_history_ai.js** inherits from game_history_ai.js class, and is used for logging the data of numerous games at once.
10. **q_learning_policy.js** is the brain behind the RL-based agent of the game, where the class manage two main operations. First, the online learning by updating the model's weights due to the games it participated at. Second, providing the optimal step for each game's state (with some chance to explore new states). 
11. **policy_offline_learner.py** is responsible to get a list of game_history objects (as Jsons) and prepare the data structure later used by the q_learning_policy class. This file is exceptionally written in Python and not in JS for reasons of convenience. It should be noted that this file is for the development stage only and is not used during games. 
12. **aivsai.js** allows to run the game for 2 AI players playing against each other. This is essential for generating large quantities of gaming data. The data in turn is crucial for the training and development of the RL player.
13. **ai_player.js** has all the AI player's classes. All these classes implements two methods: do_move(game) that receives an instance of the Game object and returns a \(player_move\) instance. Similarly, a \textit{do_continue_jump_move(toyId, possibleMoves)} method which gets the current toy's id that makes the move (as an integer) and list of possible moves for this toy (as a list of \(player_move\) instances) and returns a \(player_move\) instance from this list.

## Usage
Just open the index.html page using any HTTP web server (hosted in the GitHub pages of this repo).

## AI Player Methodology
### Greedy
The greedy algorithm based player is based on finding the best state for a givengame’s state. The greedy algorithm gets the game’s state and a list of all possibleactions.  The greedy algorithm evaluate each action using a heuristic metric.

### MinMax
The MinMax algorithm based player is an extension of the greedy algorithm asit uses the greedy algorithm to determinate the score of a single move.  Thisalgorithm extends the greedy algorithm by adding linear penalty to the numberof friendly pieces that have been removed from the board and gives bonus forcapturing enemy pieces

#### RL
The RL based player is based on sample based RL, where the value of each stateis estimated from experience (Thomas Walsh, Sergiu Goschin and Michael Littman, 2010)[https://www.cs.huji.ac.il/~jeff/aaai10/02/AAAI10-113.pdf].  The states are treated as nodes in a graph, andthe actions are the edges of connecting the states respectively.  The value-basedapproach doesn’t store any explicit policy, only a value function.  The policy isderived directly from the value function, by picking the action the will lead tobest value.

