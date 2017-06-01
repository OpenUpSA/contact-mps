# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('contactmps', '0003_auto_20170601_1228'),
    ]

    operations = [
        migrations.AddField(
            model_name='email',
            name='uuid',
            field=models.CharField(default=uuid.uuid4, unique=True, max_length=100, blank=True),
        ),
        migrations.AlterField(
            model_name='person',
            name='pa_id',
            field=models.CharField(help_text=b'Peoples Assembly ID', unique=True, max_length=100),
        ),
    ]
