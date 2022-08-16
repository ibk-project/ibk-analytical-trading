from codecs import CodecInfo
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

sector_data = {'반도체와반도체장비': [{'code': '005930', 'name': '삼성전자'},
  {'code': '000660', 'name': 'SK하이닉스'},
  {'code': '005935', 'name': '삼성전자우'},
  {'code': '402340', 'name': 'SK스퀘어'},
  {'code': '058470', 'name': '리노공업'},
  {'code': '000990', 'name': 'DB하이텍'},
  {'code': '005290', 'name': '동진쎄미켐'},
  {'code': '357780', 'name': '솔브레인'},
  {'code': '240810', 'name': '원익IPS'},
  {'code': '064760', 'name': '티씨케이'},
  {'code': '042700', 'name': '한미반도체'}],
 '철강': [{'code': '005490', 'name': 'POSCO홀딩스'},
  {'code': '004020', 'name': '현대제철'}],
 '은행': [{'code': '105560', 'name': 'KB금융'},
  {'code': '055550', 'name': '신한지주'},
  {'code': '323410', 'name': '카카오뱅크'},
  {'code': '086790', 'name': '하나금융지주'},
  {'code': '316140', 'name': '우리금융지주'},
  {'code': '024110', 'name': '기업은행'},
  {'code': '138930', 'name': 'BNK금융지주'},
  {'code': '175330', 'name': 'JB금융지주'},
  {'code': '139130', 'name': 'DGB금융지주'}],
 '석유와가스': [{'code': '096770', 'name': 'SK이노베이션'},
  {'code': '010950', 'name': 'S-Oil'},
  {'code': '267250', 'name': 'HD현대'},
  {'code': '078930', 'name': 'GS'}],
 '화학': [{'code': '051910', 'name': 'LG화학'},
  {'code': '003670', 'name': '포스코케미칼'},
  {'code': '009830', 'name': '한화솔루션'},
  {'code': '011170', 'name': '롯데케미칼'},
  {'code': '011790', 'name': 'SKC'},
  {'code': '011780', 'name': '금호석유'},
  {'code': '010060', 'name': 'OCI'},
  {'code': '014680', 'name': '한솔케미칼'},
  {'code': '051915', 'name': 'LG화학우'},
  {'code': '086520', 'name': '에코프로'},
  {'code': '285130', 'name': 'SK케미칼'},
  {'code': '298050', 'name': '효성첨단소재'},
  {'code': '093370', 'name': '후성'},
  {'code': '004000', 'name': '롯데정밀화학'},
  {'code': '005070', 'name': '코스모신소재'},
  {'code': '120110', 'name': '코오롱인더'},
  {'code': '000210', 'name': 'DL'}],
 '양방향미디어와서비스': [{'code': '035420', 'name': 'NAVER'},
  {'code': '035720', 'name': '카카오'}],
 '복합기업': [{'code': '028260', 'name': '삼성물산'},
  {'code': '034730', 'name': 'SK'},
  {'code': '003550', 'name': 'LG'},
  {'code': '001040', 'name': 'CJ'},
  {'code': '004800', 'name': '효성'}],
 '자동차': [{'code': '005380', 'name': '현대차'},
  {'code': '000270', 'name': '기아'},
  {'code': '005387', 'name': '현대차2우B'},
  {'code': '005385', 'name': '현대차우'},
  {'code': '012330', 'name': '현대모비스'},
  {'code': '018880', 'name': '한온시스템'},
  {'code': '161390', 'name': '한국타이어앤테크놀로지'},
  {'code': '204320', 'name': '만도'},
  {'code': '011210', 'name': '현대위아'},
  {'code': '005850', 'name': '에스엘'}],
 '제약': [{'code': '207940', 'name': '삼성바이오로직스'},
  {'code': '068270', 'name': '셀트리온'},
  {'code': '091990', 'name': '셀트리온헬스케어'},
  {'code': '302440', 'name': 'SK바이오사이언스'},
  {'code': '326030', 'name': 'SK바이오팜'},
  {'code': '028300', 'name': 'HLB'},
  {'code': '000100', 'name': '유한양행'},
  {'code': '128940', 'name': '한미약품'},
  {'code': '068760', 'name': '셀트리온제약'},
  {'code': '008930', 'name': '한미사이언스'},
  {'code': '069620', 'name': '대웅제약'},
  {'code': '006280', 'name': '녹십자'},
  {'code': '237690', 'name': '에스티팜'},
  {'code': '003090', 'name': '대웅'},
  {'code': '019170', 'name': '신풍제약'}],
 '전자전기제품': [{'code': '066570', 'name': 'LG전자'},
  {'code': '373220', 'name': 'LG에너지솔루션'},
  {'code': '006400', 'name': '삼성SDI'},
  {'code': '247540', 'name': '에코프로비엠'},
  {'code': '066970', 'name': '엘앤에프'},
  {'code': '361610', 'name': 'SK아이이테크놀로지'},
  {'code': '278280', 'name': '천보'},
  {'code': '336260', 'name': '두산퓨얼셀'}]}


# front에서 code, date보내주기
@api_view(['GET', 'POST'])
def get_index_front(request):
    if request.method == 'GET':
        code = request.GET['code']
        print(request)
        start_date = request.GET['date']
        end_date = ""
        end_date = request.GET['e_date']
        chart_type = request.GET['type']
        db = client.newDB
        index_collection = db.data_index
        
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
    

