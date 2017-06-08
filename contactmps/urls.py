from django.conf.urls import include, url
from django.contrib import admin
from contactmps import views


urlpatterns = [
    url(r'^$', views.home, name='home'),
    url(r'^embed.html$', views.embed, name='embed-info'),
    url(r'^campaign/noconfidence/$', views.create_mail, name='noconfidence'),
    url(r'^email/$', views.email, name='email'),
    url(r'^email/(?P<secure_id>[a-z0-9-]+)/$', views.email_detail, name='email-detail'),

    # UTM - This rather strict regex is part of ensuring we don't let people just
    # inject what they like into a response we give. Think before changing.
    url(r'^campaign/noconfidence/(?P<utm_medium>[a-z]{2})/$', views.add_utm, name='noconfidence-add-utm'),
    url(r'^email/[a-z0-9-]+/(?P<utm_medium>[a-z]{2})/$', views.add_utm, name='email-add-utm'),

    url(r'^admin/', include(admin.site.urls)),

    url(r'^robots.txt$', views.robots),
]
