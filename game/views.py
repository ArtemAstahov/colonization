from django.shortcuts import render

from game.models import Player
from game.models import create_game


def game(request):

    player = Player.objects.all()[0]
    context = {'game': create_game(player)}
    return render(request, 'game/game.html', context)