from random import randint
from django.contrib.auth.models import User
from django.db import models
from django.db.models import Sum

from django.utils import timezone


GAME_STATE = {
    0: 'CREATED',
    1: 'STARTED',
    2: 'FINISHED'
}


class Game(models.Model):
    state = models.IntegerField(default=0)
    winner = models.ForeignKey(User, related_name='winner', null=True)
    looser = models.ForeignKey(User, related_name='looser', null=True)
    creation_date = models.DateTimeField(default=timezone.now())


def create_game(user):
    game = Game()
    game.save()

    player = create_player(user, game, "red")
    player.active = False
    player.save()

    game_map = Map(game=game)
    game_map.save()

    create_unit(game_map, 3, 2, player, 1, False)

    return game


def get_active_game(user):
    return Player.objects.filter(user=user).first().game


def is_created_game(user):
    return Player.objects.filter(user=user).exists()


def get_game(game_pk):
    return Game.objects.get(pk=game_pk)


def get_host_games():
    return Game.objects.filter(state=0).all()


def join_to_game(user, game_id):
    game = get_game(game_id)
    player = create_player(user, game, "blue")
    player.active = True
    player.save()
    game_map = game.map_set.all().first()
    create_unit(game_map, 15, 10, player, 1, True)
    game.state = 1
    game.save()


def finish_game(winner, looser):
    winner.player_set.all().delete()
    looser.player_set.all().delete()
    game = Game(winner=winner, looser=looser)
    game.state = 2
    game.save()


class Player(models.Model):
    user = models.ForeignKey(User)
    game = models.ForeignKey(Game)
    money = models.IntegerField(default=10)
    color = models.CharField(max_length=100)
    active = models.BooleanField(default=True)

    def increase_money_for_day(self):
        aggregate = Settlement.objects.filter(player=self.pk).aggregate(Sum('settlement_type'))
        if aggregate['settlement_type__sum'] is not None:
            self.money = self.money + aggregate['settlement_type__sum']

    def is_lost(self):
        if not Unit.objects.filter(player=self).exists() and not Settlement.objects.filter(player=self).exists():
            return True
        else:
            return False


def create_player(user, game, color):
    player = Player(game=game, color=color, user=user)
    player.save()
    return player


def get_player(user):
    return Player.objects.filter(user=user).first()


def get_opponent(user):
    return Player.objects.filter(game=get_active_game(user)).exclude(user=user).first()


class Map(models.Model):
    game = models.ForeignKey(Game)
    height = models.IntegerField(default=10)
    width = models.IntegerField(default=5)


def get_game_map(user):
    return get_active_game(user).map_set.all().first()


UNIT_TYPE = {
    1: {'name': 'Settlers', 'steps': 1, 'damage': 0, 'cost': 10},
    2: {'name': 'Militiaman', 'steps': 1, 'damage': 1, 'cost': 2},
    3: {'name': 'Scout', 'steps': 2, 'damage': 1, 'cost': 4},
    4: {'name': 'Officer', 'steps': 1, 'damage': 2, 'cost': 4},
    5: {'name': 'Dragoon', 'steps': 2, 'damage': 2, 'cost': 6}
}


class Unit(models.Model):
    map = models.ForeignKey(Map)
    left = models.IntegerField()
    top = models.IntegerField()
    player = models.ForeignKey(Player)
    unit_type = models.IntegerField()
    active = models.BooleanField(default=True)


def create_unit(game_map, left, top, player, unit_type, active):
    unit = Unit(map=game_map, left=left, top=top, player=player, unit_type=unit_type, active=active)
    unit.save()
    return unit


def fight(unit, opponent_unit):
    settlement = Settlement.objects.filter(map=unit.map, left=opponent_unit.left, top=opponent_unit.top).first()
    result = randint(0, 5) + UNIT_TYPE[unit.unit_type]['damage'] - randint(0, 5) - UNIT_TYPE[
        opponent_unit.unit_type]['damage']
    if settlement is not None:
        result -= SETTLEMENT_TYPE[settlement.settlement_type]['defense']
    if result == 0:
        return fight(unit, opponent_unit)
    return result > 0


SETTLEMENT_TYPE = {
    1: {'name': 'Colony', 'income': 1, 'defense': 0},
    2: {'name': 'Fort', 'income': 2, 'defense': 1},
    3: {'name': 'Castle', 'income': 3, 'defense': 2}
}


class Settlement(models.Model):
    map = models.ForeignKey(Map)
    left = models.IntegerField()
    top = models.IntegerField()
    player = models.ForeignKey(Player)
    settlement_type = models.IntegerField()
    active = models.BooleanField(default=True)


def check_margins(game_map, left, top):
    return not Settlement.objects.filter(map=game_map, left__gt=left - 4, left__lt=left + 4,
                                         top__gt=top - 4, top__lt=top + 4).exists()


def create_settlement(game_map, left, top, player, settlement_type, active):
    settlement = \
        Settlement(map=game_map, left=left, top=top, player=player, settlement_type=settlement_type, active=active)
    settlement.save()
    return settlement