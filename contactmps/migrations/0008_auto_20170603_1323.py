# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('contactmps', '0007_auto_20170603_1311'),
    ]

    operations = [
        migrations.AlterField(
            model_name='contactdetail',
            name='person',
            field=models.ForeignKey(related_name='contactdetails', editable=False, to='contactmps.Person'),
        ),
        migrations.AlterField(
            model_name='contactdetail',
            name='type',
            field=models.CharField(help_text=b'Type of contact detail', max_length=40, editable=False),
        ),
        migrations.AlterField(
            model_name='contactdetail',
            name='value',
            field=models.CharField(help_text=b'The actual detail', max_length=255, editable=False),
        ),
        migrations.AlterField(
            model_name='email',
            name='body',
            field=models.TextField(editable=False),
        ),
        migrations.AlterField(
            model_name='email',
            name='from_email',
            field=models.EmailField(max_length=254, editable=False),
        ),
        migrations.AlterField(
            model_name='email',
            name='from_name',
            field=models.CharField(max_length=70, editable=False),
        ),
        migrations.AlterField(
            model_name='email',
            name='remote_ip',
            field=models.CharField(help_text=b"User's remote IP", max_length=20, editable=False),
        ),
        migrations.AlterField(
            model_name='email',
            name='subject',
            field=models.CharField(max_length=200, editable=False),
        ),
        migrations.AlterField(
            model_name='email',
            name='to_addresses',
            field=models.TextField(help_text=b'The actuall address(es) we sent to belonging to the recipient at the time, regardless of the addresses that we currently have for them.', null=True, editable=False, blank=True),
        ),
        migrations.AlterField(
            model_name='email',
            name='to_person',
            field=models.ForeignKey(editable=False, to='contactmps.Person'),
        ),
        migrations.AlterField(
            model_name='email',
            name='user_agent',
            field=models.CharField(help_text=b"User's user agent string", max_length=200, editable=False),
        ),
        migrations.AlterField(
            model_name='email',
            name='uuid',
            field=models.CharField(default=uuid.uuid4, unique=True, max_length=100, editable=False, blank=True),
        ),
        migrations.AlterField(
            model_name='person',
            name='in_national_assembly',
            field=models.BooleanField(default=True, editable=False),
        ),
        migrations.AlterField(
            model_name='person',
            name='name',
            field=models.CharField(max_length=70, editable=False),
        ),
        migrations.AlterField(
            model_name='person',
            name='pa_id',
            field=models.CharField(help_text=b'Peoples Assembly ID', unique=True, max_length=100, editable=False),
        ),
        migrations.AlterField(
            model_name='person',
            name='pa_url',
            field=models.TextField(editable=False),
        ),
    ]
