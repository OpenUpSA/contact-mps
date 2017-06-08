from django.conf import settings
from django.core.urlresolvers import reverse
from django.db.models import Count, Case
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.shortcuts import render, redirect
from django.views.decorators.clickjacking import xframe_options_exempt
from django.views.decorators.http import require_POST
from urllib import urlencode

from .models import (
    Email,
    Person,
)
import json
import logging
import requests

log = logging.getLogger(__name__)


# https://github.com/django/django/blob/master/tests/decorators/tests.py
def compose(*functions):
    # compose(f, g)(*args, **kwargs) == f(g(*args, **kwargs))
    functions = list(reversed(functions))

    def _inner(*args, **kwargs):
        result = functions[0](*args, **kwargs)
        for f in functions[1:]:
            result = f(result)
        return result
    return _inner


@xframe_options_exempt
def home(request):
    return render(request, 'index.html')


@xframe_options_exempt
def embed(request):
    return render(request, 'embed.html')


@xframe_options_exempt
def create_mail(request):
    # Only retuns persons with at least one email address
    # Count the number of emails we've sent them
    neglected_persons = Person.objects \
                              .filter(contactdetails__type='email') \
                              .annotate(num_email_addresses=Count('contactdetails')) \
                              .annotate(num_emails=Count('email')) \
                              .prefetch_related('party', 'contactdetails') \
                              .order_by('num_emails')[:4]
    persons = Person.objects \
        .prefetch_related('party', 'contactdetails') \
        .all()
    persons_json = json.dumps([p.as_dict() for p in persons])
    return render(request, 'create_mail.html', {
        'persons': persons,
        'neglected_persons': neglected_persons,
        'persons_json': persons_json,
        'recaptcha_key': settings.RECAPTCHA_KEY,
    })


@require_POST
@xframe_options_exempt
def email(request):
    payload = {
        'secret': settings.RECAPTCHA_SECRET,
        'response': request.POST['g-recaptcha-response'],
    }
    r = requests.post("https://www.google.com/recaptcha/api/siteverify", data=payload)
    r.raise_for_status()
    if r.json()['success']:
        person = Person.objects.get(id=int(request.POST['person']))
        if 'HTTP_X_FORWARDED_FOR' in request.META:
            remote_ip = request.META.get('HTTP_X_FORWARDED_FOR', '')
        else:
            remote_ip = request.META.get('REMOTE_ADDR', '')
        email = Email(
            to_person=person,
            from_name=request.POST['from_name'],
            from_email=request.POST['from_email'],
            body=request.POST['body'],
            subject=request.POST['subject'],
            remote_ip=remote_ip,
            user_agent=request.META.get('HTTP_USER_AGENT')
        )
        email.save()
        email.send()

        return redirect(reverse('email-detail', kwargs={'secure_id': email.secure_id}))
    else:
        raise(Exception("Error validating reCaptcha for %s <%s>: %s" % (
            request.POST['from_name'],
            request.POST['from_email'],
            r.json(),
        )))


@xframe_options_exempt
def email_detail(request, secure_id):
    email = get_object_or_404(Email, secure_id=secure_id)
    return render(request, 'email-detail.html', {
        'email': email,
    })


@xframe_options_exempt
def add_utm(request, utm_medium):
    params = {
        'utm_source': 'site',
        'utm_medium': utm_medium,
        'utm_campaign': 'site-share-buttons',
    }
    query_string = urlencode(params, doseq=True)
    path = "/".join(request.path.split("/")[:-2])
    return redirect("%s/?%s" % (path, query_string))


@xframe_options_exempt
def robots(request):
    """
    Programmatic robots.txt so we can avoid indexing except for via domains
    """
    user_agents = [
        'Googlebot',
        'Yahoo! Slurp',
        'bingbot',
        'AhrefsBot',
        'Baiduspider',
        'Ezooms',
        'MJ12bot',
        'YandexBot',
    ]
    lines = []
    for ua in user_agents:
        lines.extend(["", "User-agent: %s" % ua, "Disallow: /"])
    lines.extend([
        "", "User-agent: *", "Allow: /",
        "", "User-agent: Twitterbot", "Disallow:",
    ])
    robotsdottxt = "\n".join(lines)
    return HttpResponse(robotsdottxt, content_type="text/plain")
