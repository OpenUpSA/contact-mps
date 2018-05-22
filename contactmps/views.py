from django.conf import settings
from django.contrib.sites.shortcuts import get_current_site
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.core.urlresolvers import reverse
from django.db.models import Count
from django.http import HttpResponse, JsonResponse
from django import shortcuts
from django.shortcuts import get_object_or_404, redirect
from django.views.decorators.clickjacking import xframe_options_exempt
from django.views.decorators.http import require_POST
from django import forms
from urllib import urlencode
import random

from .models import (
    Campaign,
    Email,
    Entity,
    SenderQA,
)
import json
import logging
import requests

DEFAULT_SUBJECT = 'Motion of No Confidence in the President of the Republic'

log = logging.getLogger(__name__)


def render(request, template, context):
    campaign = context.get('campaign', None)
    if campaign:
        context.update({
            'SITE_NAME': campaign.site_name,
            'SITE_DESCRIPTION': campaign.site_description,
            'SITE_HASHTAG': campaign.hashtag,
            'GOOGLE_ANALYTICS_ID': campaign.google_analytics_id,
        })
    return shortcuts.render(request, template, context)


class EmailForm(forms.Form):
    campaign_slug = forms.CharField(label='campaign_slug', required=True)
    recipient_entity = forms.CharField(label='entity', required=True)
    name = forms.CharField(label='Your name', required=True)
    email = forms.EmailField(label='Your email address', required=True)
    body = forms.CharField(label='Body', required=True)
    subject = forms.CharField(label='Subject', required=True, initial=DEFAULT_SUBJECT)
    share = forms.CharField(required=False)


@xframe_options_exempt
def home(request):
    site = get_current_site(request)
    campaigns = list(Campaign.objects.filter(sites=site))
    if len(campaigns) != 1:
        raise Exception("%r has %d campaigns. Expected 1." % (site, len(campaigns)))
    site_campaign = campaigns[0]

    if site_campaign.slug == 'psam':
        return campaign(request, 'psam')
    else:
        return render(request, 'index.html', {
            'campaign': site_campaign,
        })


@xframe_options_exempt
def embedded_preview(request, campaign_slug):
    campaign = get_object_or_404(Campaign, slug=campaign_slug)
    return render(request, 'campaign-embedded-preview.html', {
        'campaign': campaign,
    })


@xframe_options_exempt
def campaign(request, campaign_slug):
    context = {}
    campaign = get_object_or_404(Campaign, slug=campaign_slug)

    if campaign.load_all_entities or campaign.load_neglected_entities:
        # Only retuns entities with at least one email address
        # Count the number of emails we've sent them
        entities = Entity.objects \
            .filter(contactdetails__type='email', in_national_assembly=True) \
            .annotate(num_emails=Count('email')) \
            .prefetch_related('party', 'contactdetails')

    if campaign.load_all_entities:
        entities_json = json.dumps([p.as_dict() for p in entities])
        context.update({
            'entities': entities,
            'entities_json': entities_json,
        })

    if campaign.load_neglected_entities:
        # of those MPs that are less emailed, randomly choose 4
        neglected_entities = sorted(entities, key=lambda p: (p.num_emails, random.random()))[:4]
        context.update({
            'neglected_entities': neglected_entities,
        })

    if campaign.single_recipient is not None:
        entities = Entity.objects \
            .filter(id=campaign.single_recipient.id) \
            .filter(contactdetails__type='email') \
            .annotate(num_emails=Count('email')) \
            .prefetch_related('party', 'contactdetails')

        recipient = entities.first()
        context.update({
            'recipient': recipient,
            'recipient_json': json.dumps(recipient.as_dict()),
        })

    context.update({
        'form': EmailForm({
            'campaign_slug': campaign_slug,
            'subject': DEFAULT_SUBJECT,
        }),
        'recaptcha_key': settings.RECAPTCHA_KEY,
        'campaign': campaign,
    })
    template = 'campaigns/%s.html' % campaign.slug
    return render(request, template, context)


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
        log.error("Email form validation error: %r; captcha=%s", form.errors, r.json())
        qs = urlencode({'errors': form.errors.as_json()})
        return redirect(reverse('campaign', args=[form.cleaned_data['campaign_slug']]) + '?' + qs)

    recipient_entity = get_object_or_404(Entity, pk=form.cleaned_data['recipient_entity'])
    campaign = get_object_or_404(Campaign, slug=form.cleaned_data['campaign_slug'])

    if 'HTTP_X_FORWARDED_FOR' in request.META:
        remote_ip = request.META.get('HTTP_X_FORWARDED_FOR', '')
    else:
        remote_ip = request.META.get('REMOTE_ADDR', '')

    email = Email(
        to_entity=recipient_entity,
        from_name=form.cleaned_data['name'],
        from_email=form.cleaned_data['email'],
        body_txt=form.cleaned_data['body'],
        subject=form.cleaned_data['subject'],
        remote_ip=remote_ip,
        user_agent=request.META.get('HTTP_USER_AGENT'),
        any_data={'share-opt-in': form.cleaned_data['share']},
        campaign=campaign,
    )
    email.save()
    # Only send emails if the campaign submissions to not require moderation
    if not email.campaign.email_moderation:
        email.send(get_current_site(request))

    return redirect(reverse('email-detail', kwargs={'secure_id': email.secure_id}))


