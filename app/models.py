from __future__ import unicode_literals

from django.db import models

# Create your models here.

class SimpleResult (models.Model) :
	task_id			=	models.IntegerField ()
	file_name		=	models.CharField (max_length=50)
	start_time		=	models.CharField (max_length=30)
	end_time		=	models.CharField (max_length=30)
	isValid			=	models.BooleanField ()
	failCount		=	models.IntegerField ()
