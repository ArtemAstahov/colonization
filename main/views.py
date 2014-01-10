from django.http import HttpResponseRedirect
from django.shortcuts import render
from game.models import is_created_game, get_active_game, get_host_games, get_player


def home(request):
    if request.user.is_authenticated() and get_player(request.user) is not None and get_active_game(request.user):
        return render(request, 'home.html', {'game': get_active_game(request.user)})
    else:
        return render(request, 'home.html', {'host_games': get_host_games()})


def game_required(function):
    def check(request):
        if request.user.is_authenticated() and is_created_game(request.user):
            return function(request)
        else:
            return HttpResponseRedirect("/")
    return check