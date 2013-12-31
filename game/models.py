from django.contrib.auth.models import User
from django.db import models
from django.db.models import Sum

from django.utils import timezone


class Game(models.Model):
    user = models.ForeignKey(User)
    creation_date = models.DateTimeField(default=timezone.now())


def create_game(user):
    game = Game(user=user)
    game.save()

    player = create_player(game, "red")

    game_map = Map(game=game)
    game_map.save()

    create_unit(game_map, 3, 2, player, 1, True)
    create_unit(game_map, 1, 5, player, 2, True)
    create_unit(game_map, 7, 4, player, 3, True)
    create_unit(game_map, 3, 2, player, 4, True)
    create_unit(game_map, 1, 1, player, 5, True)

    create_settlement(game_map, 3, 3, player, 1, True)
    create_settlement(game_map, 4, 5, player, 2, True)
    create_settlement(game_map, 6, 3, player, 3, True)

    return game


class Player(models.Model):
    game = models.ForeignKey(Game)
    money = models.IntegerField(default=10)
    color = models.CharField(max_length=100)
    active = models.BooleanField(default=True)

    def increase_money_for_day(self):
        aggregate = Settlement.objects.filter(player=self.pk).aggregate(Sum('settlement_type'))
        self.money = self.money + aggregate['settlement_type__sum']


def create_player(game, color):
    player = Player(game=game, color=color)
    player.save()
    return player


class Map(models.Model):
    game = models.ForeignKey(Game)
    height = models.IntegerField(default=10)
    width = models.IntegerField(default=5)

    def __unicode__(self):
        return "height: " + str(self.height) + " width: " + str(self.width)


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


def check_margins(left, top):
    return Settlement.objects.filter(left__gt=left-4, left__lt=left+4, top__gt=top-4, top__lt=top+4).count() == 0


def create_settlement(game_map, left, top, player, settlement_type, active):
    settlement =\
        Settlement(map=game_map, left=left, top=top, player=player, settlement_type=settlement_type, active=active)
    settlement.save()
    return settlement