# -*- coding: utf-8 -*-
# Generated by Django 1.11.2 on 2017-07-20 10:55
from __future__ import unicode_literals

import contactmps.models
import django.contrib.postgres.fields.jsonb
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('contactmps', '0016_auto_20170718_1323'),
    ]

    operations = [
        migrations.AddField(
            model_name='email',
            name='any_data',
            field=django.contrib.postgres.fields.jsonb.JSONField(default={}),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='email',
            name='sender_secret',
            field=models.CharField(blank=True, default=contactmps.models.secure_random_string, max_length=100, unique=True),
        ),
    ]
