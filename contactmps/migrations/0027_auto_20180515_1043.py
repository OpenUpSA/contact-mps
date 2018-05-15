# -*- coding: utf-8 -*-
# Generated by Django 1.11.2 on 2018-05-15 10:43
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('contactmps', '0026_auto_20180515_0840'),
    ]

    operations = [
        migrations.AlterField(
            model_name='campaign',
            name='google_analytics_id',
            field=models.CharField(blank=True, max_length=20),
        ),
        migrations.AlterField(
            model_name='campaign',
            name='hashtag',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AlterField(
            model_name='entity',
            name='in_national_assembly',
            field=models.BooleanField(default=False, help_text=b'We use this right now to distinguish between MPs and committees. True for MPs, False for committees.'),
        ),
    ]