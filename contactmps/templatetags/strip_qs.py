from django import template
from urlparse import urlparse, urlunparse

register = template.Library()


@register.filter
def strip_qs(url):
    u = urlparse(url)
    u = u._replace(query={})
    return urlunparse(u)
