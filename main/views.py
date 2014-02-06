from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.core import serializers
from django.http import HttpResponse
from django.shortcuts import render
import operator
from game.models import get_active_game, get_host_games, get_player, Game


class UserScores:
    def __init__(self, name, score):
        self.name = name
        self.score = score


def home(request):
    host_scores = []
    users = User.objects.all()
    for user in users:
        score = get_user_score(user)
        host_scores.append(UserScores(name=user.username, score=score))
    host_scores.sort(key=operator.attrgetter('score'))
    host_scores.reverse()

    if request.user.is_authenticated() and get_player(request.user) is not None and get_active_game(request.user):
        return render(request, 'home.html',
                      {'game': get_active_game(request.user), 'user_scores': host_scores[0:5]})
    else:
        return render(request, 'home.html', {'host_games': get_host_games(), 'user_scores': host_scores[0:5]})


@login_required
def get_hosts(request):
    hosts = Game.objects.filter(state=0)
    hosts = serializers.serialize('json', hosts, use_natural_keys=True)
    return HttpResponse(hosts, content_type='application/json')


def get_user_score(user):
    return Game.objects.all().filter(winner=user).count() - Game.objects.all().filter(looser=user).count()