def campaign_email(request, campaign_slug):
    campaign = get_object_or_404(Campaign, slug=campaign_slug)
    emails = campaign.emails.filter(any_data__allowPublicListing=True) \
                            .order_by('-created_at').all()[:300]

    template = 'campaign-emails-%s.html' % campaign.slug
    return render(request, template, {
        'emails': emails,
    })


@require_POST
@xframe_options_exempt
def api_email(request):
    """ Accept URL-encoded request body. Responds with JSON-encoded body """
    form = EmailForm(request.POST)

    payload = {
        'secret': settings.RECAPTCHA_SECRET,
        'response': request.POST['gRecaptchaResponse'],
    }
    r = requests.post("https://www.google.com/recaptcha/api/siteverify", data=payload)
    r.raise_for_status()

    if not form.is_valid() or (not settings.DEBUG and not r.json()['success']):
        log.error("Email form validation error: %r; captcha=%s", form.errors, r.json())
        return JsonResponse({'errors': form.errors.as_json()}, status=400)

    recipient_entity = get_object_or_404(Entity, pk=form.cleaned_data['recipient_entity'])
    campaign = get_object_or_404(Campaign, slug=form.cleaned_data['campaign_slug'])

    if 'HTTP_X_FORWARDED_FOR' in request.META:
        remote_ip = request.META.get('HTTP_X_FORWARDED_FOR', '')
    else:
        remote_ip = request.META.get('REMOTE_ADDR', '')

    email = Email(
        to_entity=recipient_entity,
        from_name=form.cleaned_data['name'],
        from_email=form.cleaned_data['email'],
        body_txt=form.cleaned_data['body'],
        subject=form.cleaned_data['subject'],
        remote_ip=remote_ip,
        user_agent=request.META.get('HTTP_USER_AGENT'),
        any_data=json.loads(request.POST['anyData']),
        campaign=campaign,
    )
    email.save()
    # Only send emails if the campaign submissions to not require moderation
    if not email.campaign.email_moderation:
        email.send(get_current_site(request))

    email_dict = email.as_dict()
    # Add secret because this is only shown to the sender
    email_dict['sender_secret'] = email.sender_secret
    return JsonResponse(email_dict)


@require_POST
@xframe_options_exempt
def api_qa(request, secure_id):
    """ Accept URL-encoded request body. Responds with JSON-encoded body """

    email = get_object_or_404(Email, secure_id=secure_id)
    if email.sender_secret != request.POST['sender_secret']:
        return JsonResponse({'error': 'incorrect sender_secret'}, status=403)

    SenderQA.objects.create(
        email=email,
        question=request.POST['question'],
        answer=request.POST['answer'],
    )

    return JsonResponse("success", safe=False)


@xframe_options_exempt
def email_detail(request, secure_id):
    email = get_object_or_404(Email, secure_id=secure_id)
    template = 'email-detail-%s.html' % email.campaign.slug

    return render(request, template, {
        'email': email,
        'campaign': email.campaign,
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
