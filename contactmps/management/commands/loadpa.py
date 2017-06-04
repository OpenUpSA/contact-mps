from django.core.management.base import BaseCommand, CommandError
from django.core.exceptions import ObjectDoesNotExist
from contactmps.models import Person, ContactDetail
import json
import requests
import logging

log = logging.getLogger(__name__)
POMBOLA_URL = 'http://www.pa.org.za/media_root/popolo_json/pombola.json'

class Command(BaseCommand):
    help = 'Loads data from Peoples Assembly'
    person_count = 0
    assembly_person_count = 0
    assembly_constituency_count = 0
    new_person_count = 0
    removed_person_count = 0

    def add_arguments(self, parser):
        parser.add_argument(
            '--file',
            action='store',
            dest='filename',
            default=None,
            type=str,
            help='Load data from file',
        )

    def handle(self, *args, **options):
        pombola = self.get_pombola(options)

        constituency_offices = {}
        for org in pombola['organizations']:
            if org['classification'] in ('Constituency Office', 'Constituency Area'):
                constituency_offices[org['id']] = org

        for pa_person in pombola['persons']:
            self.person_count += 1

            current_mp = self.create_or_update_mp(pa_person)

            if current_mp:
                self.assembly_person_count += 1

            print current_mp is not None, pa_person['name']
        print "Assembly count:  %d" % self.assembly_person_count
        print "New persons:     %d" % self.new_person_count
        print "Removed persons: %d" % self.removed_person_count
        print "Total persons:   %d" % self.person_count

    def get_pombola(self, options):
        if options['filename']:
            log.debug("Loading MP data from %s", options['filename'])
            with open(options['filename']) as json_file:
                return json.load(json_file)
        else:
            log.debug("Downloading MP data from %s", POMBOLA_URL)
            r = requests.get(POMBOLA_URL)
            log.debug("Finished downloading MP data")
            r.raise_for_status()
            return r.json()

    def create_or_update_mp(self, pa_person):
        """
        Ensures the person exists in DB if currently in National Assembly
        and returns the Person instance.

        If not currently in National Assembly, returns None. In this case,
        if they are in the DB we set their in_national_assembly to False but
        still return None.
        """
        # currently in national assembly
        in_national_assembly = False
        if get_current_membership_by_ids(pa_person['memberships'], set(['core_organisation:70'])):
            in_national_assembly = True

        person = None
        try:
            person = Person.objects.get(pa_id=pa_person['id'])
            if person.in_national_assembly and not in_national_assembly:
                self.removed_person_count += 1
            # update
            person.name = pa_person['name']
            person.pa_url = pa_person['pa_url']
            person.in_national_assembly = in_national_assembly
            person.save()
            # Easiest just to delete and recreate contacts
            for contact in person.contactdetails.all():
                contact.delete()
        except ObjectDoesNotExist:
            if in_national_assembly:
                person = Person(
                    pa_id=pa_person['id'],
                    name=pa_person['name'],
                    pa_url=pa_person['pa_url'],
                )
                person.save()
                self.new_person_count += 1

        if person:
            for pa_contact_detail in pa_person['contact_details']:
                ContactDetail.objects.create(
                    person=person,
                    type=pa_contact_detail['type'],
                    value=pa_contact_detail['value']
                )

        if in_national_assembly:
            return person


def get_current_membership_by_ids(memberships, ids):
    for membership in memberships:
        # There might be multiple periods in that organization.
        # we only return if we find one that is current.
        if membership.get('organization_id', None) in ids:
            if not membership.get('end_date', False):
                return membership


def get_current_membership_by_classifications(memberships, classifications):
    for membership in memberships:
        if membership.get('classification', None) in classifications:
            if not membership.get('end_date', False):
                return membership
