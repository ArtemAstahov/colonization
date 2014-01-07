from django.shortcuts import render
from game.models import is_created_game, get_active_game, get_host_games


def home(request):
    if request.user.is_authenticated() and is_created_game(request.user):
        return render(request, 'home.html', {'game': get_active_game(request.user)})
    else:
        return render(request, 'home.html', {'host_games': get_host_games()})