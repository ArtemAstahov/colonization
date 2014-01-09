import json
from django import http
from django.core import serializers
from django.http import HttpResponse, HttpResponseBadRequest, HttpResponseRedirect
from game import models
from game.models import Unit, Player, create_unit, Settlement, UNIT_TYPE, create_settlement,\
    SETTLEMENT_TYPE, check_margins, get_game_map, get_player, get_opponent, fight, finish_game, get_active_game
from main.views import game_required


@game_required
def load_game(request):
    game = models.Game.objects.filter(pk=get_active_game(request.user).pk)

    player = Player.objects.filter(user=request.user)
    units = player.first().unit_set.all()
    units = serializers.serialize('json', units, use_natural_keys=True)
    settlements = player.first().settlement_set.all()
    settlements = serializers.serialize('json', settlements, use_natural_keys=True)

    opponent = Player.objects.filter(game=game.first()).exclude(user=request.user)
    opponent_units = opponent.first().unit_set.all()
    opponent_units = serializers.serialize('json', opponent_units, use_natural_keys=True)
    opponent_settlements = opponent.first().settlement_set.all()
    opponent_settlements = serializers.serialize('json', opponent_settlements, use_natural_keys=True)

    game = serializers.serialize('json', game, use_natural_keys=True)
    player = serializers.serialize('json', player, use_natural_keys=True)
    opponent = serializers.serialize('json', opponent, use_natural_keys=True)

    data = {'game': game, 'player': player, 'units': units, 'settlements': settlements, 'opponent': opponent,
            'opponent_units': opponent_units, 'opponent_settlements': opponent_settlements}
    data = json.dumps(data)
    return HttpResponse(data, content_type='application/json')


@game_required
def load_units(request):
    units = get_player(request.user).unit_set.all()
    data = serializers.serialize('json', units, use_natural_keys=True)
    return HttpResponse(data, content_type='application/json')


@game_required
def load_opponent_units(request):
    if not get_opponent(request.user):
        return HttpResponse()

    player = get_player(request.user)
    opponent_units = get_opponent(request.user).unit_set.all()
    shown_opponents_units = []
    for unit in opponent_units:
        if Unit.objects.filter(player=player, left__gt=unit.left-4, left__lt=unit.left+4, top__gt=unit.top-4,
                               top__lt=unit.top+4).exists():
            shown_opponents_units.append(unit)

    data = serializers.serialize('json', shown_opponents_units, use_natural_keys=True)
    return HttpResponse(data, content_type='application/json')


@game_required
def load_settlements(request):
    settlements = get_player(request.user).settlement_set.all()
    data = serializers.serialize('json', settlements, use_natural_keys=True)
    return HttpResponse(data, content_type='application/json')


@game_required
def load_opponent_settlements(request):
    if not get_opponent(request.user):
        return HttpResponse()

    player = get_player(request.user)
    opponent_settlements = get_opponent(request.user).settlement_set.all()
    shown_opponents_settlements = []
    for settlement in opponent_settlements:
        if Unit.objects.filter(player=player, left__gt=settlement.left-4, left__lt=settlement.left+4,
                               top__gt=settlement.top-4, top__lt=settlement.top+4).exists():
            shown_opponents_settlements.append(settlement)
    data = serializers.serialize('json', shown_opponents_settlements, use_natural_keys=True)
    return HttpResponse(data, content_type='application/json')


@game_required
def load_player(request):
    data = serializers.serialize('json', Player.objects.filter(user=request.user), use_natural_keys=True)
    return HttpResponse(data, content_type='application/json')


