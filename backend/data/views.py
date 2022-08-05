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

client = MongoClient(
        host='3.39.245.84',
        port = 27017,
        username = 'IBK',
        password = '1234'
    )


# front에서 code, date보내주기
@api_view(['GET', 'POST'])
def get_index_front(request):
    if request.method == 'GET':
        print(request.data)
        code = request.data.get("code")
        start_date = request.data.get("date")
        end_date = ""
        chart_type = request.data.get("type")
        db = client.newDB
        commodity_collection = db.data_commodity
        index_collection = db.data_index
        # indexs = Index.objects.all()
        # indexs_serializer = IndexSerializer(indexs, many=True)
        # if chart_type == 'line' :
        #     df = df[["date", "Close"]]
        
        if start_date == "":
            start_date = "2000-01-01"
            
        if end_date == "":
            end_date = str(datetime.today())

        if chart_type == 'line':
            id = index_collection.find({"Name" : code, "Date" : { '$gte' : start_date , '$lt': end_date}}, {"_id" : 0, "Name" : 0, "High" : 0 , "Volume" : 0, "Change" : 0 , "Low" : 0 , "Open" : 0 })
            result = list(id)
            if result == []:
                return JsonResponse({ "Result" : "None"})
            else:
                return JsonResponse({"data":result})
            
        elif chart_type == "line_volume":
            id = index_collection.find({"Name" : code, "Date" : { '$gte' : start_date , '$lt': end_date}}, {"_id" : 0, "Volume" : 1, "Close" : 1, "Date": 1})
            print(id)
            result = list(id)
            if result == []:
                return JsonResponse({ "Result" : "None"})
            else:
                return JsonResponse({"data":result})
        
        elif chart_type == "candle":
            id = index_collection.find({"Name" : code, "Date" : { '$gte' : start_date , '$lt': end_date}}, {"_id" : 0, "Open" : 1, "High" : 1, "Low" : 1,  "Close" : 1, "Date": 1})
            result = list(id)
            if result == []:
                return JsonResponse({ "Result" : "None"})
            else:
                return JsonResponse({"data":result})
            
    
    if request.method == 'POST':
        js = {"data" : "1212"}
        return JsonResponse(js, safe=False)


@api_view(['GET','POST'])
def get_commodity(request):
    if request.method == 'GET':
        db = client.newDB 
        commodity_collection = db.data_commodity
        
        comm = [
                ('WTI','CL'), ('Brent','LCO'), ('NG','NG'), ##Energy
                ('Corn','ZC'), ('Wheat', 'ZW'), ('Soybean', 'ZS'), ## 농산물
                ('Gold', 'ZG'), ('Silver', 'ZI'), ## 비금속
                ('Copper', 'HG'),('Lead', 'MPB3'), ('Nickel', 'NICKEL'), ('Zinc', 'MZN'), ('Aluminum', 'MAL'), ('Tin', 'TIN') ## 비철금속
                ]
        empty = []
        for name, code in comm:
            try:
                data = get_comm_data(name, code)
            except:
                data = []
                empty.append(code)
            
            
            if data == []:
                continue
            post_id = commodity_collection.insert_many(data)
        
        if empty != [] :
            file = open('empty_commodity.txt', 'w')
            file.write(empty)
            file.close
        
        return JsonResponse({"success" : "true"})

@api_view(['GET','POST'])
def get_stock(request):
    if request.method == 'GET':
        db = client.newDB 
        db.data_stock.drop()
        stock_collection = db.data_stock
        
        krx = fdr.StockListing('KRX')
        stock = krx[["Symbol","Name"]].values.tolist()
        kr_etf = fdr.StockListing('ETF/KR')
        etf = kr_etf[["Symbol","Name"]].values.tolist()
        empty_stock = []
        for symbol, name in stock:
            try:
                data = get_stock_data(symbol, name)
            except:
                data = []
                empty_stock.append(symbol)
            
            if data == []:
                continue
            post_id = stock_collection.insert_many(data)
            
        for symbol, name in etf:
            try:
                data = get_stock_data(symbol, name)
            except:
                data = []
                empty_stock.append(symbol)
                
            if data == []:
                continue
            post_id = stock_collection.insert_many(data)
        
        if empty_stock != [] :
            file = open('empty_stock.txt', 'w')
            file.write(empty_stock)
            file.close
        
        
        
        return JsonResponse({"success" : "true", "empty_stock" : empty_stock})
    
