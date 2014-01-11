from django.shortcuts import render
from game.models import get_active_game, get_host_games, get_player


def home(request):
    if request.user.is_authenticated() and get_player(request.user) is not None and get_active_game(request.user):
        return render(request, 'home.html', {'game': get_active_game(request.user)})
    else:
        return render(request, 'home.html', {'host_games': get_host_games()})