@game_required
def move_unit(request):
    pk = int(request.GET['pk'])
    unit = Unit.objects.get(pk=pk)
    if not unit.active:
        return http.HttpResponseBadRequest()
    unit.active = False
    left = int(request.GET['left'])
    top = int(request.GET['top'])

    opponent_units = get_opponent(request.user).unit_set.all().filter(left=left, top=top)
    opponent_unit = opponent_units.first()
    if opponent_units.exists():
        if fight(unit, opponent_unit):
            unit.save()
            opponent_unit.delete()
        else:
            unit.delete()
    else:
        opponent_settlement = Settlement.objects.all().filter(left=left, top=top).first()
        if opponent_settlement is not None:
            opponent_settlement.player = get_player(request.user)
            opponent_settlement.save()
        unit.left = left
        unit.top = top
        unit.save()

    unit = Unit.objects.filter(pk=pk)
    data = serializers.serialize('json', unit, use_natural_keys=True)
    return HttpResponse(data, content_type='application/json')


@game_required
def finish_stroke(request):
    player = get_player(request.user)
    opponent = get_opponent(request.user)

    if player.is_lost():
        finish_game(opponent.user, player.user)
        return HttpResponseRedirect("/")

    if opponent.is_lost():
        finish_game(player.user, opponent.user)
        return HttpResponseRedirect("/")

    player.active = False
    player.save()
    Unit.objects.filter(player=player).update(active=False)
    Settlement.objects.filter(player=player).update(active=False)

    opponent.increase_money_for_day()
    opponent.active = True
    opponent.save()

    Unit.objects.filter(player=opponent).update(active=True)
    Settlement.objects.filter(player=opponent).update(active=True)
    return HttpResponse()


@game_required
def buy_unit(request):
    settlement = Settlement.objects.get(pk=int(request.GET['settlement_pk']))
    if not settlement.active:
        return HttpResponseBadRequest()

    player = Player.objects.filter(user=request.user).first()
    unit_type = int(request.GET['type'])
    money = player.money
    cost = UNIT_TYPE[unit_type]['cost']

    if money < cost:
        return HttpResponseBadRequest()

    player.money = money - cost
    game_map = get_game_map(request.user)
    unit = create_unit(game_map, settlement.left, settlement.top, player, unit_type, False)
    settlement.active = False
    settlement.save()
    player.save()
    unit_set = Unit.objects.filter(pk=unit.pk)
    data = serializers.serialize('json', unit_set, use_natural_keys=True)
    return HttpResponse(data, content_type='application/json')


@game_required
def upgrade_settlement(request):
    settlement = Settlement.objects.get(pk=int(request.GET['settlement_pk']))
    if not settlement.active:
        return HttpResponseBadRequest()

    player = Player.objects.filter(user=request.user).first()
    settlement_type = int(request.GET['type'])
    money = player.money
    settlement_upgrade_cost = 15

    if money < settlement_upgrade_cost or settlement_type > len(SETTLEMENT_TYPE):
        return HttpResponseBadRequest()

    player.money = money - settlement_upgrade_cost
    settlement.settlement_type = settlement_type
    settlement.active = False
    settlement.save()
    player.save()
    settlement_set = Settlement.objects.filter(pk=settlement.pk)
    data = serializers.serialize('json', settlement_set, use_natural_keys=True)
    return HttpResponse(data, content_type='application/json')


@game_required
def check_settlement_active(request):
    settlement = Settlement.objects.get(pk=int(request.GET['pk']))
    return HttpResponse(json.dumps({'active': settlement.active}), mimetype="application/json")


@game_required
def check_settlements_margins(request):
    unit = Unit.objects.get(pk=int(request.GET['pk']))
    return HttpResponse(json.dumps({'available': check_margins(get_game_map(request.user), unit.left, unit.top)}),
                        mimetype="application/json")


@game_required
def create_colony(request):
    settler_type = 1
    unit = Unit.objects.get(pk=int(request.GET['pk']))
    if not unit and unit.unit_type == settler_type:
        return HttpResponseBadRequest

    if not check_margins(get_game_map(request.user), unit.left, unit.top):
        return HttpResponseBadRequest

    colony_type = 1
    settlement = create_settlement(unit.map, unit.left, unit.top, unit.player, colony_type, False)
    Unit.objects.filter(pk=unit.pk).delete()
    settlement = Settlement.objects.filter(pk=settlement.pk)
    data = serializers.serialize('json', settlement, use_natural_keys=True)
    return HttpResponse(data, content_type='application/json')
