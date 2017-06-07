from django.db import models
import re
import uuid
import logging
from django.core.mail import EmailMessage
from django.conf import settings

EMAIL_RE = re.compile(r"(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)")
log = logging.getLogger(__name__)


class Party(models.Model):
    pa_id = models.CharField(max_length=100, null=False, blank=False, help_text="Peoples Assembly ID", unique=True)
    name = models.CharField(max_length=200, null=False, blank=False)
    slug = models.CharField(max_length=70, null=False, blank=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def as_dict(self):
        return {
            'id': self.id,
            'pa_id': self.pa_id,
            'name': self.name,
            'slug': self.slug,
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


class Person(models.Model):
    pa_id = models.CharField(max_length=100, null=False, blank=False, help_text="Peoples Assembly ID", unique=True)
    name = models.CharField(max_length=70, null=False, blank=False)
    pa_url = models.TextField(null=False, blank=False)
    in_national_assembly = models.BooleanField(default=True)
    portrait_url = models.CharField(max_length=300, null=True, blank=True)
    party = models.ForeignKey(Party, null=True, blank=False)
    constituency_branches = models.ManyToManyField(ConstituencyBranch)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def as_dict(self):
        return {
            'id': self.id,
            'pa_id': self.pa_id,
            'name': self.name,
            'contactdetails': [d.as_dict() for d in self.contactdetails.all()],
            'pa_url': self.pa_url,
            'portrait_url': self.portrait_url,
            'party': self.party.as_dict() if self.party else None,
            'constituency_branches': [b.as_dict() for b in self.constituency_branches.all()],
        }

    def __unicode__(self):
        return self.name


class ContactDetail(models.Model):
    person = models.ForeignKey(Person, related_name="contactdetails")
    type = models.CharField(max_length=40, help_text="Type of contact detail")
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
        return "%s (%s) %s" % (self.person.name, self.type, self.value,)


class Email(models.Model):
    to_person = models.ForeignKey(Person)
    to_addresses = models.TextField(null=True, blank=True, help_text="The actuall address(es) we sent to belonging to the recipient at the time, regardless of the addresses that we currently have for them.")
    remote_ip = models.CharField(max_length=20, help_text="User's remote IP")
    user_agent = models.CharField(max_length=200, help_text="User's user agent string")
    subject = models.CharField(max_length=200, null=False, blank=False)
    body = models.TextField(null=False, blank=False)
    from_name = models.CharField(max_length=70, null=False, blank=False)
    from_email = models.EmailField(null=False, blank=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    uuid = models.CharField(max_length=100, blank=True, unique=True, default=uuid.uuid4)

    def as_dict(self):
        return {
            'id': self.id,
            'to_person': self.to_person.as_dict(),
            'to_addresses': self.to_addresses,
            'subject': self.subject,
            'body': self.body,
            'from_name': self.from_name,
            'from_email': self.from_email,
            'uuid': self.uuid,
        }

    def send(self):
        if not EMAIL_RE.match(self.from_email):
            self.from_email = "noreply@openup.org.za"
        sender = "%s <%s>" % (self.from_name, self.from_email)
        recipients = ["%s <%s>" % (self.to_person.name, c.value) for c in self.to_person.contactdetails.filter(type='email').all()]
        if settings.SEND_EMAILS:
            log.info("Sending email to %s from %s" % (recipients, self.from_email))
            email = EmailMessage(
                self.subject,
                self.body,
                sender,
                recipients,
                cc=[sender],
            )
            email.send()
        self.to_addresses = ", ".join(recipients)
        self.save()

    def __unicode__(self):
        return u"From: %s To: %s" % (self.from_email, self.to_addresses)
