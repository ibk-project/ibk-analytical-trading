from django.shortcuts import render

from django.http.response import JsonResponse
from rest_framework.parsers import JSONParser 
from rest_framework import status
import json
import csv
from pandas import DataFrame
import numpy as np
import itertools
import FinanceDataReader as fdr
import pandas as pd
import os

from rest_framework.decorators import api_view
from datetime import datetime, timedelta, date
from dateutil.relativedelta import relativedelta

from model.market.feature import FeatureGenerator
from model.market.model import CustomDataset, SimilarPointModel

from model.sector.feature_sector import DataCollector_BySecter
from model.sector.feature_topn import DataCollector_TopN

from model.sector.model_sector import DataClustering_BySecter
from model.sector.model_topn import DataClustering_TopN

'''
market model setup
'''

START_DATE_M = datetime.strptime('2015-01-01', '%Y-%m-%d') # 시작 시점
END_DATE_M = datetime.strptime('2022-11-25', '%Y-%m-%d') # 종료 시점
TRAIN_LENGTH = 60 # 학습 기간
PREDICT_LENGTH_M = 30 # 예측 기간
STRIDE = 1 # 시점 간 간격
TEST_LENGTH = 200
fg = FeatureGenerator(START_DATE_M, END_DATE_M)

feature_path = os.getcwd() + "/model/market/data/" + fg.range + "_feature.csv"
label_path = os.getcwd() + "/model/market/data/" + fg.range + "_label.csv"
result_path = os.getcwd() + "/model/market/result/" + fg.range + "_"



'''
sector model setup
'''

today = datetime.today()
year5ago = (today-relativedelta(years=5))

while year5ago.weekday() != 0: #월요일로 만들기
    year5ago = year5ago + relativedelta(days=1)
    
# START_DATE = year5ago.strftime("%Y-%m-%d") # 주가 수집 기간
# END_DATE = (today-timedelta(days=1)).strftime("%Y-%m-%d") 
START_DATE = '2015-01-01'
END_DATE = '2022-11-25'
START_YEAR = (today-relativedelta(years=7)).strftime("%Y") # 재무제표 수집 기간
# 결산월 12월일 시, 1분기 05/17(05/31), 반기 08/16(08/30), 3분기 11/15(11/29), 사업보고서 03/31
if(int(today.strftime("%m"))>=5):
    END_YEAR = (today-timedelta(days=1)).strftime("%Y")
else:
    END_YEAR = (today-relativedelta(years=1)).strftime("%Y")
    
today = today.strftime("%Y-%m-%d")
print(START_DATE, START_YEAR)
print(END_DATE, END_YEAR)

RANGE = 50
STRIDE = 1

all_sector = [300, 263, 267, 327, 305, 282, 295, 291, 266, 316, 314, 278, 285, 325, 332, 280, 294, 329, 286, 323, 287, 279, 331, 269, 301, 307, 328, 272, 277, 303, 298, 321, 296, 288, 317, 339, 274, 283, 308, 292, 311, 281, 299, 318, 273, 310, 262, 322, 261, 276, 309, 337, 289, 293, 271, 270, 306, 304, 265, 320, 338, 264, 297, 284, 324, 290, 326, 333, 315, 302, 313, 312, 330, 336, 319, 268, 334, 275]

point_path = os.getcwd() + "/model/market/result/" + fg.range + "_100.json"

PATH_STOCK = 'top200_5years_stock.csv'


# Create your views here.

@api_view(['GET'])
def market_feature_collect(request):

    if os.path.isfile(feature_path) and os.path.isfile(label_path):
        print("feature, label file already exists")
    else:
        feature, label = fg.run()
        feature.to_csv(feature_path)
        label.to_csv(label_path)

    return JsonResponse({"result" : "Market data collection finished."}, safe=False)

@api_view(['GET'])
def market_model(request, point_num):

    if os.path.isfile(result_path + str(point_num) + ".json"):
        with open(result_path + str(point_num) + ".json") as f:
            json_data = json.load(f)
        return JsonResponse({"result" : json_data}, safe=False)

    if os.path.isfile(feature_path)==False or os.path.isfile(label_path)==False :
        market_feature_collect()

    feature = pd.read_csv(feature_path, index_col = 0)
    label = pd.read_csv(label_path, index_col = 0)
    print(fg.curr_feature_df.index[-1])
    spm = SimilarPointModel()
    spm.train(feature, label)
    encoded_data, decoded_data = spm.run(feature)
    curr_vector, curr_predict = spm.run(fg.curr_feature_df.iloc[-1])
    last_label = label

    dist = lambda x, y: np.sqrt(np.sum(np.square(x-y)))
    dist_list = []
    for idx, v in enumerate(encoded_data):
        dist_list.append((dist(curr_vector, v), idx))
    dist_list.sort()

    count = 0
    used = set()
    predict = [0 for _ in range(16)]
    similar_points = []
    for _, similar_point in dist_list:
        if similar_point in used: continue
        used.update(range(similar_point - 2, similar_point + 3))
        similar_points.append(last_label.index[similar_point])
        for k in range(16): predict[k] += last_label.iloc[similar_point][k]
        count += 1
        if count >= point_num: break
    predict = list(map(lambda x: x / count, predict))
    
    # 유사시점 예측
    similar = pd.DataFrame([predict[:8]], columns=list(itertools.product(['KS11', 'KQ11'], ['3days', '7days', '15days', '30days'])))
    similar.to_csv(result_path + "_similar.csv")
    # 유사시점 예측 (0, 1)
    similar_boolean = pd.DataFrame([predict[8:]], columns=list(itertools.product(['KS11', 'KQ11'], ['3days', '7days', '15days', '30days'])))
    similar_boolean.to_csv(result_path + "_similar_boolean.csv")
    # 모델 예측
    predict = pd.DataFrame([curr_predict], columns=list(itertools.product(['KS11', 'KQ11', 'IXIC', 'TWII'], ['3days', '7days', '15days', '30days'])))
    predict.to_csv(result_path + "_predict.csv")
    # 유사시점 출력
    result = {}
    result['points'] = similar_points
    with open(result_path + str(point_num) + ".json", 'w') as outfile:
        json.dump(result, outfile)    


    return JsonResponse({"result" : similar_points}, safe=False)

