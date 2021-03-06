/* This class is responsible to wrap the Q-leanring AI agent policy to make it easy to use */
class QLearningPolicy
{
	constructor(stateScores)
	{
		// Pair stands for JS list object with 2 values, not a class 
		// the DS is: dict<state, Pair<wins, visits>>
		// TODO: build the object
		this.stateScores = stateScores;
	}
	
	
	// note gameHistory.states is list of list of [game state as list, player_index]
	addSample(gameHistory)
	{
		// first, get win value 
		var winPlayer = gameHistory.states[gameHistory.states.length - 1][1];
		
		// second, go over each state and add it's event to the list
		for (var stateIndex = 0; stateIndex < gameHistory.states.length - 1; stateIndex++)
		{
			try
			{
				this.stateScores[gameHistory.states[stateIndex][0]][1]++;
			}
			catch (error)
			{ 
				this.stateScores[gameHistory.states[stateIndex][0]] = [0, 1];
			}
			// find if this move helped to win the game or not 
			var score;
			if (gameHistory.states[stateIndex][1] == winPlayer)
			{
				this.stateScores[gameHistory.states[stateIndex][0]][0]++;
			}
		}
	}
	
	getStateScore(state)
	{
		var winVisitPair = this.stateScores[state];
		return winVisitPair[0] / winVisitPair[1];
	}
	
	// given the game object, allPossbileMoves and exploration chance, decide what we do next step
	getBestMove(game, allPossbileMoves, exploreChance)
	{
		// find if we go on optimization or exploration
		if (Math.random() < exploreChance)
		{
			// explore - TODO: make it chance relative to the performance and not from things we did not see until now
			return allPossbileMoves[Math.floor(Math.random() * allPossbileMoves.length)];
		}
		else
		{
			var nextStepState = {};
			for (var i = 0; i < allPossbileMoves.length; i++)
			{
				var nextState = game.get_state_after_move(allPossbileMoves[i]);
				try
				{
					var score = this.stateScores[this._convert_state_format(nextState)];
					if (score == null)
					{
						throw "State not found";
					}
					nextStepState[allPossbileMoves[i].dict_encode()] = score;
				}
				catch (error)
				{
					nextStepState[allPossbileMoves[i].dict_encode()] = 0; // new - we did not see it yet 
				}
			}
			// optimize - get the state with the biggest score 
			return AiMove.dict_decode(Object.keys(nextStepState).reduce((a, b) => nextStepState[a] > nextStepState[b] ? a : b));
		}
	}
	
	download()
	{
		var dateGame = new Date().toLocaleString().replace(',','').replaceAll("/", "_").replaceAll(" ", "__").replaceAll(":", "_");
		var element = document.createElement('a');
		element.setAttribute('href', "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.stateScores)));
		element.setAttribute('download', "q_learning_policy_" + dateGame + ".js");	
		element.style.display = 'none';
		document.body.appendChild(element);
		element.click();	
		document.body.removeChild(element);
	}
	
	// help function responsible for states format converstion
	_convert_state_format(state)
	{
		return state.join();
	}
}