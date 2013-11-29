import json
from django import http
from django.shortcuts import render
from django.core import serializers

from game.models import Game, Unit, create_game, Player, create_unit, Settlement, Map, UNIT_TYPE, create_settlement


def game(request):
    if not Game.objects.all().count():
        create_game('ilya')
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


def load_player(request):
    pk = int(request.GET['pk'])
    player = Game.objects.get(pk=1).player_set.filter(pk=pk)
    data = serializers.serialize('json', player, use_natural_keys=True)
    return http.HttpResponse(data, content_type='application/json')


def move_unit(request):
    pk = int(request.GET['pk'])
    unit = Unit.objects.get(pk=pk)
    if not unit.active:
        return http.HttpResponseBadRequest()
    left = int(request.GET['left'])
    top = int(request.GET['top'])
    unit.left = left
    unit.top = top
    unit.active = False
    unit.save()
    unit = Unit.objects.filter(pk=pk)
    data = serializers.serialize('json', unit, use_natural_keys=True)
    return http.HttpResponse(data, content_type='application/json')


def finish_stroke(request):
    player_pk = int(request.GET['player'])
    player = Player.objects.get(pk=player_pk)
    player.increase_money_for_day()
    player.save()
    Unit.objects.filter(player=player_pk).update(active=True)
    Settlement.objects.filter(player=player_pk).update(active=True)
    return http.HttpResponse()


def buy_unit(request):
    settlement = Settlement.objects.get(pk=int(request.GET['settlement_pk']))
    if not settlement.active:
        return http.HttpResponse()

    player = Player.objects.get(pk=int(request.GET['player']))
    unit_type = int(request.GET['type'])
    money = player.money
    cost = UNIT_TYPE[unit_type]['cost']

    if money < cost:
        return http.HttpResponseBadRequest()

    player.money = money - cost
    game_map = Map.objects.get(pk=int(request.GET['map']))
    unit = create_unit(game_map, settlement.left, settlement.top, player, unit_type, False)
    settlement.active = False
    settlement.save()
    player.save()
    unit_set = Unit.objects.filter(pk=unit.pk)
    data = serializers.serialize('json', unit_set, use_natural_keys=True)
    return http.HttpResponse(data, content_type='application/json')


def check_settlement_active(request):
    settlement = Settlement.objects.get(pk=int(request.GET['pk']))
    return http.HttpResponse(json.dumps({'active': settlement.active}), mimetype="application/json")


def create_colony(request):
    settlers_type = 1
    unit = Unit.objects.get(pk=int(request.GET['pk']))
    if not unit and unit.unit_type == settlers_type:
        return http.HttpResponseBadRequest

    colony_type = 1
    settlement = create_settlement(unit.map, unit.left, unit.top, unit.player, colony_type, False)
    Unit.objects.filter(pk=unit.pk).delete()
    settlement = Settlement.objects.filter(pk=settlement.pk)
    data = serializers.serialize('json', settlement, use_natural_keys=True)
    return http.HttpResponse(data, content_type='application/json')