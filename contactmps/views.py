from django.shortcuts import render, redirect
from django.core.urlresolvers import reverse
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.http import HttpResponse

from .models import (
    Email,
    Person,
)
import requests
import logging

log = logging.getLogger(__name__)


def home(request):
    persons = Person.objects.all()
    return render(request, 'index.html', {
        'persons': persons,
        'recaptcha_key': settings.RECAPTCHA_KEY,
    })


def email(request):
    if request.method == 'POST':
        payload = {
            'secret': settings.RECAPTCHA_SECRET,
            'response': request.POST['g-recaptcha-response'],
        }
        r = requests.post("https://www.google.com/recaptcha/api/siteverify", data=payload)
        r.raise_for_status()
        if r.json()['success']:
            person = Person.objects.get(id=request.POST['person'][0])
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
            return redirect(reverse('email-detail', kwargs={'uuid': email.uuid}))
        else:
            log.error("Error validating reCaptcha for %s <%s>: %s", (
                request.POST['from_name'],
                request.POST['from_email'],
                r.json()
            ))
            return redirect('/')
    else:
        return redirect('/')


def email_detail(request, uuid):
    email = get_object_or_404(Email, uuid=uuid)
    return render(request, 'email-detail.html', {
        'email': email,
    })


def robots(request):
    """
    Programmatic robots.txt so we can avoid indexing except for via domains
    """
    return HttpResponse("User-agent: *\nDisallow: /", content_type="text/plain")
