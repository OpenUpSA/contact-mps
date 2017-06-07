from django.conf import settings
from django.core.urlresolvers import reverse
from django.db.models import Count, Case
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.shortcuts import render, redirect
from django.views.decorators.clickjacking import xframe_options_exempt

from .models import (
    Email,
    Person,
)
import json
import logging
import requests

log = logging.getLogger(__name__)


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
                    .annotate(num_email_addresses=Count('contactdetails')) \
                    .annotate(num_emails=Count('email')) \
                    .order_by('num_emails')[:3]
    persons_json = json.dumps([p.as_dict() for p in Person.objects.all()])
    return render(request, 'create_mail.html', {
        'persons': persons,
        'persons_json': persons_json,
        'recaptcha_key': settings.RECAPTCHA_KEY,
    })


@xframe_options_exempt
def email(request):
    if request.method == 'POST':
        payload = {
            'secret': settings.RECAPTCHA_SECRET,
            'response': request.POST['g-recaptcha-response'],
        }
        r = requests.post("https://www.google.com/recaptcha/api/siteverify", data=payload)
        r.raise_for_status()
        if r.json()['success']:
            print
            print "person", int(request.POST['person'])
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

            return redirect(reverse('email-detail', kwargs={'uuid': email.uuid}))
        else:
            log.error("Error validating reCaptcha for %s <%s>: %s",
                      request.POST['from_name'],
                      request.POST['from_email'],
                      r.json(),
            )
            return redirect('/')
    else:
        return redirect('/')


@xframe_options_exempt
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
