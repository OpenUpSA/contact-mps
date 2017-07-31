from django import template

register = template.Library()


@register.filter
def portrait_url(url):
    return '/static/images/portraits/' + url[39:]
