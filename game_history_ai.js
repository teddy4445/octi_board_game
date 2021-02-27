/* This class is responsible for storing and creating a state-action description for later AI to learn */
let download_already;

class GameHistoryAi
{
	constructor(states = [], start_player_index = 0)
	{
		// list of list of [game state as list, player_index]
		this.states = [];
		for (var i = 0; i < states.length; i++)
		{
			this.states.push([states, start_player_index]);	
			start_player_index = (start_player_index + 1) % 2;
		}
		
		download_already = false;
	}
	
	add_move(state, player_index)
	{
		this.states.push([state, player_index]);
	}
	
	add_win(win_player)
	{
		this.states.push(["winner", win_player]);	
	}
	
	download()
	{
		if (!download_already)
		{
			var dateGame = new Date().toLocaleString().replace(',','').replaceAll("/", "_").replaceAll(" ", "__").replaceAll(":", "_");
			var element = document.createElement('a');
			element.setAttribute('href', "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.states)));
			element.setAttribute('download', "game_" + dateGame + ".js");	
			element.style.display = 'none';
			document.body.appendChild(element);
			element.click();	
			document.body.removeChild(element);
			
			this.states = [];
			download_already = true;
			setTimeout(function()
			{ 
				download_already = false;
			}, 250);
		}
	}
	
}