import sys
import os
import pandas as pd
import numpy as np
import torch 
import torch.nn as nn
import FinanceDataReader as fdr
import investpy
import matplotlib.pyplot as plt
import math
from datetime import datetime, timedelta, date
import time
from dateutil.relativedelta import relativedelta
import itertools
from functools import reduce
from tqdm.notebook import tqdm
from sklearn.preprocessing import StandardScaler, RobustScaler, MinMaxScaler, MaxAbsScaler
from sklearn.metrics import roc_curve, roc_auc_score

torch.manual_seed(42)
np.random.seed(42)


TRAIN_LENGTH = 60 # 학습 기간
PREDICT_LENGTH = 30 # 예측 기간
STRIDE = 1 # 시점 간 간격

class FeatureGenerator():
    def __init__(self, START_DATE, END_DATE):
        self.start = START_DATE
        self.end = END_DATE
        self.INDEX_NAMES = ['KS11', 'KQ11', 'DJI', 'IXIC', 'N225', 'HSI', 'SSEC', 'GDAXI', '^TWII']
        self.COMMODITY_NAMES = ['BZ=F', 'GC=F', 'HG=F']
        self.BOND_NAMES = ['FRED:T10Y2Y', 'FRED:T10Y3M']
        self.CPI_NAMES = ['CPIAUCSL']
        self.LABEL_NAMES = ['KS11', 'KQ11', 'IXIC', 'TWII']
        self.raw_data_df = pd.DataFrame()
        self.feature_df = pd.DataFrame()
        self.result_df = pd.DataFrame()
        self.label_df = pd.DataFrame()
        self.range = self.start.strftime('%Y-%m-%d') + '_' + self.end.strftime('%Y-%m-%d')

    def collect_data(self):
        # read data
        if os.path.isfile(self.range + '.csv'):
            print('Raw file is already exist in drive')
            self.raw_data_df = pd.read_csv(self.range + '.csv', index_col=0)
            return
            
        # collect
        # index
        raw_index_df = pd.DataFrame()
        for name in self.INDEX_NAMES:
            df = fdr.DataReader(name, self.start - timedelta(days=100), self.end)
            df.columns = df.columns.map(lambda x: name + x)
            raw_index_df = pd.concat([raw_index_df, df], axis=1)
        # commodity
        raw_commodity_df = pd.DataFrame()
        for name in self.COMMODITY_NAMES:
            df = fdr.DataReader(name, self.start - timedelta(days=100), self.end)
            df.columns = df.columns.map(lambda x: name + x)
            raw_commodity_df = pd.concat([raw_commodity_df, df], axis=1)
        # bond diff
        raw_bond_df = pd.DataFrame()
        for name in self.BOND_NAMES:
            df = fdr.DataReader(name, self.start - timedelta(days=100), self.end)
            df.columns = df.columns.map(lambda x: name + x)
            raw_bond_df = pd.concat([raw_bond_df, df], axis=1)
        # cpi
        raw_cpi_df = fdr.DataReader('FRED:CPIAUCSL', self.start - relativedelta(months=20), self.end)
        # dollar index
        df = fdr.DataReader('FRED:DTWEXBGS', self.start - timedelta(days=100), self.end)
        raw_us_dollar_index_df = df.copy()
        # usa VIX
        raw_vix_df = pd.DataFrame()
        df = fdr.DataReader('^VIX', self.start - timedelta(days=100), self.end)
        df.columns = df.columns.map(lambda x: 'USVIX' + x)
        raw_vix_df = pd.concat([raw_vix_df, df], axis=1)
        
        # stretch CPIAUCSL
        cpi_tmp_df = pd.DataFrame()
        pointer = self.start - timedelta(days=100)
        while pointer <= self.end:
            curr_date = pointer - relativedelta(months=1)
            curr = pd.Timestamp(curr_date.year, curr_date.month, 1)
            last_date = pointer - relativedelta(months=13)
            last = pd.Timestamp(last_date.year, last_date.month, 1)
            curr_cpi = raw_cpi_df.loc[curr, 'CPIAUCSL']
            last_cpi = raw_cpi_df.loc[last, 'CPIAUCSL']
            cpi_tmp_df.loc[pointer, 'CPIAUCSL'] = (curr_cpi - last_cpi) / last_cpi
            pointer += timedelta(days=1)
        raw_cpi_df = cpi_tmp_df

        # merge
        dataframes = [raw_index_df, raw_commodity_df, raw_bond_df, raw_cpi_df, raw_us_dollar_index_df, raw_vix_df]
        self.raw_data_df = reduce(lambda left, right: pd.merge(left, right, left_index=True, right_index=True, how='inner'), dataframes)

        # remove NaN
        for name in self.INDEX_NAMES + self.COMMODITY_NAMES:
            self.raw_data_df[name + 'Close'] = (self.raw_data_df[name + 'Close'].fillna(method='ffill') + self.raw_data_df[name + 'Close'].fillna(method='bfill')) / 2
            self.raw_data_df[name + 'High'] = (self.raw_data_df[name + 'High'].fillna(method='ffill') + self.raw_data_df[name + 'High'].fillna(method='bfill')) / 2
            self.raw_data_df[name + 'Low'] = (self.raw_data_df[name + 'Low'].fillna(method='ffill') + self.raw_data_df[name + 'Low'].fillna(method='bfill')) / 2
            self.raw_data_df[name + 'Volume'] = (self.raw_data_df[name + 'Volume'].fillna(method='ffill') + self.raw_data_df[name + 'Volume'].fillna(method='bfill')) / 2
        self.raw_data_df['USVIXClose'] = (self.raw_data_df['USVIXClose'].fillna(method='ffill') + self.raw_data_df['USVIXClose'].fillna(method='bfill')) / 2

        # save data
        self.raw_data_df.to_csv(self.range + '.csv')
    
    def make_feature(self):
        for point in tqdm(range(TRAIN_LENGTH, self.raw_data_df.shape[0]-PREDICT_LENGTH)):
            period = self.raw_data_df.index[point]
            last = self.raw_data_df.iloc[point-TRAIN_LENGTH:point]
            next = self.raw_data_df.iloc[point:point + PREDICT_LENGTH]
            # train
            for name in self.INDEX_NAMES + self.COMMODITY_NAMES:
                self.feature_df.loc[period, name + 'MA' + '1'] = last[name + 'Close'][-1 : ].mean()
                i, p = 2, 1
                while p + i <= TRAIN_LENGTH:
                    p += i
                    self.feature_df.loc[period, name + 'MA' + str(i)] = last[name + 'Close'][-p : -(p-i)].mean()
                    i += 1
                volatility = (last[name + 'High'] - last[name + 'Low']) / ((last[name + 'High'] + last[name + 'Low']) / 2)
                self.feature_df.loc[period, name + 'Volatility'] = (volatility[-TRAIN_LENGTH // 4:].mean() * 2 + volatility.mean()) / 3 * 100
                volume = last[name + 'Volume'].map(lambda x: math.log2(1 if x < 1 else x))
                self.feature_df.loc[period, name + 'Volume'] = (volume[-TRAIN_LENGTH // 4:].mean() * 2 + volume.mean()) / 3 * 100
            self.feature_df.loc[period, 'US10YT-3MT'] = last['FRED:T10Y3MT10Y3M'].mean()
            self.feature_df.loc[period, 'US10YT-2YT'] = last['FRED:T10Y2YT10Y2Y'].mean()
            self.feature_df.loc[period, 'CPIAUCSL'] = last['CPIAUCSL'].mean()
            self.feature_df.loc[period, 'DollarMA'] = last['DollarDTWEXBGS'].mean() 
            # self.feature_df.loc[period, 'KoreaVIX'] = last['KoreaVIXClose'][-1] - last['KoreaVIXClose'][:].mean()
            self.feature_df.loc[period, 'USVIX'] = last['USVIXClose'][-1] - last['USVIXClose'][:].mean()

            # label
            for name in ['KS11', 'KQ11']:
                curr_price = last[name + 'Close'][-1]

                for a in [2, 6, 14, 29]:
                    self.label_df.loc[period, name + str(a + 1) + 'days' + 'Change'] = (next[name + 'Close'][a] - curr_price) / curr_price * 100
            for name in ['KS11', 'KQ11']:
                curr_price = last[name + 'Close'][-1]
                
                for a in [(2, 0.5), (6, 1), (14, 2), (29, 4)]:
                    d = a[0]
                    change = (next[name + 'Close'][d] - curr_price) / curr_price * 100
                    if change > a[1]:
                        val = 1
                    elif change < -a[1]:
                        val = 0
                    else:
                        val = 0.5
                    self.label_df.loc[period, name + str(d + 1) + 'days' + 'Class'] = val

        # remove NaN
        self.feature_df.dropna(how='any', inplace=True)
        self.label_df.dropna(how='any', inplace=True)
        _index = self.feature_df.index.intersection(self.label_df.index)
        self.feature_df = self.feature_df.loc[_index]
        self.label_df = self.label_df.loc[_index]

    def scale_feature(self):
        rb = RobustScaler()
        self.feature_df = pd.DataFrame(rb.fit_transform(self.feature_df), index=self.feature_df.index)
        '''
        a = [
            # quarterMA fullMA Volatility Volume
            [2, 0.5, 5, 0.3], # KS11
            [2, 0.3, 3, 0.25], # KQ11
            [2, 0.5, 3, 0.3], # DJI
            [2, 0.5, 3, 0.3], # IXIC
            [2, 0.5, 3, 0.3], # JP225
            [2, 0.4, 4, 0.3], # HK50
            [2, 0.3, 3, 0.3], # CSI300
            [2, 0.4, 3, 0.3], # DAX
            [2, 0.4, 4, 0.3], # TWII
            [2, 0.4, 1, 0.3], # LCO
            [2, 0.5, 4, 0.3], # ZG
            [2, 0.4, 0.5, 0.3], # HG
        ]
        mm = MinMaxScaler()
        for idx, name in enumerate(self.INDEX_NAMES + self.COMMODITY_NAMES):
            i, p = 1, 0
            while p + i <= TRAIN_LENGTH:
                p += i
                df = self.feature_df[name + 'MA' + str(i)]
                print(df)
                self.feature_df[name + 'MA' + str(i)] = (df - df.median()).map(lambda x: print(name, x, i) (1 / (1 + math.exp(-a[idx][0] * x))) * 2 - 1)
                i += 1
            df = self.feature_df[name + 'Volatility']
            self.feature_df[name + 'Volatility'] = (df - df.median()).map(lambda x: (1 / (1 + math.exp(-a[idx][2] * x))) * 2 - 1)
            df = self.feature_df[name + 'Volume']
            self.feature_df[name + 'Volume'] = (df - df.median()).map(lambda x: (1 / (1 + math.exp(-a[idx][3] * x))) * 2 - 1)
            
        df = self.feature_df['US2YT-3MT']
        self.feature_df['US2YT-3MT'] = 1 - df.map(lambda x: (1 / (1 + math.exp(-2 * x))) * 2 - 1).abs()
        df = self.feature_df['US10YT-3MT']
        self.feature_df['US10YT-3MT'] = 1 - df.map(lambda x: (1 / (1 + math.exp(-2 * x))) * 2 - 1).abs()
        df = self.feature_df['USVIX']
        self.feature_df['USVIX'] = (df - df.median()).map(lambda x: (1 / (1 + math.exp(-1 * x))) * 2 - 1).abs()
        self.feature_df = pd.DataFrame(mm.fit_transform(self.feature_df), columns=self.feature_df.columns)
        '''
        

    def run(self):
        print('Collecting data...')
        self.collect_data()
        print('Making feature...')
        self.make_feature()
        print('Scaling feature...')
        self.scale_feature()

        return self.feature_df, self.label_df