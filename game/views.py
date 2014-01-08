from django.contrib.auth.decorators import login_required
from django.http import HttpResponseRedirect
from django.shortcuts import render
from game import models
from main.views import game_required


@login_required
@game_required
def game(request):
    return render(request, 'game/game.html')


@login_required()
def create_game(request):
    models.create_game(request.user)
    return HttpResponseRedirect("/game")


@login_required()
def join_to_game(request):
    models.join_to_game(request.user, request.GET.get('pk'))
    return HttpResponseRedirect("/game")