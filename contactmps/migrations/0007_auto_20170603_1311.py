# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('contactmps', '0006_auto_20170603_1303'),
    ]

    operations = [
        migrations.AlterField(
            model_name='contactdetail',
            name='type',
            field=models.CharField(help_text=b'Type of contact detail', max_length=40),
        ),
    ]
