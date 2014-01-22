from django.conf.urls import patterns, url, include


urlpatterns = patterns('',
    url(r'^$', include('social_auth.urls')),
    url(r'^game/', include('game.urls')),
    url(r'^ajax/', include('ajax.urls')),
)