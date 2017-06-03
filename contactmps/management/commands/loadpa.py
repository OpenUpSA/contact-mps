from django.core.management.base import BaseCommand, CommandError
from contactmps.models import Person
import json
import requests

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
        added_person_count = 0
        removed_person_count = 0

        if options['filename']:
            print "Loading Peoples Assembly data from %s" % options['filename']
            with open(options['filename']) as json_file:
                pombola = json.load(json_file)


        for person in pombola['persons']:
            person_count += 1
            # currently in national assembly
            in_national_assembly = False
            for membership in person['memberships']:
                # There might be multiple periods in national assembly.
                # we only modify in_national_assembly if we find one that is current.
                if membership.get('organization_id', None) == 'core_organisation:70':
                    if not membership.get('end_date', False):
                        in_national_assembly = True

            if in_national_assembly:
                assembly_person_count += 1

            print in_national_assembly, person['name']
        print "Total persons:  %d" % person_count
        print "Assembly count: %d" % assembly_person_count
