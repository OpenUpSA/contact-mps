from django.conf.urls import patterns, include, url
from django.contrib import admin
from django.views.generic.base import TemplateView

urlpatterns = patterns('',
    url(r'^$', TemplateView.as_view(template_name="index.html"), name='home'),
    url(r'^embed.html$', TemplateView.as_view(template_name="embed.html"), name='embed-info'),
    url(r'^campaign/noconfidence/$', 'contactmps.views.create_mail', name='noconfidence'),
    url(r'^email/$', 'contactmps.views.email', name='email'),
    url(r'^email/(?P<uuid>[\a-z0-0-]+)$', 'contactmps.views.email_detail', name='email-detail'),

    url(r'^admin/', include(admin.site.urls)),

    url(r'^robots.txt$', 'contactmps.views.robots'),
)
