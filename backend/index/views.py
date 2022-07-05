from django.shortcuts import render

from django.http.response import JsonResponse
from rest_framework.parsers import JSONParser 
from rest_framework import status
import json
 
from index.models import Index
from index.serializers import IndexSerializer
from rest_framework.decorators import api_view

import FinanceDataReader as fdr



@api_view(['GET'])
def get_index(request):
    if request.method == 'GET':
        print(request.data)
        code = request.data.get("code")
        date = request.data.get("date")
        chart_type = request.data.get("type")

        # indexs = Index.objects.all()
        # indexs_serializer = IndexSerializer(indexs, many=True)
        # if chart_type == 'line' :
        #     df = df[["date", "Close"]]

        df = fdr.DataReader(code)
        df.index = df.index.strftime('%Y-%m-%d')
        df['date'] = df.index
        js = {"data": df.to_dict('records')}
        
        return JsonResponse(js, safe=False)
        # if null? error msg
        # return JsonResponse(indexs_serializer.data, safe=False)
        # return JsonResponse(js, safe=False)


# def get_index(request):
#     if request.method == 'GET':
#         print(request.data)
#         code = request.data.get("code")
#         date = request.data.get("date")
#         chart_type = request.data.get("type")

#         # indexs = Index.objects.all()
#         # indexs_serializer = IndexSerializer(indexs, many=True)

#         df = fdr.DataReader(code)
#         df.index = df.index.strftime('%Y-%m-%d')
#         df['date'] = df.index
#         js = {"data": df.to_dict('records')}
#         return js
# # Create your views here.
