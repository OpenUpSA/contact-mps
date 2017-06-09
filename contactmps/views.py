from django.conf import settings
from django.core.urlresolvers import reverse
from django.db.models import Count
from django.http import HttpResponse
from django.shortcuts import get_object_or_404, render, redirect
from django.views.decorators.clickjacking import xframe_options_exempt
from django.views.decorators.http import require_POST
from django import forms
from urllib import urlencode
import random

from .models import (
    Email,
    Person,
)
import json
import logging
import requests

log = logging.getLogger(__name__)


class EmailForm(forms.Form):
    person = forms.CharField(label='person', required=True)
    name = forms.CharField(label='Your name', required=True)
    email = forms.EmailField(label='Your email address', required=True)
    reasons = forms.CharField(label='Reasons', required=True)
    location = forms.CharField(label='Location', required=False)
    subject = forms.CharField(label='Subject', required=True, initial="Motion of No Confidence in the President of the Republic")


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
    persons = Person.objects \
        .filter(contactdetails__type='email') \
        .annotate(num_emails=Count('email')) \
        .prefetch_related('party', 'contactdetails')

    # of those MPs that are less emailed, randomly choose 4
    neglected_persons = sorted(persons, key=lambda p: (p.num_emails, random.random()))[:4]
    persons_json = json.dumps([p.as_dict() for p in persons])

    return render(request, 'create_mail.html', {
        'persons': persons,
        'neglected_persons': neglected_persons,
        'persons_json': persons_json,
        'form': EmailForm(),
        'recaptcha_key': settings.RECAPTCHA_KEY,
    })


@require_POST
@xframe_options_exempt
def email(request):
    form = EmailForm(request.POST)

    payload = {
        'secret': settings.RECAPTCHA_SECRET,
        'response': request.POST['g-recaptcha-response'],
    }
    r = requests.post("https://www.google.com/recaptcha/api/siteverify", data=payload)
    r.raise_for_status()

    if not form.is_valid() or (not settings.DEBUG and not r.json()['success']):
        print form.errors
        return redirect(reverse('noconfidence'))

    person = get_object_or_404(Person, pk=form.cleaned_data['person'])

    if 'HTTP_X_FORWARDED_FOR' in request.META:
        remote_ip = request.META.get('HTTP_X_FORWARDED_FOR', '')
    else:
        remote_ip = request.META.get('REMOTE_ADDR', '')

    body = u"""
Honourable Member {mp},

As an elected representative of the people you will soon be required to cast a vote in the Motion of No Confidence tabled against President Zuma.

I have seen that Parliament has not always lived up to what the Constitution requires of it and has shown a weakness in holding the President and his Cabinet to account. It is worrying that this Parliament has failed to hold the President or his cabinet to account on the following issue(s) that are important to me:

{reasons}

It is for these reasons that I do not have confidence in the President of the Republic and his cabinet.

I trust that you will make my voice heard and vote to make sure the President and his Cabinet are held to account. I trust you will vote to represent the people, ensuring government by us under the Constitution.

{location}
I hope that the vote that you cast will restore my trust in you, in Parliament and in government. I trust that your vote will be loyal to the Constitution, the Republic and its people.

{name}
"""

    location = ''
    if form.cleaned_data['location']:
        location = u'I live in %s\n' % form.cleaned_data['location']

    body = body.format(
        mp=person.name,
        reasons=form.cleaned_data['reasons'],
        location=location,
        name=form.cleaned_data['name'],
    )

    email = Email(
        to_person=person,
        from_name=form.cleaned_data['name'],
        from_email=form.cleaned_data['email'],
        body=body,
        subject=form.cleaned_data['subject'],
        remote_ip=remote_ip,
        user_agent=request.META.get('HTTP_USER_AGENT')
    )
    email.save()
    email.send()

    return redirect(reverse('email-detail', kwargs={'secure_id': email.secure_id}))


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
