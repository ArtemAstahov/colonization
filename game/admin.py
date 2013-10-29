from django.contrib import admin
from game.models import Game


class GameInline(admin.StackedInline):
    model = Game
    extra = 3

admin.site.register(GameInline)