from django.shortcuts import render

from django.http.response import JsonResponse
from rest_framework.parsers import JSONParser 
from rest_framework import status
 
from index.models import Index
from index.serializers import IndexSerializer
from rest_framework.decorators import api_view


@api_view(['GET'])
def get_index(request):
    if request.method == 'GET':
        indexs = Index.objects.all()
        indexs_serializer = IndexSerializer(indexs, many=True)
        return JsonResponse(indexs_serializer.data, safe=False)


# Create your views here.
