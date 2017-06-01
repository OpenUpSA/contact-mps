# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Email',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('remote_ip', models.CharField(help_text=b"User's remote IP", max_length=20)),
                ('user_agent', models.CharField(help_text=b"User's user agent string", max_length=200)),
                ('subject', models.CharField(max_length=200)),
                ('body', models.TextField()),
                ('from_name', models.CharField(max_length=70)),
                ('from_email', models.EmailField(max_length=254)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='Person',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('pa_id', models.CharField(max_length=100)),
                ('name', models.TextField()),
                ('pa_url', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.AddField(
            model_name='email',
            name='to_person',
            field=models.ForeignKey(to='contactmps.Person'),
        ),
    ]
