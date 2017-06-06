from django.conf.urls import patterns, include, url
from django.contrib import admin


urlpatterns = patterns('',
    url(r'^$', 'contactmps.views.home', name='home'),
    url(r'^embed.html$', 'contactmps.views.embed', name='embed-info'),
    url(r'^campaign/noconfidence/$', 'contactmps.views.create_mail', name='noconfidence'),
    url(r'^email/$', 'contactmps.views.email', name='email'),
    url(r'^email/(?P<uuid>[\a-z0-0-]+)/$', 'contactmps.views.email_detail', name='email-detail'),

    url(r'^admin/', include(admin.site.urls)),

    url(r'^robots.txt$', 'contactmps.views.robots'),
)
