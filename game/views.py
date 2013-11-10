from django import http
from django.shortcuts import render
from django.core import serializers

from game.models import Player, Game
from game.models import create_game


def game(request):
    player = Player.objects.all()[0]
    context = {'game': create_game(player)}
    return render(request, 'game/game.html', context)


def load(request):
    data = serializers.serialize('json', Game.objects.all())
    return http.HttpResponse(data, content_type='application/json')