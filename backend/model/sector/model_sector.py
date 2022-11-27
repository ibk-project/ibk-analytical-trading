import pandas as pd
import pandas_datareader as pdr
import numpy as np
import math
import matplotlib.pyplot as plt
import os
from tqdm.auto import tqdm # progress bar
import FinanceDataReader as fdr

import datetime
from datetime import date
from dateutil.relativedelta import relativedelta
from model.marcap import marcap_data
import time # for sleep

from bs4 import BeautifulSoup # Importing BeautifulSoup class from the bs4 module
import requests as req # Importing the HTTP library

from sklearn.preprocessing import RobustScaler
from sklearn.decomposition import TruncatedSVD, PCA
from sklearn.cluster import AffinityPropagation
from sklearn.metrics import *

class DataClustering_BySecter():
    def __init__(self, SECTOR_CODE, STARTDATE, ENDDATE, input_dates, input_today, input_range, input_stride, sector_dataframe):
        self.SECTOR_CODE = SECTOR_CODE # 네이버 금융 기준 (ex. 307 = 전자제품 등)
        self.STARTDATE = STARTDATE
        self.ENDDATE = ENDDATE
        if (input_today not in input_dates):
            input_dates.insert(0, input_today)
        print(input_today)
        print("inputs are", input_dates)
        self.input_dates = input_dates
        self.input_today = input_today
        self.input_range = input_range
        self.input_stride = input_stride
        # self.input_end_dates = [x.split("~")[1] for x in input_dates]
        self.input_end_dates = input_dates
        print("enddates are", self.input_end_dates)
        self.sector_dataframe = sector_dataframe # sector collector로 만든 기본 데이터 dataframe

    # 위 top N 개 clustering과 동일
    def find_sector_similar_points(self, STARTDATE, RANGE, STRIDE, ENDDATE, sector_dataframe):
        start_date = datetime.datetime.strptime(STARTDATE, '%Y-%m-%d')
        end_point = datetime.datetime.strptime(STARTDATE, '%Y-%m-%d') + datetime.timedelta(days=RANGE)
        last_date = datetime.datetime.strptime(ENDDATE, '%Y-%m-%d') 
        last_period = 0
        # - datetime.timedelta(days=1)
        data_df = pd.DataFrame()
        while end_point <= last_date:
            if(end_point.strftime('%Y-%m-%d') in self.input_end_dates):
                start_point = end_point - datetime.timedelta(days=1) * (RANGE - 1)
                temp_df = sector_dataframe[sector_dataframe.index.isin([start_point + datetime.timedelta(days=1) * i for i in range(RANGE)])]
                temp_df2 = sector_dataframe[sector_dataframe.index.isin([start_point - datetime.timedelta(days=39) + datetime.timedelta(days=1) * i for i in range(RANGE+39)])] # for McClellan Oscillator
                period = start_point.strftime('%Y-%m-%d') + '~' + end_point.strftime('%Y-%m-%d')
                print(period)
                new_row = []
                
                data_df.loc[period, 'momentum_month'] = (temp_df.iloc[-1]['Close_Total'] - temp_df.iloc[0]['Close_Total']) / temp_df.iloc[0]['Close_Total']
                data_df.loc[period, 'momentum_week'] = (temp_df.iloc[-1]['Close_Total'] - temp_df.iloc[-7]['Close_Total']) / temp_df.iloc[-7]['Close_Total']
                data_df.loc[period, 'volume'] = math.log10(temp_df['Volume_Total'].sum()/len(temp_df['Volume_Total']))
                data_df.loc[period, 'vol_momentum'] = (temp_df.iloc[-1]['Volume_Total'] - temp_df.iloc[0]['Volume_Total']) / temp_df.iloc[0]['Volume_Total'] # volume momentum
                data_df.loc[period, 'vol_weighted'] = sum(list(map(lambda x, i : x*i, temp_df['Volume_Total'][-7:], range(7))))
                # McClellan Oscillator of lastdate - firstdate in the period (mo momentum)
                if (end_point - datetime.timedelta(days=46) < start_date): # until 39+7 days to last day on data
                    data_df.loc[period, 'mo_week'] = 0 
                else:
                    firstday_mo = sum(list(map(lambda a, b : a - b, temp_df2["adv"][-26:-7], temp_df2["red"][-26:-7])))/19 - sum(list(map(lambda a, b : a - b, temp_df2["adv"][-46:-7], temp_df2["red"][-46:-7])))/39
                    lastday_mo = sum(list(map(lambda a, b : a - b, temp_df2["adv"][-19:], temp_df2["red"][-19:])))/19 - sum(list(map(lambda a, b : a - b, temp_df2["adv"][-39:], temp_df2["red"][-39:])))/39
                    data_df.loc[period, 'mo_week'] = lastday_mo - firstday_mo

                if (start_point - datetime.timedelta(days=39) < start_date): # until 39 days to first day on data
                    data_df.loc[period, 'mo_month'] = 0 
                else:
                    firstday_mo = sum(list(map(lambda a, b : a - b, temp_df2["adv"][19:39], temp_df2["red"][19:39])))/19 - sum(list(map(lambda a, b : a - b, temp_df2["adv"][:39], temp_df2["red"][:39])))/39
                    lastday_mo = sum(list(map(lambda a, b : a - b, temp_df2["adv"][-19:], temp_df2["red"][-19:])))/19 - sum(list(map(lambda a, b : a - b, temp_df2["adv"][-39:], temp_df2["red"][-39:])))/39
                    data_df.loc[period, 'mo_month'] = lastday_mo - firstday_mo

                data_df.loc[period, 'changes_abs'] = temp_df['Changes_abs_Total'].sum()/len(temp_df['Changes_abs_Total'])
                if(temp_df["Changes_Total"][-7:].isnull().values.any()):
                    if(last_period==0):
                        data_df.loc[period, 'changes_weighted'] = 0
                    else:
                        data_df.loc[period, 'changes_weighted'] = data_df.loc[last_period, 'changes_weighted']
                else:
                    data_df.loc[period, 'changes_weighted'] = sum(list(map(lambda x, i : x*i, temp_df['Changes_Total'][-7:], range(7)))) # higher weight on closer dates changes, recent 7 days

                last_period = period
            end_point += datetime.timedelta(days=STRIDE)

            
        m = data_df.to_numpy()
        print(m)
        rob = RobustScaler()
        rob_data = rob.fit_transform(m)
        tsvd = TruncatedSVD(n_components=3)
        m_tsvd = tsvd.fit_transform(rob_data)
        
        return_data = []
        AP = AffinityPropagation(preference=-20).fit(m_tsvd)
        cluster_centers_indices = AP.cluster_centers_indices_
        labels = AP.labels_
        n_clusters_ = len(cluster_centers_indices)
        print("n_clusters", n_clusters_)
        plt.scatter(x=m_tsvd[:,0], y=m_tsvd[:,1], c=labels)
        return_data.append(n_clusters_)
        return_data.append(silhouette_score(m_tsvd, labels, metric='sqeuclidean'))
        
        #같은 그룹의 날짜들 넣기
        similar_dates = []
        TEMP_TODAY = -1
        label_now = labels[TEMP_TODAY]
        print("labels are", labels)
        print("label now is", label_now)
        return_data.append(data_df.index[labels.size + TEMP_TODAY])
        
         # 현재 label과 똑같은 이어진 최근 label들 제외
        counter = 0
        for i in range(labels.size + TEMP_TODAY, -1, -1): # 최근 날짜부터
            if counter == 0:
                if labels[i] != label_now: # 현재  label과 다른 label 출현
                    counter = 1 
            else:
                if labels[i] == label_now:
                    similar_dates.append(data_df.index[i])
                    
        return_data.append(similar_dates)
        return_df = pd.DataFrame([return_data], columns=['Cluster Nums', 'Silhouette Coefficient', 'Today Date', 'Similar Dates'])
        return return_df
    
    def run(self):
        return_df = self.find_sector_similar_points(self.STARTDATE, self.input_range, self.input_stride, self.ENDDATE, self.sector_dataframe)
        
        url = "https://finance.naver.com/sise/sise_group_detail.naver?type=upjong&no="+str(self.SECTOR_CODE)
        Web = req.get(url)
        sectorname = BeautifulSoup(Web.text, 'lxml').find('title').contents[0].split(" :")[0]

        return_df.to_csv(os.getcwd() + "/routes/sector/result/" + str(self.SECTOR_CODE) + "_result.csv")
        return {
            "Sector" : sectorname,
            "Today_Date" : return_df.iloc[0]['Today Date'],
            "Similar_Dates" : return_df.iloc[0]['Similar Dates']
        }