from django.conf.urls import patterns, url

from game import views

urlpatterns = patterns('',
    # ex: /game/
    url(r'^$', views.game, name='game'),
    url(r'^load_game/', views.load_game, name='load'),
)