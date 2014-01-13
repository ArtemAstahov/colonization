from django.conf.urls import patterns, url

from game import views

urlpatterns = patterns('',
    url(r'^$', views.game),
    url(r'^create_game', views.create_game),
    url(r'^join_to_game', views.join_to_game),
)