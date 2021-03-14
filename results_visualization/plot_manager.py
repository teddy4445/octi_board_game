#!/usr/bin/python
# -*- coding: utf-8 -*-
# library imports

import os
from random import random
import numpy as np
import matplotlib.pyplot as plt


# general proposed multiple bar plot with error bars
def multi_bar_with_error(
        labels: list,
        x_groups: list,
        y_list: list,
        error: list,
        y_range_axis: tuple = None,
        x_name: str = None,
        y_name: str = None,
        plot_title: str = None,
        alpha: float = 0.9,
        ecolor: str = "black",
        colors: list = None,
        capsize: int = 2,
        save_path: str = None,
        need_show: bool = True) -> None:

    x = np.arange(len(x_groups))

    if colors is None:
        first_colors = [(round(random() * 100) / 100, round(random()
                        * 100) / 100, round(random() * 100) / 100)
                        for i in range(len(y_list[0]))]
        colors = [first_colors for i in range(len(y_list))]

    width_smaller = 1 / (2 * (len(y_list) + 1))
    width = 1 / (len(y_list) + 1)
    spacer = width - width_smaller

    (fig, ax) = plt.subplots()

    # print the bars

    for (index, y) in enumerate(y_list):
        ax.bar(
            x + index * width - len(y_list) / 2 * width,
            y,
            width=width - spacer,
            label=labels[index],
            yerr=error[index],
            align='center',
            edgecolor='black',
            alpha=alpha,
            ecolor=ecolor,
            color=colors[index],
            capsize=capsize,
            )

    # make the plot nice

    ax.set_xlabel(x_name)
    ax.set_ylabel(y_name)
    ax.set_xticks(x)
    ax.set_xticklabels(x_groups)
    ax.set_title(plot_title)
    ax.legend()
    plt.tight_layout()
    ax.spines['right'].set_visible(False)
    ax.spines['top'].set_visible(False)
    axes = plt.gca()
    if isinstance(y_range_axis, tuple):
        axes.set_ylim([y_range_axis[0], y_range_axis[1]])

    # save the figure and show

    if save_path is not None:
        try:
            os.makedirs(os.path.dirname(save_path))
        except Exception as error:
            pass
        plt.savefig(save_path)
    plt.show() if need_show else plt.close()


# prepare anything we need to plot the graphs
def plot_paper_graph():
    multi_bar_with_error(
        labels=['Greedy', 'MinMax', 'RL'],
        x_groups=['Player {}'.format(i + 1) for i in range(5)],
        y_list=[[0.4, 0.2, 0.1, 0, 0], [0.6, 0.4, 0.3, 0.3, 0],
                [0.8, 0.6, 0.3, 0.4, 0.1]],
        error=[[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]],
        y_range_axis=(0, 1),
        x_name='AI agent',
        y_name='AI Win Rate',
        colors=[(26 / 255, 172 / 255, 236 / 255, 1),
                (253 / 255, 126 / 255, 30 / 255, 1),
                (35 / 255, 255 / 255, 41 / 255, 1)],
        save_path=os.path.join(os.path.dirname(__file__), 'players.png'),
        need_show=False)

    multi_bar_with_error(
        labels=['Greedy', 'MinMax', 'RL'],
        x_groups=['Greedy', 'MinMax', 'RL'],
        y_list=[[50, 97, 99], [3, 50, 72], [1, 28, 50]],
        error=[[0, 0, 0], [0, 0, 0], [0, 0, 0]],
        y_range_axis=(0, 100),
        x_name='AI agent',
        y_name='Wins Percent',
        colors=[(26 / 255, 172 / 255, 236 / 255, 1),
                (253 / 255, 126 / 255, 30 / 255, 1),
                (35 / 255, 255 / 255, 41 / 255,1)],
        save_path=os.path.join(os.path.dirname(__file__), 'agents.png'),
        need_show=False)


if __name__ == '__main__':
    plot_paper_graph()
