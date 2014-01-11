from django.contrib.auth.decorators import login_required
from django.core import serializers
from django.http import HttpResponse
from django.shortcuts import render
from game.models import get_active_game, get_host_games, get_player, Game


def home(request):
    if request.user.is_authenticated() and get_player(request.user) is not None and get_active_game(request.user):
        return render(request, 'home.html', {'game': get_active_game(request.user)})
    else:
        return render(request, 'home.html', {'host_games': get_host_games()})


@login_required
def get_hosts(request):
    hosts = Game.objects.filter(state=0)
    hosts = serializers.serialize('json', hosts, use_natural_keys=True)
    return HttpResponse(hosts, content_type='application/json')