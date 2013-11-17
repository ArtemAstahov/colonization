from enum import Enum
from django.db import models

from django.utils import timezone


class Player(models.Model):
    name = models.CharField(max_length=100)
    money = models.IntegerField(default=10)

    def __unicode__(self):
        return "name: " + self.name + " money: " + str(self.money)


def create_player(name):
    player = Player(name=name)
    player.save()
    return player


class Game(models.Model):
    player = models.ForeignKey(Player)
    creation_date = models.DateTimeField(default=timezone.now())


def create_game(player):
    game = Game(player=player)
    game.save()

    game_map = Map(game=game)
    game_map.save()

    create_unit(game_map, 3, 2, player, UnitType.settler)
    create_unit(game_map, 1, 5, player, UnitType.settler)
    create_unit(game_map, 7, 4, player, UnitType.settler)
    create_unit(game_map, 3, 2, player, UnitType.settler)

    return game


class Map(models.Model):
    game = models.ForeignKey(Game)
    height = models.IntegerField(default=10)
    width = models.IntegerField(default=5)

    def __unicode__(self):
        return "height: " + str(self.height) + " width: " + str(self.width)

"""
class Field(models.Model):
    map = models.ForeignKey(Map)
    left_position = models.IntegerField()
    top_position = models.IntegerField()

    def natural_key(self):
        return self.left_position, self.top_position


def create_field(game_map, left, top):
    filed = Field(map=game_map, left_position=left, top_position=top)
    filed.save()
    return filed
"""


class UnitType(Enum):
    settler = 1
    militiaman = 2
    scout = 3
    officer = 4
    dragoon = 5


class Unit(models.Model):
    map = models.ForeignKey(Map)
    left = models.IntegerField()
    top = models.IntegerField()
    player = models.ForeignKey(Player)
    unit_type = models.IntegerField()


def create_unit(game_map, left, top, player, unit_type):
    unit = Unit(map=game_map, left=left, top=top, player=player)
    unit.unit_type = UnitType(unit_type).value
    unit.save()
    return unit