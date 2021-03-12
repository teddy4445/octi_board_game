/* This class is responsible for storing and creating a state-action description for later AI to learn */

class ExtendedGameHistoryAi
{
	constructor()
	{
		// list of list of [game state as list, player_index]
		this.games = [];
		download_already = false;	
	}
	
	add_game(game_history)
	{
		this.games.push(game_history);
	}
	
	download()
	{
		var dateGame = new Date().toLocaleString().replace(',','').replaceAll("/", "_").replaceAll(" ", "__").replaceAll(":", "_");
		var element = document.createElement('a');
		element.setAttribute('href', "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.games)));
		element.setAttribute('download', "extend_game_" + dateGame + ".json");	
		element.style.display = 'none';
		document.body.appendChild(element);
		element.click();	
		document.body.removeChild(element);
		
		this.games = [];
	}
	
}