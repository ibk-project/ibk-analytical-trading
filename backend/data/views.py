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


# front에서 code, date보내주기
@api_view(['GET', 'POST'])
def get_index_front(request):
    if request.method == 'GET':
        code = request.GET('code')
        print(request)
        start_date = request.GET.get('date')
        end_date = ""
        chart_type = request.GET.get('type')
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
def get_one_stock(request):
    if request.method == 'GET':
        print(request.GET)
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

        id = stock_collection.find({"Name" : name, "Date" : { '$gte' : start_date , '$lt': end_date}}, {"_id" : 0, "Name" : 0, "High" : 0 , "Volume" : 0, "Change" : 0 , "Low" : 0 , "Open" : 0 })
        
        result = list(id)
        if result == []:
            return JsonResponse({ "Result" : "None"})
        else:
            return JsonResponse({"data" : result})
        
        
@api_view(['GET'])
def get_sector_list(request):
    if request.method == 'GET':
        db = client.newDB
        stock_collection = db.data_stock
        
        sector_data = {'반도체와반도체장비': ['삼성전자',
                    'SK하이닉스',
                    '삼성전자우',
                    'SK스퀘어',
                    '리노공업',
                    'DB하이텍',
                    '동진쎄미켐',
                    '솔브레인',
                    '원익IPS',
                    '티씨케이',
                    '한미반도체'],
                    '철강': ['POSCO홀딩스', '현대제철'],
                    '은행': ['KB금융',
                    '신한지주',
                    '카카오뱅크',
                    '하나금융지주',
                    '우리금융지주',
                    '기업은행',
                    'BNK금융지주',
                    'JB금융지주',
                    'DGB금융지주'],
                    '석유와가스': ['SK이노베이션', 'S-Oil', 'HD현대', 'GS'],
                    '화학': ['LG화학',
                    '포스코케미칼',
                    '한화솔루션',
                    '롯데케미칼',
                    'SKC',
                    '금호석유',
                    'OCI',
                    '한솔케미칼',
                    'LG화학우',
                    '에코프로',
                    'SK케미칼',
                    '효성첨단소재',
                    '후성',
                    '롯데정밀화학',
                    '코스모신소재',
                    '코오롱인더',
                    'DL'],
                    '양방향미디어와서비스': ['NAVER', '카카오'],
                    '복합기업': ['삼성물산', 'SK', 'LG', 'CJ', '효성'],
                    '자동차': ['현대차',
                    '기아',
                    '현대차2우B',
                    '현대차우',
                    '현대모비스',
                    '한온시스템',
                    '한국타이어앤테크놀로지',
                    '만도',
                    '현대위아',
                    '에스엘'],
                    '제약': ['삼성바이오로직스',
                    '셀트리온',
                    '셀트리온헬스케어',
                    'SK바이오사이언스',
                    'SK바이오팜',
                    'HLB',
                    '유한양행',
                    '한미약품',
                    '셀트리온제약',
                    '한미사이언스',
                    '대웅제약',
                    '녹십자',
                    '에스티팜',
                    '대웅',
                    '신풍제약'],
                    '전자전기제품': ['LG전자',
                    'LG에너지솔루션',
                    '삼성SDI',
                    '에코프로비엠',
                    '엘앤에프',
                    'SK아이이테크놀로지',
                    '천보',
                    '두산퓨얼셀']}

        keys = sector_data.keys()
        result = []
        
        for key in keys:
            tmp = {}
            tmp["sector_name"] = key
            tmp["sector_stocks"] = sector_data[key]
            
            result.append(tmp)
            
        if result == []:
            return JsonResponse({ "Data" : "Wrong"})
        else:
            return JsonResponse({"Data" : result})


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




