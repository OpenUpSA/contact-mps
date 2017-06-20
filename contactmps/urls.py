from django.conf.urls import include, url
from django.contrib import admin
from django.views.decorators.cache import cache_page
from contactmps import views

# Used to cache expensive API calls, since it's fine to show same results for
# a few minutes.  This cache is reset on each deployment. Corresponding caching
# headers are sent to the client, too.
API_CACHE_SECS = 5 * 60

urlpatterns = [
    url(r'^$', views.home, name='home'),
    url(r'^embed.html$', views.embed, name='embed-info'),
    url(r'^campaign/noconfidence/$', cache_page(API_CACHE_SECS)(views.create_mail),
        {'template': 'campaigns/newsmedia.html'}, name='noconfidence'),
    url(r'^email/$', views.email, name='email'),
    url(r'^email/(?P<secure_id>[a-z0-9-]+)/$', cache_page(API_CACHE_SECS)(views.email_detail), name='email-detail'),

    # UTM - This rather strict regex is part of ensuring we don't let people just
    # inject what they like into a response we give. Think before changing.
    url(r'^campaign/noconfidence/(?P<utm_medium>[a-z]{2})/$', views.add_utm, name='noconfidence-add-utm'),
    url(r'^email/[a-z0-9-]+/(?P<utm_medium>[a-z]{2})/$', views.add_utm, name='email-add-utm'),

    url(r'^admin/', include(admin.site.urls)),

    url(r'^robots.txt$', views.robots),
]
