# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('contactmps', '0002_contactdetail'),
    ]

    operations = [
        migrations.AlterField(
            model_name='contactdetail',
            name='value',
            field=models.CharField(help_text=b'The actual detail', max_length=255),
        ),
        migrations.AlterField(
            model_name='person',
            name='name',
            field=models.CharField(max_length=70),
        ),
    ]
