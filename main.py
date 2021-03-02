import json
import os
from collections import Counter


state_score = {}
state_counter = Counter()
outScores = {}

def readData():
    #TODO: change local path
    path = 'C:/Users/cokron/Desktop/Game_Histories'
    for filename in os.listdir(path):
        if filename.endswith(".js"):
            with open(os.path.join(path, filename)) as dataFile:
                data = dataFile.read()
                history = json.loads(data)
                winner = history[-1][1]
                for link in history[:-1]:
                    state = tuple(link[0])
                    s = state_score.get(state)
                    if s is None:
                        if winner == 1:
                            state_score[state] = 1
                        else:
                            state_score[state] = -1
                    else:
                        if winner == 1:
                            state_score[state] = s+1
                        else:
                            state_score[state] = s-1
                    state_counter.update({state: 1})
        else:
            continue


def process():
    for state in state_score.keys():
        strState = ''.join(map(str, state))
        outScores[strState] = state_score[state] / state_counter[state]
    with open("outFile.json", "w") as outfile:
        json.dump(outScores, outfile)

def main():
    readData()
    process()

if __name__ == "__main__":
    main()


