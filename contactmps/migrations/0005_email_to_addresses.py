# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('contactmps', '0004_auto_20170601_1332'),
    ]

    operations = [
        migrations.AddField(
            model_name='email',
            name='to_addresses',
            field=models.TextField(help_text=b'The actuall address(es) we sent to belonging to the recipient at the time, regardless of the addresses that we currently have for them.', null=True, blank=True),
        ),
    ]
