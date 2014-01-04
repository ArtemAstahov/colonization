from django.conf.urls import patterns, url

from ajax import views

urlpatterns = patterns('',
    url(r'^load_units', views.load_units),
    url(r'^load_settlements', views.load_settlements),
    url(r'^load_player', views.load_player),
    url(r'^move_unit', views.move_unit),
    url(r'^finish_stroke', views.finish_stroke),
    url(r'^buy_unit', views.buy_unit),
    url(r'^upgrade_settlement', views.upgrade_settlement),
    url(r'^check_settlement_active', views.check_settlement_active),
    url(r'^create_colony', views.create_colony),
    url(r'^check_settlements_margins', views.check_settlements_margins),
)