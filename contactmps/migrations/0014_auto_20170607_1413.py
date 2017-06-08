# -*- coding: utf-8 -*-
# Generated by Django 1.11.2 on 2017-06-07 14:13
from __future__ import unicode_literals

import contactmps.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('contactmps', '0013_auto_20170607_1012'),
    ]

    operations = [
        migrations.RenameField(
            model_name='email',
            old_name='uuid',
            new_name='secure_id',
        ),
        migrations.AlterField(
            model_name='email',
            name='secure_id',
            field=models.CharField(blank=True, default=contactmps.models.secure_id, max_length=100, unique=True),
        ),
    ]
