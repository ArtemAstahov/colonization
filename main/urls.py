from django.conf.urls import patterns, url, include
from main import views


urlpatterns = patterns('',
    url(r'^$', views.home),
    url(r'^game/', include('game.urls')),
    url(r'^ajax/', include('ajax.urls')),
    url(r'^accounts/', include('accounts.urls')),
)