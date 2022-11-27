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


class DataCollector_BySecter():
    def __init__(self, SECTOR_CODE, START_DATE, END_DATE, df_krx):
        self.SECTOR_CODE = SECTOR_CODE # 네이버 금융 기준 (ex. 307 = 전자제품 등)
        self.START_DATE = START_DATE
        self.END_DATE = END_DATE
        self.new_df = pd.DataFrame()
        self.df_krx = df_krx
    
    def make_sector_data(self):
        url = "https://finance.naver.com/sise/sise_group_detail.naver?type=upjong&no="+str(self.SECTOR_CODE)
        # 섹터 주식 정보 가져와서 가공
        sector_table = pd.read_html(url, encoding="cp949")
        sector_stocks = sector_table[2].dropna(how="all").dropna(axis=1, how="all")
        sector_stocks["종목명"] = sector_stocks["종목명"].str.replace("*","")
        sector_stocks["종목명"] = sector_stocks["종목명"].str.strip()
        
        # 종목 번호 합치기
        df_krx = self.df_krx
        sector_stocks["종목번호"] = np.nan
        sector_stocks["종목번호"] = sector_stocks["종목번호"].astype(str)
        counter = 0
        for name in tqdm(sector_stocks["종목명"], desc='adding symbols to original dataframe'):
            counter += 1
            if (name in df_krx.values):
                symbol = df_krx.loc[df_krx['Name'] == name]["Code"].values[0]
                sector_stocks.at[counter, "종목번호"] = symbol

        # 주식 데이터 총합 계산해서 날짜에 따른 섹터 정보 표 만들기
        sector_dataframe = pd.DataFrame(columns=['Date', 'Open_Total', 'Close_Total', 'Volume_Total', 'Changes_abs_Total', 'Changes_Total', 'adv', 'red', 'stock_num'])
        for i in tqdm(sector_stocks["종목번호"], desc='Calculating each stocks'):
            temp_df = fdr.DataReader(i, self.START_DATE, self.END_DATE)
            for j in temp_df.index:
                if j in sector_dataframe["Date"].values:
                    # add open_total, close_total and volume_total to the row with j date
                    temp_series = temp_df.loc[j]
                    temp_index = sector_dataframe.loc[sector_dataframe["Date"] == j].index[0]
                    sector_dataframe.at[temp_index, "Open_Total"] += temp_series['Open']
                    sector_dataframe.at[temp_index, "Close_Total"] += temp_series['Close']
                    sector_dataframe.at[temp_index, "Volume_Total"] += temp_series['Volume']
                    sector_dataframe.at[temp_index, "Changes_abs_Total"] += abs(temp_series['Change']) # 주가 변화량 절댓값의 합
                    sector_dataframe.at[temp_index, "Changes_Total"] += (temp_series['Change']) # 주가 변화량의 합
                    sector_dataframe.at[temp_index, "stock_num"] += 1
                    if (temp_series['Change']>0):
                        sector_dataframe.at[temp_index, "adv"] += 1  # advance 상승한 주식
                    elif (temp_series['Change']<0):
                        sector_dataframe.at[temp_index, "red"] += 1 # reduce/decline 하락한 주식
                else: 
                    # add new row with j date into sector_dataframe
                    temp_series = temp_df.loc[j]
                    if(temp_series['Change'] == 0):
                        sector_dataframe = sector_dataframe.append({'Date' : j, 'Open_Total' : temp_series['Open'], 'Close_Total' : temp_series['Close'], 'Volume_Total' : temp_series['Volume'], 'Changes_abs_Total' : abs(temp_series['Change']), 'Changes_Total' : temp_series['Change'], 'adv' : 0, 'red' : 0, 'stock_num':1}, ignore_index = True)
                    elif(temp_series['Change']>0):
                        sector_dataframe = sector_dataframe.append({'Date' : j, 'Open_Total' : temp_series['Open'], 'Close_Total' : temp_series['Close'], 'Volume_Total' : temp_series['Volume'], 'Changes_abs_Total' : abs(temp_series['Change']), 'Changes_Total' : temp_series['Change'], 'adv' : 1, 'red' : 0, 'stock_num':1}, ignore_index = True)
                    else:
                        sector_dataframe = sector_dataframe.append({'Date' : j, 'Open_Total' : temp_series['Open'], 'Close_Total' : temp_series['Close'], 'Volume_Total' : temp_series['Volume'], 'Changes_abs_Total' : abs(temp_series['Change']), 'Changes_Total' : temp_series['Change'], 'adv' : 0, 'red' : 1, 'stock_num':1}, ignore_index = True)
                        
        # 섹터 내 포함 종목 리스트 csv
        data = {'Name': sector_stocks["종목명"].tolist(),
                'Code': sector_stocks["종목번호"].tolist()}
        sector_stock_names = pd.DataFrame(data)
        
        Web = req.get(url)
        sectorname = BeautifulSoup(Web.text, 'lxml').find('title').contents[0].split(" :")[0]

        
        sector_dataframe = sector_dataframe.set_index('Date')
        sector_dataframe.index = pd.to_datetime(sector_dataframe.index)
        
        sector_dataframe.to_csv(os.getcwd() + "/routes/sector/data/" + str(self.SECTOR_CODE) + '_data.csv')
        sector_stock_names.to_csv(os.getcwd() + "/routes/sector/data/" + str(self.SECTOR_CODE) +'_stock_names.csv')
        
        return sector_dataframe