@api_view(['GET','POST'])
def get_index(request):
    if request.method == 'GET':
        db = client.newDB
        db.data_index.drop()
        index_collection = db.data_index
        
        #없는 것은 안들어감
        INDEXS_NAME = ['KS11', 'KQ11', 'DJI', 'JP225', 'HK50', 'CSI300', 'DAX']
        EMPTY_INDEX = ['IXIC']
        EX_RATE_LIST = ["USD/KRW", "USD/EUR", "USD/JPY", "CNY/KRW", "EUR/USD", "USD/JPY", "JPY/KRW", "AUD/USD", "EUR/JPY", "USD/RUB"]

        empty = []
        
        for name in INDEXS_NAME:
            try:
                data = get_index_data(name)
            except:
                data =[]
                empty.append(name)
            
                
            if data == []:
                continue
            post_id = index_collection.insert_many(data)
            
        for name in EX_RATE_LIST:
            try:
                data = get_ex_data(name)
            except:
                data =[]
                empty.append(name)
            
            if data == []:
                continue
            post_id = index_collection.insert_many(data)
            
        
        if empty != [] :
            file = open('empty_index.txt', 'w')
            file.write(empty)
            file.close
        
        return JsonResponse({"success" : "true"})
    
@api_view(['POST'])
def get_one_index(request):
    if request.method == 'POST':
        db = client.newDB
        index_collection = db.data_index
        
        # symbol = request["Symbol"]
        name = request.data.get('Name')
        start_date = request.data.get('Start')
        end_date = request.data.get('End')
        
        if start_date == "":
            start_date = "2022-01-01"
        
        if end_date == "":
            end_date = str(datetime.today())

        id = index_collection.find({"Name" : name, "Date" : { '$gte' : start_date , '$lt': end_date}}, {"_id" : 0, "Name" : 0})
        result = list(id)
        return JsonResponse({"Result" : result})
    
@api_view(['POST'])
def get_one_stock(request):
    if request.method == 'POST':
        db = client.newDB
        stock_collection = db.data_stock
        
        symbol = request.data.get("Symbol")
        name = request.data.get('Name')
        start_date = request.data.get('Start')
        end_date = request.data.get('End')
        
        if start_date == "":
            start_date = "2022-01-01"
        
        if end_date == "":
            end_date = str(datetime.today())

        id = stock_collection.find({"Name" : name, "Date" : { '$gte' : start_date , '$lt': end_date}}, {"_id" : 0, "Name" : 0})
        result = list(id)
        if result == []:
            return JsonResponse({ "Result" : "None"})
        else:
            return JsonResponse({"Result" : result})
        
@api_view(['POST'])
def get_one_commodity(request):
    if request.method == 'POST':
        db = client.newDB
        commodity_collection = db.data_commodity
        
        symbol = request.data.get("Symbol")
        name = request.data.get('Name')
        start_date = request.data.get('Start')
        end_date = request.data.get('End')
        
        if start_date == "":
            start_date = "2022-01-01"
        
        if end_date == "":
            end_date = str(datetime.today())

        id = commodity_collection.find({"Name" : name, "Date" : { '$gte' : start_date , '$lt': end_date}}, {"_id" : 0, "Name" : 0})
        result = list(id)
        if result == []:
            return JsonResponse({ "Result" : "None"})
        else:
            return JsonResponse({"Result" : result})

def get_index_data(name):
    data = fdr.DataReader(name)
    if data.empty:
        return []
    data.index = data.index.strftime('%Y-%m-%d')
    data['Date'] = data.index
    data['Name'] = name
    
    #결측치에 대해서 앞의 값, 뒤의 값으로 채우기
    data = data.fillna(method='ffill')
    data = data.fillna(method='bfill')

    #data = data.to_json(orient='records')
    # data = json.loads(data)
    
    data = data.to_dict('records')
    
    return data

def get_ex_data(name):
    data = fdr.DataReader(name)
    if data.empty:
        return []
    data.index = data.index.strftime('%Y-%m-%d')
    data['Date'] = data.index
    data['Name'] = name
    data['Volume'] = 0.0
    #결측치에 대해서 앞의 값, 뒤의 값으로 채우기
    data = data.fillna(method='ffill')
    data = data.fillna(method='bfill')

    data = data.to_dict('records')

    
    return data

def get_stock_data(symbol, name):
    data = fdr.DataReader(symbol)
    if data.empty:
        return []
    data.index = data.index.strftime('%Y-%m-%d')
    data['Date'] = data.index
    data['Name'] = name 
    data['Code'] = symbol
    
    #결측치에 대해서 앞의 값, 뒤의 값으로 채우기
    data = data.fillna(method='ffill')
    data = data.fillna(method='bfill')

    data = data.to_dict('records')

    
    return data

def get_comm_data(name, code):
    data = fdr.DataReader(code)
    data.index = data.index.strftime('%Y-%m-%d')
    data['Date'] = data.index
    data['Name'] = name
    data['Code'] = code
    #결측치에 대해서 앞의 값, 뒤의 값으로 채우기
    data = data.fillna(method='ffill')
    data = data.fillna(method='bfill')
    
    data = data.to_dict('records')

    
    return data




