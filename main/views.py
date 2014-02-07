from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.core import serializers
from django.http import HttpResponse
from django.shortcuts import render
import operator
from game.models import get_active_game, get_host_games, get_player, Game


class UserScores:
    def __init__(self, name, score, is_current_user):
        self.name = name
        self.score = score
        self.is_current_user = is_current_user


def home(request):
    user_scores = []
    users = User.objects.all()
    for user in users:
        score = get_user_score(user)
        if request.user == user:
            user_scores.append(UserScores(name=user.first_name + " " + user.last_name,
                                          score=score, is_current_user=True))
        else:
            user_scores.append(UserScores(name=user.first_name + " " + user.last_name,
                                          score=score, is_current_user=False))
    user_scores.sort(key=operator.attrgetter('score'))
    user_scores.sort(key=operator.attrgetter('is_current_user'))
    user_scores.reverse()
    user_scores = user_scores[0:5]
    user_scores.sort(key=operator.attrgetter('score'))
    user_scores.reverse()

    if request.user.is_authenticated() and get_player(request.user) is not None and get_active_game(request.user):
        return render(request, 'home.html',
                      {'game': get_active_game(request.user), 'user_scores': user_scores})
    else:
        return render(request, 'home.html', {'host_games': get_host_games(), 'user_scores': user_scores})


@login_required
def get_hosts(request):
    hosts = Game.objects.filter(state=0)
    hosts = serializers.serialize('json', hosts, use_natural_keys=True)
    return HttpResponse(hosts, content_type='application/json')


def get_user_score(user):
    return Game.objects.all().filter(winner=user).count() - Game.objects.all().filter(looser=user).count()