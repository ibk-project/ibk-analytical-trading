from django.shortcuts import render

from django.http.response import JsonResponse
from rest_framework.parsers import JSONParser 
from rest_framework import status
import json
 
from index.models import Index
from index.serializers import IndexSerializer
from rest_framework.decorators import api_view

import FinanceDataReader as fdr
import json

from pymongo import MongoClient

client = MongoClient(
        host='mongo',
        port = 27017,
        username = 'IBK',
        password = '1234'
    )


# front에서 code, date보내주기
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


@api_view(['GET'])
def get_data(request):
    if request.method == 'GET':
        db = client.newDB 
        commodity_collection = db.commodities
        commodity_collection.createIndex(
            {
                Date
            }
        )
        '''
        update commodity data
        '''
        
        comm = [('WTI','CL'), ('Brent','LCO'), ('NG','NG'), ##Energy
                ('Corn','ZC'), ('Wheat', 'ZW'), ('Soybean', 'ZS'), ## 농산물
                ('Gold', 'ZG'), ('Silver', 'ZI'), ## 비금속
                ('Copper', 'HG'),('Lead', 'MPB3'), ('Nickel', 'NICKEL'), ('Zinc', 'MZN'), ('Aluminum', 'MAL'), ('Tin', 'TIN') ## 비철금속
                ]
        
        for name, code in comm:
            data = get_comm_data(name, code)
            post_id = commodity_collection.insert_many(data)
        
        # ### Energy 

        # # WTI유 선물(NYMEX), code:CL
        # data = get_comm_data('WTI', 'CL')
        # post_id = commodity_collection.insert_many(data)

        # # 브렌트유 선물(ICE), code:LCO
        # data = get_comm_data('Brent', 'LCO')
        # post_id = commodity_collection.insert_many(data)

        # # 천연가스 선물(NYMEX), code:NG
        # data = get_comm_data('NG', 'NG')
        # post_id = commodity_collection.insert_many(data)
        
        # ### 농산물

        # # 미국 옥수수 선물, code:ZC
        # data = get_comm_data('Corn', 'ZC')
        # post_id = commodity_collection.insert_many(data)

        # # 미국 소맥 선물, code:ZW
        # data = get_comm_data('Wheat', 'ZW')
        # post_id = commodity_collection.insert_many(data)

        # # 미국 대두 선물, code:ZS
        # data = get_comm_data('Soybean', 'ZS')
        # post_id = commodity_collection.insert_many(data)

        # ### 귀금속

        # # 국제 금 선물()
        # data = get_comm_data('Gold', 'ZG')
        # post_id = commodity_collection.insert_many(data)

        # # 국제 은 선물(ICE)
        # data = get_comm_data('Silver', 'ZI')
        # post_id = commodity_collection.insert_many(data)


        # # 국제 백금 선물()

        # # 국제 팔라듐 선물()

        # ### 비철금속

        # # 국제 구리 선물
        # data = get_comm_data('Copper', 'HG')
        # post_id = commodity_collection.insert_many(data)

        # # 국제 납 선물(런던)
        # data = get_comm_data('Lead', 'MPB3')
        # post_id = commodity_collection.insert_many(data)

        # # 국제 니켈 선물(런던)
        # data = get_comm_data('Nickel', 'NICKEL')
        # post_id = commodity_collection.insert_many(data)

        # # 국제 아연 선물(런던)
        # data = get_comm_data('Zinc', 'MZN')
        # post_id = commodity_collection.insert_many(data)

        # # 국제 알루미늄 선물(런던)
        # data = get_comm_data('Aluminum', 'MAL')
        # post_id = commodity_collection.insert_many(data)

        # # 국제 주석 선물(런던)
        # data = get_comm_data('Tin', 'TIN')
        # post_id = commodity_collection.insert_many(data)

        return JsonResponse({"success" : "true"})



def get_comm_data(name, code):
    data = fdr.DataReader(code)
    data.index = data.index.strftime('%Y-%m-%d')
    data['Date'] = data.index
    data['Name'] = name
    data['Code'] = code
    #결측치에 대해서 앞의 값, 뒤의 값으로 채우기
    data = data.fillna(method='ffill')
    data = data.fillna(method='bfill')
    
    data = data.to_json(orient='records')
    data = json.loads(data)
    
    return data




