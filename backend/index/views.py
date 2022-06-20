from django.shortcuts import render

from django.http.response import JsonResponse
from rest_framework.parsers import JSONParser 
from rest_framework import status
 
from index.models import Index
from index.serializers import IndexSerializer
from rest_framework.decorators import api_view

import FinanceDataReader as fdr



@api_view(['GET'])
def get_index(request):
    if request.method == 'GET':
        
        #code = request.data.get("code")
        #date = request.data.get("date")
        #chart_type = request.data.get("type")

        df = fdr.DataReader('005930')
        indexs = Index.objects.all()
        indexs_serializer = IndexSerializer(indexs, many=True)

        df.index = df.index.strftime('%Y-%m-%d')
        js = df.to_json(orient='index')

        #return JsonResponse(indexs_serializer.data, safe=False)
        return JsonResponse(js, safe=False)

# Create your views here.
