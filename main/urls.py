from django.conf.urls import patterns, url, include
from main import views


urlpatterns = patterns('',
    url(r'', include('social_auth.urls')),
    url(r'^$', views.home),
    url(r'^game/', include('game.urls')),
    url(r'^ajax/', include('ajax.urls')),
)