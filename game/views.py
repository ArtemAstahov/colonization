from django import http
from django.shortcuts import render
from django.core import serializers

from game.models import Game


def game(request):
    context = {'game': Game.objects.all()[5]}
    return render(request, 'game/game.html', context)


def load_game(request):
    units = Game.objects.all()[5].map_set.all()[0].unit_set.all()
    data = serializers.serialize('json', units, use_natural_keys=True)
    return http.HttpResponse(data, content_type='application/json')


def move_unit(request):
    units = Game.objects.all()[5].map_set.all()[0].unit_set.all()
    data = serializers.serialize('json', units, use_natural_keys=True)
    return http.HttpResponse(data, content_type='application/json')