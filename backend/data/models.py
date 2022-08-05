from django.db import models

# Create your models here.
class Index(models.Model):
    name = models.CharField(max_length=30)
    code = models.CharField(max_length=10)
    date =  models.CharField(max_length=12)
    open = models.FloatField(max_length=10)
    close = models.FloatField(max_length=10)
    high = models.FloatField(max_length=10)
    low = models.FloatField(max_length=10)
    change = models.FloatField(max_length=10)
    volume = models.FloatField(max_length=10)

class Commodity(models.Model):
    name = models.CharField(max_length=30)
    code = models.CharField(max_length=10)
    date =  models.CharField(max_length=12)
    open = models.FloatField(max_length=10)
    close = models.FloatField(max_length=10)
    high = models.FloatField(max_length=10)
    low = models.FloatField(max_length=10)
    change = models.FloatField(max_length=10)
    volume = models.FloatField(max_length=10)

class Stock(models.Model):
    name = models.CharField(max_length=30)
    code = models.CharField(max_length=10)
    date =  models.CharField(max_length=12)
    open = models.FloatField(max_length=10)
    close = models.FloatField(max_length=10)
    high = models.FloatField(max_length=10)
    low = models.FloatField(max_length=10)
    change = models.FloatField(max_length=10)
    volume = models.FloatField(max_length=10)
