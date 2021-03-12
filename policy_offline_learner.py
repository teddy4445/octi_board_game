import json
import os


state_score = {}
state_counter = {}

def analyze_one_game_data(history):
	winner = history[-1][1]
	for link in history[:-1]:
		state = tuple(link[0])
		state_win = int(link[1])
		try:
			if winner == state_win:
				state_score[state] += 1
			else:
				state_score[state] += -1
			state_counter[state] += 1
		except:
			if winner == state_win:
				state_score[state] = 1
			else:
				state_score[state] = -1
			state_counter[state] = 1


def read_data():
	path = os.path.join(os.path.dirname(__file__), "Game_Histories")
	for filename in os.listdir(path):
		if filename.endswith(".json") or filename.endswith(".js"):
			if filename.startswith("extend"):
				with open(os.path.join(path, filename)) as dataFile:
					data = dataFile.read()
					many_history = json.loads(data)
					for history in many_history:
						analyze_one_game_data(history=history)
			else:
				with open(os.path.join(path, filename)) as dataFile:
					data = dataFile.read()
					history = json.loads(data)
					analyze_one_game_data(history=history)
		else:
			continue


def process():
    out_scores = {}

    for state in state_score.keys():
        str_state = ','.join(map(str, state))
        if str_state != "w,i,n,n,e,r":
            out_scores[str_state] = state_score[state] / state_counter[state]

    path = os.path.join(os.path.dirname(__file__), "octi_board_game", "data", "qlearning.json")
    with open(path, "w") as out_file:
        json.dump(out_scores, out_file, indent=2,)


def main():
    read_data()
    process()


if __name__ == "__main__":
    main()