@api_view(['GET', 'POST'])
def get_commodity_front(request):
    if request.method == 'GET':
        code = request.GET['code']
        start_date = request.GET['date']
        end_date = request.GET['e_date']
        db = client.newDB
        index_collection = db.data_commodity
        
        if start_date == "":
            start_date = "2000-01-01"
            
        if end_date == "":
            end_date = str(datetime.today())
        
        id = index_collection.find({"Code" : code, "Date" : { '$gte' : start_date , '$lt': end_date}}, {"_id" : 0, "Code" : 0, "High" : 0 , "Volume" : 0, "Change" : 0 , "Low" : 0 , "Open" : 0 })
        result = list(id)
        if result == []:
            return JsonResponse({ "Result" : "None"})
        else:
            return JsonResponse({"data": result})
            
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
        
        # if empty != [] :
        #     file = open('empty_commodity.txt', 'w')
        #     file.write(empty)
        #     file.close
        
        return JsonResponse({"success" : "true"})

@api_view(['GET','POST'])
def get_stock(request):
    if request.method == 'GET':
        db = client.newDB 
        stock_collection = db.data_stock
        start_date = "2022-08-10"
        
        krx = fdr.StockListing('KRX')
        stock = krx[["Symbol","Name"]].values.tolist()
        #kr_etf = fdr.StockListing('ETF/KR')
        #etf = kr_etf[["Symbol","Name"]].values.tolist()
        empty_stock = []
        for symbol, name in stock:
            try:
                data = get_stock_data(symbol, name, start_date)
            except:
                data = []
                empty_stock.append(symbol)
            
            if data == []:
                continue
            post_id = stock_collection.insert_many(data)
            
        # for symbol, name in etf:
        #     try:
        #         data = get_stock_data(symbol, name)
        #     except:
        #         data = []
        #         empty_stock.append(symbol)
                
        #     if data == []:
        #         continue
        #     post_id = stock_collection.insert_many(data)
        
        if empty_stock != [] :
            file = open('empty_stock.txt', 'w')
            file.write(empty_stock)
            file.close
            
        return JsonResponse({"success" : "true", "empty_stock" : empty_stock})
    
@api_view(['GET'])
def get_index_name(request):
    if request.method == 'GET':
        INDEXS_CODE = ['KS11', 'KQ11', 'DJI', 'JP225', 'HK50', 'CSI300', 'DAX']
        INDEXS_NAME = ['KOSPI', 'KOSDAQ', 'Dow Jones', 'Nikkei', 'HONG KONG', 'CSI', 'DAX']
        EMPTY_INDEX = ['IXIC']
        EX_RATE_LIST = ["USD/KRW", "USD/EUR", "USD/JPY", "CNY/KRW", "EUR/USD", "USD/JPY", "JPY/KRW", "AUD/USD", "EUR/JPY", "USD/RUB"]
        
        return JsonResponse({"Index_Code" : INDEXS_CODE , "Index_Name" : INDEXS_NAME})
    
    
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
        start_date = "2022-07-05"
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
    
@api_view(['GET'])
def get_one_index(request):
    if request.method == 'GET':
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
    
@api_view(['GET'])
def get_stocks(request):
    if request.method == 'GET':
        name = request.GET['name']
        code = request.GET['code']
        start_date = request.GET['start_date']
        end_date = request.GET['end_date']
        db = client.newDB
        stock_collection = db.data_stock
        
        if start_date == "":
            start_date = "2012-01-01"
        
        if end_date == "":
            end_date = str(datetime.today())

        id = stock_collection.find({"Code" : code, "Date" : { '$gte' : start_date , '$lt': end_date}}, {"_id" : 0, "Name" : 0, "High" : 0 , "Volume" : 0, "Change" : 0 , "Low" : 0 , "Open" : 0 })
        
        result = list(id)
        if result == []:
            return JsonResponse({ "Result" : "None"})
        else:
            return JsonResponse({"data" : result})
        
@api_view(['GET'])
def get_sector_stock(request):
    if request.method == 'GET':
        sector_name = request.GET['sector_name']
        start_date = request.GET['start_date']
        end_date = request.GET['end_date']
        db = client.newDB
        stock_collection = db.data_stock
        
        sector_list = sector_data[sector_name]
        
        if start_date == "":
            start_date = "2012-01-01"
        
        if end_date == "":
            end_date = str(datetime.today())

        result = []
        for sector in sector_list:
            code = sector["code"]
            name = sector['name']
            id = stock_collection.find({"Code" : code, "Date" : { '$gte' : start_date , '$lt': end_date}}, {"_id" : 0, "Code" : 0 })
            sector_d = {}
            sector_d['name'] = name
            sector_d['code'] = code
            sector_d['stock_data'] = list(id)
            result.append(sector_d) 
            
        if result == []:
            return JsonResponse({ "Result" : "None"})
        else:
            return JsonResponse({"data" : result})

@api_view(['GET'])
def get_sector_list(request):
    if request.method == 'GET':
        db = client.newDB
        stock_collection = db.data_stock

        keys = sector_data.keys()
        result = []
        
        for key in keys:
            tmp = {}
            tmp["sector_name"] = key
            tmp["sector_stocks"] = sector_data[key]
            
            result.append(tmp)
            
        if result == []:
            return JsonResponse({ "data" : "Wrong"})
        else:
            return JsonResponse({"data" : result})


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

def get_stock_data(symbol, name, date):
    data = fdr.DataReader(symbol, date)
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




