from django.shortcuts import render
from django.http.response import JsonResponse
from numpy import empty
from pkg_resources import empty_provider
from rest_framework.parsers import JSONParser 
from rest_framework import status
import json
 
from index.models import Index
from index.serializers import IndexSerializer
from rest_framework.decorators import api_view

import FinanceDataReader as fdr
import json

from pymongo import MongoClient
from datetime import date, datetime

@api_view(['GET'])
def get_portfolio_output(request):
    if request.method == 'GET':
        result = {}
        price = []
        for i in range(3):
            tmp = {}
            tmp["date"] = "2016-05-0"+str(i)
            tmp["price"] = 123.4
            price.append(tmp)
        result["result"] = price
        result["stocks"] = ["sk", "sma", "ppap"]
        result["similar_date"] = ['2019-05-06', '2019-05-06', '2019-05-06']
        result["weight"] = [0.1,0,4,0.5]
        
        return JsonResponse(result)