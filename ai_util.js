let MODEL_Q_LEARNING = "qlearning";

class AiUtil
{
	constructor()
	{
		
	}
	
	static readModel(modelName)
	{
		switch (modelName)
		{
			case MODEL_Q_LEARNING:
				$.get("octi_board_game/data/" + MODEL_Q_LEARNING + ".json", function(data) {
					FILE_POLICY_DATA = data;
				});
		}
	}
	
	static downloadModel(modelName)
	{
		var element = document.createElement('a');
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(aiPlayer.download_policy()));
		element.setAttribute('download', modelName);	
		element.style.display = 'none';
		document.body.appendChild(element);
		element.click();	
		document.body.removeChild(element);
	}
}