/* This class is responsible to wrap the Q-leanring AI agent policy to make it easy to use */
class QLearningPolicy
{
	constructor(statesActions)
	{
		this.statesActions = statesActions;
	}
	
	add_sample(gameHistory)
	{
		
	}
	
	download()
	{
		var dateGame = new Date().toLocaleString().replace(',','').replaceAll("/", "_").replaceAll(" ", "__").replaceAll(":", "_");
		var element = document.createElement('a');
		element.setAttribute('href', "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.statesActions)));
		element.setAttribute('download', "q_learning_policy_" + dateGame + ".js");	
		element.style.display = 'none';
		document.body.appendChild(element);
		element.click();	
		document.body.removeChild(element);
	}
}



class ActionScorePair
{
	constructor(action, score)
	{
		this.action = action;
		this.score = score;
	}
}