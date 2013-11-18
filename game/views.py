from django import http
from django.shortcuts import render
from django.core import serializers

from game.models import Player, Game, Unit, create_game


def game(request):
    #player = Player.objects.all()[0]
    #create_game(player)
    context = {'game': Game.objects.all()[0]}
    return render(request, 'game/game.html', context)


def load_game(request):
    units = Game.objects.all()[0].map_set.all()[0].unit_set.all()
    data = serializers.serialize('json', units, use_natural_keys=True)
    return http.HttpResponse(data, content_type='application/json')


def move_unit(request):
    pk = int(request.GET['pk'])
    left = int(request.GET['left'])
    top = int(request.GET['top'])
    unit = Unit.objects.get(pk=pk)
    unit.left = left
    unit.top = top
    unit.save()
    units = Game.objects.all()[0].map_set.all()[0].unit_set.all()
    data = serializers.serialize('json', units, use_natural_keys=True)
    return http.HttpResponse(data, content_type='application/json')