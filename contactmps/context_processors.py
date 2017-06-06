import urllib

from django.conf import settings
from django.core.urlresolvers import reverse


def general(request):
    """ Add some useful settings into the template helpers.
    """

    info = {
        'SITE_NAME': 'Contact Members of Parliament',
        'SITE_DESCRIPTION': "You have the opportunity to lobby Members of Parliament. Just because South Africa has a proportional representation electoral system for provincial and national government, doesn't mean that members of parliament don't represent citizens of South Africa. MPs are allocated to Constituency Offices where they should be available to interact with members of the public."
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
