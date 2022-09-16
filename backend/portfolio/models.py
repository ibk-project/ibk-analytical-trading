from statistics import mode
from django.db import models

# Create your models here.

class Sector(models.Model):
    name = models.CharField(max_length=50)
    code = models.CharField(max_length=50)
    sector = models.CharField(max_length=50)
    
    def __str__(self):
        return ','+ self.name +','+ self.code + ','+self.sector