'''
Sector Model Part
'''

@api_view(['GET'])
def sector_feature(request, sector_code):
    df_krx = fdr.StockListing("KRX")
    SECTOR_CODE = sector_code

    dc2 = DataCollector_BySecter(SECTOR_CODE, START_DATE, END_DATE, df_krx)
    sector = dc2.make_sector_data()

    return JsonResponse({"result" : "Sector data collection finished."}, safe=False)

@api_view(['GET'])
def sector_feature_all(request):
    for sector_code in all_sector:
        print(sector_code)
        df_krx = fdr.StockListing("KRX")
        SECTOR_CODE = sector_code

        dc2 = DataCollector_BySecter(SECTOR_CODE, START_DATE, END_DATE, df_krx)
        sector = dc2.make_sector_data()

    return JsonResponse({"result" : "Sector data collection finished."}, safe=False)

@api_view(['GET'])
def sector_feature_topn(request):
    COMPANY_NUM = 200
    stock_list = fdr.StockListing('KRX')
    df_krx = fdr.StockListing("KRX-MARCAP")
    df_krx_top = df_krx.iloc[0:COMPANY_NUM, 0:3]

    dc1 = DataCollector_TopN(START_DATE, END_DATE, START_YEAR, END_YEAR, COMPANY_NUM, df_krx_top)
    dc1.run()

    return JsonResponse({"result" : "Sector TopN data collection finished."}, safe=False)

@api_view(['GET'])
def sector_model(request, sector_code):
    df_krx = fdr.StockListing("KRX")
    SECTOR_CODE = sector_code

    if os.path.isfile(os.getcwd() + "/sector/result/" + str(sector_code) + "_result.csv"):
        csv_data = pd.read_csv(os.getcwd() + "/sector/result/" + str(sector_code) + "_result.csv", sep = ",")
        json_data = csv_data.to_json(orient = "records")
        return json_data

    if os.path.isfile(point_path)==False:
        market_model(100)
    
    with open(point_path, "r") as json_file:
        json_data = json.load(json_file)

    input_dates = json_data['points']
    input_today = '2022-08-12'  # monday start

    if os.path.isfile(os.getcwd() + "/sector/data/" + str(SECTOR_CODE) + "_data.csv")==False:
        sector_feature(SECTOR_CODE)

    sector_dataframe = pd.read_csv(os.getcwd() + "/sector/data/" + str(SECTOR_CODE) + "_data.csv")
    sector_dataframe = sector_dataframe.set_index('Date')
    sector_dataframe.index = pd.to_datetime(sector_dataframe.index)

    ## clustering
    clustering1 = DataClustering_BySecter(SECTOR_CODE, START_DATE, END_DATE, input_dates, input_today, RANGE, STRIDE, sector_dataframe)
    sector_result = clustering1.run()

    return JsonResponse({"result" : "Sector model(sector_code) finished."}, safe=False)

@api_view(['GET'])
def sector_model_all(request):
    df = pd.DataFrame(columns = ['Sector' , 'Today_Date', 'Similar_Dates'])

    if os.path.isfile(os.getcwd() + "/model/sector/result/" + "all" + "_result.csv"):
        csv_data = pd.read_csv(os.getcwd() + "/model/sector/result/" + "all" + "_result.csv", sep = ",")
        json_data = csv_data.to_json(orient = "records")
        return json_data

    if os.path.isfile(point_path)==False:
        market_model(100)

    with open(point_path, "r") as json_file:
        json_data = json.load(json_file)

    input_dates = json_data['points']
    print(input_dates)
    input_today = '2022-11-20'  # monday start

    for sector_code in all_sector:
        print(sector_code)
        df_krx = fdr.StockListing("KRX")
        SECTOR_CODE = sector_code

        if os.path.isfile(os.getcwd() + "/model/sector/data/" + str(SECTOR_CODE) + "_data.csv")==False:
            sector_feature(SECTOR_CODE)

        sector_dataframe = pd.read_csv(os.getcwd() + "/model/sector/data/" + str(SECTOR_CODE) + "_data.csv")
        sector_dataframe = sector_dataframe.set_index('Date')
        sector_dataframe.index = pd.to_datetime(sector_dataframe.index)

        clustering1 = DataClustering_BySecter(SECTOR_CODE, START_DATE, END_DATE, input_dates, input_today, RANGE, STRIDE, sector_dataframe)
        sector_result = clustering1.run()

        df=df.append(sector_result , ignore_index=True)
    
    df.to_csv(os.getcwd() + "/model/sector/data/" + "all" + "_data.csv")
    return JsonResponse({"result" : "Sector model(sector_code) finished."}, safe=False)

@api_view(['GET'])
def sector_model_topn(request):
    with open(point_path, "r") as json_file:
        json_data = json.load(json_file)

    input_dates = json_data['points']
    input_today = '2022-11-20'

    clustering1 = DataClustering_TopN(input_dates, input_today, RANGE, STRIDE, PATH_STOCK)
    clustering1.run_all_sectors()

    return JsonResponse({"result" : "Sector model(sector_code) finished."}, safe=False)