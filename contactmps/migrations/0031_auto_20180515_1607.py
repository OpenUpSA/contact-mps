# -*- coding: utf-8 -*-
# Generated by Django 1.11.2 on 2018-05-15 16:07
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('contactmps', '0030_auto_20180515_1506'),
    ]

    operations = [
        migrations.AlterField(
            model_name='campaign',
            name='sites',
            field=models.ManyToManyField(blank=True, help_text=b'Right now you must have exactly one campaign per site otherwise the campaign will break.', to='sites.Site'),
        ),
    ]