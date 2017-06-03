# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('contactmps', '0005_email_to_addresses'),
    ]

    operations = [
        migrations.AddField(
            model_name='person',
            name='in_national_assembly',
            field=models.BooleanField(default=True),
        ),
        migrations.AlterField(
            model_name='contactdetail',
            name='person',
            field=models.ForeignKey(related_name='contactdetails', to='contactmps.Person'),
        ),
    ]
