from codecs import CodecInfo
from django.shortcuts import render

from django.http.response import JsonResponse, HttpResponse
from numpy import empty
from pkg_resources import empty_provider
from rest_framework.parsers import JSONParser 
from rest_framework import status
import json
 
from index.models import Index
from index.serializers import IndexSerializer
from rest_framework.decorators import api_view

import FinanceDataReader as fdr
import pandas as pd
import json
import os

from pymongo import MongoClient
from datetime import date, datetime

client = MongoClient(
        host='3.36.47.174',
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
 {'code': '336260', 'name': '두산퓨얼셀'}],
  '비철금속': [{'code': '018470', 'name': '조일알미늄'}, # 322
  {'code': '032560', 'name': '황금에스티'},
  {'code': '004560', 'name': '현대비앤지스틸'},
  {'code': '396300', 'name': '세아메카닉스'},
  {'code': '014580', 'name': '태경비케이'},
  {'code': '128660', 'name': '피제이메탈'},
  {'code': '058430', 'name': '포스코스틸리온'},
  {'code': '081150', 'name': '티플랙스'},
  {'code': '037760', 'name': '쎄니트'},
  {'code': '054410', 'name': '케이피티유'},
  {'code': '075970', 'name': '동국알앤에스'},
  {'code': '037370', 'name': 'EG'},
  {'code': '000480', 'name': '조선내화'},
  {'code': '009190', 'name': '대양금속'},
  {'code': '009730', 'name': '코센'},
  {'code': '012800', 'name': '대창'},
  {'code': '060480', 'name': '국일신동'},
  {'code': '006110', 'name': '삼아알미늄'},
  {'code': '124500', 'name': '아이티센'},
  {'code': '058450', 'name': '일야'},
  {'code': '177830', 'name': '파버나인'},
  {'code': '005810', 'name': '풍산홀딩스'},
  {'code': '021050', 'name': '서원'},
  {'code': '079170', 'name': '한창산업'},
  {'code': '081000', 'name': '일진다이아'},
  {'code': '103140', 'name': '풍산'},
  {'code': '010040', 'name': '한국내화'},
  {'code': '025820', 'name': '이구산업'},
  {'code': '009620', 'name': '삼보산업'},
  {'code': '001560', 'name': '제일연마'},
  {'code': '024090', 'name': '디씨엠'},
  {'code': '010130', 'name': '고려아연'},
  {'code': '008355', 'name': '남선알미우'},
  {'code': '069460', 'name': '대호에이엘'}],
  '화장품': [{'code': '078520', 'name': '에이블씨엔씨'},
  {'code': '237880', 'name': '클리오'},
  {'code': '217480', 'name': '에스디생명공학'},
  {'code': '226320', 'name': '잇츠한불'},
  {'code': '080530', 'name': '코디'},
  {'code': '003350', 'name': '한국화장품제조'},
  {'code': '090430', 'name': '아모레퍼시픽'},
  {'code': '192820', 'name': '코스맥스'},
  {'code': '123330', 'name': '제닉'},
  {'code': '016100', 'name': '리더스코스메틱'},
  {'code': '123690', 'name': '한국화장품'},
  {'code': '090435', 'name': '아모레퍼시픽우'},
  {'code': '092730', 'name': '네오팜'},
  {'code': '263920', 'name': '휴엠엔씨'},
  {'code': '138360', 'name': '협진'},
  {'code': '265740', 'name': '엔에프씨'},
  {'code': '069110', 'name': '코스온'},
  {'code': '025620', 'name': '제이준코스메틱'},
  {'code': '051900', 'name': 'LG생활건강'},
  {'code': '226340', 'name': '본느'},
  {'code': '002790', 'name': '아모레G'},
  {'code': '00279K', 'name': '아모레G3우(전환)'},
  {'code': '018290', 'name': '브이티지엠피'},
  {'code': '083660', 'name': 'CSA 코스믹'},
  {'code': '114840', 'name': '아이패밀리에스씨'},
  {'code': '159910', 'name': '스킨앤스킨'},
  {'code': '241710', 'name': '코스메타코리아'},
  {'code': '002795', 'name': '아모레G우'},
  {'code': '260930', 'name': '씨티케이'},
  {'code': '051905', 'name': 'LG생활건강우'},
  {'code': '900310', 'name': '컬러레이'},
  {'code': '032940', 'name': '원익'},
  {'code': '168330', 'name': '내츄럴엔도텍'},
  {'code': '161890', 'name': '한국콜마'},
  {'code': '019660', 'name': '글로본'},
  {'code': '024720', 'name': '한국콜마홀딩스'},
  {'code': '018700', 'name': '바른손'},
  {'code': '352480', 'name': '씨앤씨인터내셔널'},
  {'code': '086710', 'name': '선진뷰티사이언스'},
  {'code': '126560', 'name': '현대퓨처넷'},
  {'code': '027050', 'name': '코리아나'},
  {'code': '018250', 'name': '애경산업'},
  {'code': '950140', 'name': '잉글우드랩'}, #266
  {'code': '900300', 'name': '오가닉티코스메틱'},
  {'code': '252500', 'name': '세화피앤씨'},
  {'code': '052260', 'name': '현대바이오랜드'},
  {'code': '014100', 'name': '메디앙스'},
  {'code': '219550', 'name': '디와이디'},
  {'code': '082660', 'name': '코스나인'},
  {'code': '214260', 'name': '라파스'},
  {'code': '244460', 'name': '올리패스'},
  {'code': '214420', 'name': '토니모리'},
  {'code': '227610', 'name': '아우딘퓨쳐스'},
  {'code': '048410', 'name': '현대바이오'}],
  '부동산': [{'code': '', 'name': ''}, # 280
  {'code': '', 'name': ''},
  ],
  '우주항공과국방': [{'code': '', 'name': ''}, #284
  {'code': '', 'name': ''},
  ]}

