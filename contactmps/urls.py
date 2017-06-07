from django.conf.urls import include, url
from django.contrib import admin
from contactmps import views


urlpatterns = [
    url(r'^$', views.home, name='home'),
    url(r'^embed.html$', views.embed, name='embed-info'),
    url(r'^campaign/noconfidence/$', views.create_mail, name='noconfidence'),
    url(r'^email/$', views.email, name='email'),
    url(r'^email/(?P<secure_id>[\a-z0-0-]+)/$', views.email_detail, name='email-detail'),

    url(r'^admin/', include(admin.site.urls)),

    url(r'^robots.txt$', views.robots),
]
