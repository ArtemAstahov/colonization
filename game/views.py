from django import http
from django.shortcuts import render
from django.core import serializers

from game.models import Game, Unit, create_game


def game(request):
    #create_game('ilya')
    context = {'game': Game.objects.get(pk=1)}
    return render(request, 'game/game.html', context)


def load_units(request):
    units = Game.objects.get(pk=1).map_set.all()[0].unit_set.all()
    data = serializers.serialize('json', units, use_natural_keys=True)
    return http.HttpResponse(data, content_type='application/json')


def load_settlements(request):
    settlements = Game.objects.get(pk=1).map_set.all()[0].settlement_set.all()
    data = serializers.serialize('json', settlements, use_natural_keys=True)
    return http.HttpResponse(data, content_type='application/json')


def move_unit(request):
    pk = int(request.GET['pk'])
    left = int(request.GET['left'])
    top = int(request.GET['top'])
    unit = Unit.objects.get(pk=pk)
    unit.left = left
    unit.top = top
    unit.save()
    unit = Unit.objects.filter(pk=pk)
    data = serializers.serialize('json', unit, use_natural_keys=True)
    return http.HttpResponse(data, content_type='application/json')