# front에서 code, date보내주기
@api_view(['GET', 'POST'])
def get_index_front(request):
    if request.method == 'GET':
        code = request.GET['code']
        
        start_date = request.GET['date']
        end_date = ""
        try:
            end_date = request.GET['e_date']
        except:
            end_date =""    
        
        chart_type = request.GET['type']
        db = client.newDB
        index_collection = db.data_index
        
        if start_date == "":
            start_date = "2000-01-01"
            
        if end_date == "" or end_date == None:
            print(end_date)
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
        end_date = ""
        try:
            end_date = request.GET['e_date']
        except:
            end_date =""    
        db = client.newDB
        index_collection = db.data_commodity
        
        if start_date == "":
            start_date = "2000-01-01"
            
        if end_date == "" or end_date == None:
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
def get_sector_avg(request):
    if request.method == 'GET':
        start_date = request.GET['start_date']
        end_date = request.GET['end_date']
        sector_name = request.GET['sector_name']
        
        db = client.newDB
        stock_collection = db.data_stock
        
        if start_date == "":
            start_date = "2012-01-01"
        
        if end_date == "":
            end_date = str(datetime.today())
        
        result = {}
        
        df = pd.DataFrame()
        date_list = pd.date_range(start = start_date, end = end_date, freq='D').astype(str)
        df['Date'] = date_list
        df = df.set_index('Date')
        for stock  in sector_data[sector_name]:
            print(stock)
            code = stock["code"]
            id = stock_collection.find({"Code" : code, "Date" : { '$gte' : start_date , '$lt': end_date}}, {"_id" : 0, "Name" : 0, "High" : 0 , "Volume" : 0, "Change" : 0 , "Low" : 0 , "Open" : 0 , "Code" : 0 })
            tmp = pd.DataFrame(list(id))
            tmp.rename(columns = {'Close' : stock["name"] + 'Close'}, inplace=True)
            tmp = tmp.set_index('Date')
            df = df.join(tmp)
        df = df.dropna(how = 'all')
        df['sum'] = df.sum(axis = 1)
        df['sum'] = df['sum'] / len(sector_data[sector_name])
        t_tmp = pd.DataFrame(df['sum'].values.tolist()) 
        t_tmp.index = list(df.index.values)
        result[sector_name] = t_tmp.to_dict('index')
        
        if result == []:
            return JsonResponse({ "Result" : "None"})
        else:
            return JsonResponse({"data" : result})
        
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


#Market similar_dates data
@api_view(['GET'])
def get_market_model(request):
    if request.method == 'GET':
        model_data = os.path.join(os.path.dirname(__file__),'files/', '2015-01-01_2022-08-12_100.json')
        try:
            with open(model_data) as f:
                json_data = json.load(f)
            return JsonResponse({"Result" : json_data})
        except:
            return JsonResponse({"Data" : "None"})

#Sector similar_dates data
@api_view(['GET'])
def get_sector_model(request, sector_code):
    if request.method == 'GET':

        sector_data = os.path.join(os.path.dirname(__file__), 'files/', str(sector_code) + '_result.csv')

        try:
            model_data = pd.read_csv(sector_data, header=0, index_col=0)
            json_data = model_data.to_json(orient="records")
            return HttpResponse(json_data)
        except:
            return JsonResponse({"Data" : "None"})

#News title data
@api_view(['GET'])
def get_news_feature(request):
    if request.method == 'GET':
        news_data = os.path.join(os.path.dirname(__file__),'files/', 'news_keyword.json')
        try:
            with open(news_data, encoding='UTF-8-sig') as f:
                json_data = json.load(f)
                json_data = json.dumps(json_data, ensure_ascii = False)
            return HttpResponse(json_data)
        except:
            return JsonResponse({"Data" : "None"})

