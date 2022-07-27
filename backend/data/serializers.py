from dataclasses import field
from backend.data.models import Commodity, Index, Stock
from rest_framework import serializers 
from data.models import *

class IndexSerializer(serializers.Serializer):
    
    class Meta:
        model = Index
        fields = (
                    'name',
                    'code',
                    'date',
                    'open',
                    'close'
                    'high',
                    'low', 
                    'change',
                    'volume')
        
class CommoditySerializer(serializers.Serializer):
    
    class Meta:
        model = Commodity
        fields = (
                    'name',
                    'code',
                    'date',
                    'open',
                    'close'
                    'high',
                    'low', 
                    'change',
                    'volume')
        
class StockSerializer(serializers.Serializer):
    
    class Meta:
        model = Stock
        fields = (
                    'name',
                    'code',
                    'date',
                    'open',
                    'close'
                    'high',
                    'low', 
                    'change',
                    'volume')