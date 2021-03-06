from django.conf import settings
from django.contrib.postgres.fields import JSONField
from django.contrib.sites.models import Site
from django.core.mail import EmailMultiAlternatives
from django.core.urlresolvers import reverse
from django.db import models
from django.utils.html import escape
import logging
import os
import re

EMAIL_RE = re.compile(r"(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)")
log = logging.getLogger(__name__)


def secure_random_string():
    return os.urandom(24).encode('hex')


class Party(models.Model):
    pa_id = models.CharField(max_length=100, null=False, blank=False, help_text="Peoples Assembly ID", unique=True)
    name = models.CharField(max_length=200, null=False, blank=False)
    slug = models.CharField(max_length=70, null=False, blank=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def icon_url(self):
        return '/static/images/parties/%s.png' % self.slug

    @property
    def abbr(self):
        return self.name.split('(', 1)[1].strip(')')

    def as_dict(self):
        return {
            'id': self.id,
            'pa_id': self.pa_id,
            'name': self.name,
            'abbr': self.abbr,
            'slug': self.slug,
            'icon_url': self.icon_url,
        }


class ConstituencyBranch(models.Model):
    pa_id = models.CharField(max_length=100, null=False, blank=False, help_text="Peoples Assembly ID", unique=True)
    name = models.CharField(max_length=200, null=False, blank=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def as_dict(self):
        return {
            'id': self.id,
            'pa_id': self.pa_id,
            'name': self.name,
        }


class Entity(models.Model):
    name = models.CharField(max_length=200, null=False, blank=False)
    pa_id = models.CharField(max_length=100, null=True, blank=True, help_text="Peoples Assembly ID", unique=True)
    pa_url = models.CharField(max_length=100000, null=True, blank=True)
    in_national_assembly = models.BooleanField(default=False, help_text="We use this right now to distinguish between MPs and committees. True for MPs, False for committees.")
    portrait_url = models.CharField(max_length=300, null=True, blank=True)
    party = models.ForeignKey(Party, null=True, blank=True)
    constituency_branches = models.ManyToManyField(ConstituencyBranch, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Entities'

    @property
    def local_portrait_url(self):
        if self.portrait_url:
            return '/static/images/portraits/' + self.portrait_url[39:]

    def as_dict(self):
        return {
            'id': self.id,
            'pa_id': self.pa_id,
            'name': self.name,
            'contactdetails': [d.as_dict() for d in self.contactdetails.all()],
            'pa_url': self.pa_url,
            'local_portrait_url': self.local_portrait_url,
            'party': self.party.as_dict() if self.party else None,
        }

    def __unicode__(self):
        return self.name


class ContactDetail(models.Model):
    entity = models.ForeignKey(Entity, related_name="contactdetails")
    type = models.CharField(max_length=40, help_text="Type of contact detail, e.g. 'email'. This is used to find addresses by type for sending to the appropriate contacts.")
    value = models.CharField(max_length=255, help_text="The actual detail")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def as_dict(self):
        return {
            'id': self.id,
            'type': self.type,
            'value': self.value,
        }

    def __unicode__(self):
        return "%s (%s) %s" % (self.entity.name, self.type, self.value,)


class Committee(models.Model):
    name = models.CharField(max_length=300, null=False, blank=False, unique=True)
    slug = models.CharField(max_length=300, null=False, blank=False, unique=True)
    email_address = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def as_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'sug': self.slug,
        }

    def __unicode__(self):
        return self.name


class Campaign(models.Model):
    slug = models.CharField(max_length=100)
    google_analytics_id = models.CharField(max_length=20, blank=True)
    hashtag = models.CharField(max_length=100, blank=True)
    site_name = models.CharField(max_length=100)
    site_description = models.CharField(max_length=200)
    single_recipient = models.ForeignKey(Entity, null=True, blank=True)
    load_neglected_entities = models.BooleanField(default=False)
    load_all_entities = models.BooleanField(default=False)
    include_link_in_email = models.BooleanField(default=False)
    divert_emails = models.BooleanField(default=False, help_text="all emails towards parliament for that campaign will instead go to our webapps address and not to the actual recipient")
    sites = models.ManyToManyField(Site, blank=True, help_text="Right now you must have exactly one campaign per site otherwise the campaign will break.")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    email_moderation = models.BooleanField(default=False, help_text="moderate email submissions")

    def __unicode__(self):
        return self.slug


class Email(models.Model):
    to_entity = models.ForeignKey(Entity)
    to_addresses = models.TextField(null=True, blank=True, help_text="The actuall address(es) we sent to belonging to the recipient at the time, regardless of the addresses that we currently have for them.")
    remote_ip = models.CharField(max_length=20, help_text="User's remote IP")
    user_agent = models.CharField(max_length=200, help_text="User's user agent string")
    subject = models.CharField(max_length=200, null=False, blank=False)
    body_txt = models.TextField(null=False, blank=False)
    from_name = models.CharField(max_length=70, null=False, blank=False)
    from_email = models.EmailField(null=False, blank=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    # This is what we use make it viewable online, but only to anyone who knows the URL
    secure_id = models.CharField(max_length=100, blank=True, unique=True, default=secure_random_string)
    # This is what we only present to the sender so that they can answer questions
    # that we can tie to an (eventually anonymous) individual.
    # THIS SHOULD NOT BE PART OF THE STANDARD as_dict dict.
    sender_secret = models.CharField(max_length=100, blank=True, unique=True, default=secure_random_string)
    # Any data we'd like connected to the email in structured form.
    # This makes no promises about keys being present from one email to another.
    any_data = JSONField()
    campaign = models.ForeignKey(Campaign, related_name='emails')
    is_moderated = models.BooleanField(default=False, help_text='Has the submission been moderated')
    is_sent = models.BooleanField(default=False, help_text="Has the submission been sent")
    moderation_passed = models.BooleanField(default=False, help_text="moderation outcome")


    @property
    def body_html(self):
        # VERY IMPORTANT: Escape any HTML someone might have entered
        html_escaped_text = escape(self.body_txt)
        return re.sub("(\r\n|\n|\r)", "<br />", html_escaped_text)

    def as_dict(self):
        return {
            'id': self.id,
            'to_entity': self.to_entity.as_dict(),
            'to_addresses': self.to_addresses,
            'subject': self.subject,
            'body_html': self.body_html,
            'body_txt': self.body_txt,
            'from_name': self.from_name,
            'secure_id': self.secure_id,
            'any_data': self.any_data,
        }

    def send(self, site):
        if not EMAIL_RE.match(self.from_email):
            self.from_email = "noreply@openup.org.za"
        sender = "%s <%s>" % (self.from_name, self.from_email)
        if self.campaign.divert_emails:
            recipients = ["%s <webapps+contactmps@openup.org.za>" % self.to_entity.name.strip()
                          for c in self.to_entity.contactdetails.filter(type='email').all()]
        else:
            recipients = ["%s <%s>" % (self.to_entity.name.strip(), c.value.strip())
                          for c in self.to_entity.contactdetails.filter(type='email').all()]
        if settings.SEND_EMAILS:
            log.info("Sending email to %s from %s" % (recipients, self.from_email))

            if self.campaign.include_link_in_email:
                url = "https://%s%s" % (
                    site.domain,
                    reverse('email-detail', kwargs={'secure_id': self.secure_id}),
                )
                body_txt = "%s\n\nThis message can also be viewed at %s" % (self.body_txt, url)
                # body_html = "%s<br><br>This message can also be viewed at <a href=\"%s\">%s</a>" % (
                #     self.body_html, url, url)
            else:
                body_txt = self.body_txt
                # body_html = self.body_html

            body_no_tags_txt = re.sub('\\<\w+\\>|\\</\w+\\>', '', body_txt)
            email = EmailMultiAlternatives(
                self.subject,
                body_no_tags_txt,
                sender,
                recipients,
                cc=[sender],
            )
            # email.attach_alternative(body_html, "text/html")
            # we are just sending plain text for now.
            email.send()
        self.to_addresses = ", ".join(recipients)
        self.is_sent = True
        self.save()

    def __unicode__(self):
        return u"From: %s To: %s" % (self.from_email, self.to_addresses)


class SenderQA(models.Model):
    email = models.ForeignKey(Email)
    question = models.TextField(null=False, blank=False)
    answer = models.TextField(null=False, blank=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __unicode__(self):
        return u"%d Q: %s...A: %s" % (self.email.id, self.question[:100], self.answer)
