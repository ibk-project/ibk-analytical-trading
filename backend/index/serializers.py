from rest_framework import serializers
from .models import Index

class IndexSerializer(serializers.ModelSerializer):
    class Meta:
        model = Index
        fields = ('name')