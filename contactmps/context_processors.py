from django.conf import settings
from django.contrib.sites.shortcuts import get_current_site


def general(request):
    """ Add some useful settings into the template helpers.
    """

    info = {
        'BASE_URL': "https://%s" % get_current_site(request).domain,
    }

    ga_tracking_id = getattr(settings, 'GOOGLE_ANALYTICS_ID', False)
    if not settings.DEBUG and ga_tracking_id:
        info['GOOGLE_ANALYTICS_ID'] = ga_tracking_id
    return info


def is_mobile(request):
    useragent = request.META.get('HTTP_USER_AGENT', '').lower()
    mobiles = [
        'ipad',
        'ipod',
        'iphone',
        'android',
        'blackberry',
    ]
    return {
        'is_mobile': any(mobile in useragent for mobile in mobiles),
    }
