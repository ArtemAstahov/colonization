from django.conf.urls import patterns, url

from game import views

urlpatterns = patterns('',
    # ex: /game/
    url(r'^$', views.game, name='game'),
    url(r'^load_units', views.load_units, name='load_units'),
    url(r'^load_settlements', views.load_settlements, name='load_settlements'),
    url(r'^load_player', views.load_player, name='load_player'),
    url(r'^move_unit', views.move_unit, name='move_unit'),
    url(r'^finish_stroke', views.finish_stroke, name='finish_stroke'),
    url(r'^buy_unit', views.buy_unit, name='buy_unit'),
    url(r'^check_settlement_active', views.check_settlement_active, name='check_settlement_active'),
    url(r'^create_colony', views.create_colony, name='create_colony'),
)