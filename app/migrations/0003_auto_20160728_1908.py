# -*- coding: utf-8 -*-
# Generated by Django 1.10b1 on 2016-07-28 19:08
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0002_auto_20160728_1438'),
    ]

    operations = [
        migrations.CreateModel(
            name='SimpleResult',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('task_id', models.IntegerField()),
                ('file_name', models.CharField(max_length=50)),
                ('start_time', models.CharField(max_length=30)),
                ('end_time', models.CharField(max_length=30)),
                ('isValid', models.BooleanField()),
                ('failCount', models.IntegerField()),
            ],
        ),
        migrations.RemoveField(
            model_name='failedoc',
            name='qr',
        ),
        migrations.RemoveField(
            model_name='querysimpleresult',
            name='qr',
        ),
        migrations.DeleteModel(
            name='FailedOC',
        ),
        migrations.DeleteModel(
            name='QueryResult',
        ),
        migrations.DeleteModel(
            name='QuerySimpleResult',
        ),
    ]