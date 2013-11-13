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

    field = Field(game=game)
    field.save()

    cell = create_cell(field, 3, 2)

    create_unit(cell, player, UnitType.settler)

    return game


class Field(models.Model):
    game = models.ForeignKey(Game)
    height = models.IntegerField(default=10)
    width = models.IntegerField(default=5)

    def __unicode__(self):
        return "height: " + str(self.height) + " width: " + str(self.width)


class Cell(models.Model):
    field = models.ForeignKey(Field)
    left_position = models.IntegerField()
    top_position = models.IntegerField()

    def natural_key(self):
        return self.left_position, self.top_position


def create_cell(field, left, top):
    cell = Cell(field=field)
    cell.left_position = left
    cell.top_position = top
    cell.save()
    return cell


class UnitType(Enum):
    settler = 1
    militiaman = 2
    scout = 3
    officer = 4
    dragoon = 5


class Unit(models.Model):
    cell = models.ForeignKey(Cell)
    player = models.ForeignKey(Player)
    unit_type = models.IntegerField()


def create_unit(cell, player, unit_type):
    unit = Unit(cell=cell, player=player)
    unit.unit_type = UnitType(unit_type).value
    unit.save()
    return unit