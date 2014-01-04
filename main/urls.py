from django.conf.urls import patterns, url, include
from django.shortcuts import render
from game.models import is_created_game, get_active_game, get_host_game


def home(request):
    if request.user.is_authenticated() and is_created_game(request.user):
        return render(request, 'game/home.html', {'game': get_active_game(request.user)})
    else:
        return render(request, 'game/home.html', {'host_game': get_host_game()})


urlpatterns = patterns('',
    url(r'^$', home),
    url(r'^game/', include('game.urls')),
    url(r'^ajax/', include('ajax.urls')),
    url(r'^accounts/', include('accounts.urls')),
)