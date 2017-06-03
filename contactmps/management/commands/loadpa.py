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
        person_count = 0
        assembly_person_count = 0
        new_person_count = 0
        removed_person_count = 0

        if options['filename']:
            log.debug("Loading MP data from %s", options['filename'])
            with open(options['filename']) as json_file:
                pombola = json.load(json_file)
        else:
            log.debug("Downloading MP data from %s", POMBOLA_URL)
            r = requests.get(POMBOLA_URL)
            log.debug("Finished downloading MP data")
            r.raise_for_status()
            pombola = r.json()

        for pa_person in pombola['persons']:
            person_count += 1
            # currently in national assembly
            in_national_assembly = False
            for membership in pa_person['memberships']:
                # There might be multiple periods in national assembly.
                # we only modify in_national_assembly if we find one that is current.
                if membership.get('organization_id', None) == 'core_organisation:70':
                    if not membership.get('end_date', False):
                        in_national_assembly = True

            person = None
            try:
                person = Person.objects.get(pa_id=pa_person['id'])
                if person.in_national_assembly and not in_national_assembly:
                    removed_person_count += 1
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
                    new_person_count += 1

            if person:
                for pa_contact_detail in pa_person['contact_details']:
                    ContactDetail.objects.create(
                        person=person,
                        type=pa_contact_detail['type'],
                        value=pa_contact_detail['value']
                    )

            if in_national_assembly:
                assembly_person_count += 1

            print in_national_assembly, pa_person['name']
        print "Assembly count:  %d" % assembly_person_count
        print "New persons:     %d" % new_person_count
        print "Removed persons: %d" % removed_person_count
        print "Total persons:   %d" % person_count
