/* This class is responsible for storing and creating a state-action description for later AI to learn */
let download_already;
class GameHistoryAi
{
	constructor(states = [], actions = [])
	{
		this.statesActions = {};
		for (var i = 0; i < states.length; i++)
		{
			try
			{
				this.statesActions[states[i]].push(actions[i]);	
			}
			catch (error)
			{
				this.statesActions[states[i]] = [actions[i]];
			}
		}
		
		download_already = false;
	}
	
	add_move(state, action)
	{
		try
		{
			this.statesActions[state].push(action);	
		}
		catch (error)
		{
			this.statesActions[state] = [action];
		}
	}
	
	download()
	{
		if (!download_already)
		{
			var dateGame = new Date().toLocaleString().replace(',','').replaceAll("/", "_").replaceAll(" ", "__").replaceAll(":", "_");
			var element = document.createElement('a');
			element.setAttribute('href', "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.statesActions)));
			element.setAttribute('download', "game_" + dateGame + ".js");	
			element.style.display = 'none';
			document.body.appendChild(element);
			element.click();	
			document.body.removeChild(element);
			
			download_already = true;
			setTimeout(function()
			{ 
				download_already = false;
			}, 250);
		}
	}
	
}