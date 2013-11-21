from django.conf.urls import patterns, url

from game import views

urlpatterns = patterns('',
    # ex: /game/
    url(r'^$', views.game, name='game'),
    url(r'^load_units', views.load_units, name='load_units'),
    url(r'^load_settlements', views.load_settlements, name='load_settlements'),
    url(r'^move_unit', views.move_unit, name='move_unit'),
    url(r'^finish_stroke', views.finish_stroke, name='finish_stroke'),
)