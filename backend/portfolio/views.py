from django.shortcuts import render
from django.http.response import JsonResponse
from numpy import empty
from pkg_resources import empty_provider
from rest_framework.parsers import JSONParser 
from rest_framework import status

from rest_framework.decorators import api_view

import FinanceDataReader as fdr
import yfinance as yf
import json

import pandas as pd
import numpy as np
import math
import datetime
from datetime import timedelta
from scipy.optimize import minimize
import csv
from urllib import parse
import os
import bt
import matplotlib.pyplot as plt


kscsv = os.path.join(os.path.dirname(__file__), 'kospi-1.csv')
kqcsv = os.path.join(os.path.dirname(__file__), 'kosdaq-1.csv')
unemploycsv = os.path.join(os.path.dirname(__file__), 'unemploy.csv')
#d = pd.DataFrame()
class Backtest:
    now = '0000-00-00'
    result_data = pd.DataFrame()
    nn = 0

    def __init__(self, stocks, today, period=30, stock_bond=[0.6,0.4], input_rebal_period='week', user_w=0, user_input_sb=[] , user_input_s=[]):
        self.PrintInfo = self.PrintInfo
        Backtest.now = today[0]
        Backtest.nn = len(stocks)
        self.stocks = stocks
        self.today = today
        self.period = period
        self.stock_bond = stock_bond
        self.input_rebal_period = input_rebal_period
        self.user_w = user_w
        self.user_input_sb = user_input_sb
        self.user_input_s = user_input_s

    def addDate(self, date, r):    
        return (datetime.datetime.strptime(date, '%Y-%m-%d') + timedelta(days=r)).strftime('%Y-%m-%d')

    def cummax(self, nums):
        cum = []
        n_max = 0
        for x in nums:
            if x > n_max:
                n_max = x
            cum.append(n_max)
        return cum

    class PrintInfo(bt.Algo):

        def __init__(self, fmt_string="{name} {now}"):
            super().__init__()
            self.fmt_string = fmt_string

        def addDate(self, date, r):
            return (datetime.datetime.strptime(date, '%Y-%m-%d') + timedelta(days=r)).strftime('%Y-%m-%d')

        def __call__(self, target):
            #print(self.fmt_string.format(**target.__dict__))
            Backtest.result_data.loc[self.addDate(Backtest.now,1),target.__dict__['name']] = target.__dict__['_price']
            Backtest.now = str(target.__dict__['now'])[0:10]
            return True

    class WeighSpecified(bt.Algo):

        def __init__(self, weight):
            super().__init__()
            self.weight = weight

        def __call__(self, target):
            # added copy to make sure these are not overwritten
            target.temp["weights"] = dict(self.weight.loc[Backtest.now,:])

            return True

    def __call__(self):
        log = bt.AlgoStack(
                bt.algos.RunDaily(),
                self.PrintInfo('{name}:{now}. Value:{_value:0.0f}, Price:{_price:0.4f}'),
                bt.algos.PrintRisk()
                )
        # Data
        
        KOSPI = pd.read_csv(kscsv,
                            parse_dates=['Unnamed: 0'],
                            index_col=0)
        KOSPI.index = pd.to_datetime(KOSPI.index.astype(str), format='%Y-%m-%d')

        KOSDAQ = pd.read_csv(kqcsv,
                            parse_dates=['Unnamed: 0'],
                            index_col=0)
        KOSDAQ.index = pd.to_datetime(KOSDAQ.index.astype(str), format='%Y-%m-%d')

        df = pd.concat([KOSPI,KOSDAQ],axis=1)
        df = df.fillna(0)
        
        unemploy = pd.read_csv(unemploycsv,
                               index_col=0,
                               encoding='cp949')
        unemploy.dropna(inplace=True)
        unemploy.columns = list(map(lambda x : f'{x[0:4]}-{x[4:6]}' , unemploy.columns))
        unemploy.index = ['unemploy']
        unemploy = unemploy.T

        # exchange = fdr.DataReader('USD/KRW','2015','2022-07-15')['Close']
        exchange = yf.download('USDKRW=X',start='2015-01-01', end='2022-07-15')['Close']
        # tlt = fdr.DataReader('TLT','2015','2022-07-15')['Close'] # 미국 장기채 ETF
        tlt = yf.download('TLT', start = '2015-01-01', end = '2022-07-15')['Close']
        #지금 필요없음 gold = fdr.DataReader('132030','2015')['Close'] # KODEX 골드선물(H)
        
        #gold.columns = ['gold']

        unemploy_roll = unemploy.rolling(12).mean()[12:]
        unemploy_roll.columns = ['unemploy_roll']
        unemploy = unemploy[12:]
        print('qwer')
        # 실업률 데이터 일별로 증폭
        unem = pd.DataFrame(index=df.index,columns=['unemploy'])
        unem_roll = pd.DataFrame(index=df.index,columns=['unemploy_roll'])
        
        for i in df.index[0:-15]:
            unem.loc[i] = unemploy.loc[str(i)[:7],'unemploy']
            unem_roll.loc[i] = unemploy_roll.loc[str(i)[:7],'unemploy_roll']

        df_rolling = df.rolling(200).mean()
        df_rolling.dropna(inplace=True)

        exchange = exchange[exchange.index.isin(df.index)]
        tlt = tlt[tlt.index.isin(df.index)]

        bond = exchange * tlt
        bond.dropna(inplace=True)
        bond.columns = ['bond']
        df = pd.concat([df,bond],axis=1) # df['bond'] = bond
        df.columns = df.columns[:-1].append(pd.Index(['bond']))

        rebal_period = {
            'week': bt.algos.RunWeekly(),
            'month': bt.algos.RunMonthly(),
            'quarter': bt.algos.RunQuarterly(),
            'year': bt.algos.RunYearly()
        }
        #print("index in ")
        # 해당 종목의 데이터만 추출
        
        d = pd.DataFrame()
        # 주가
        for i in range(len(self.today)):
            neww = df.loc[self.today[i]:self.addDate(self.today[i],self.period), self.stocks[i]]
            d[self.stocks[i]] = neww.reset_index(drop=True)

        # 주가 200 rolling
        for i in range(len(self.today)):
            neww = df_rolling.loc[self.today[i]:self.addDate(self.today[i],self.period), self.stocks[i]]
            d['roll'+self.stocks[i]] = neww.reset_index(drop=True)

        # 채권
        for i in range(len(self.today)):
            
            b = df.loc[self.today[i]:self.addDate(self.today[i],self.period), 'bond'].reset_index(drop=True)
            #print(b) 
            for j in range(len(b)-1):
                if np.isnan(b[0]):
                    b[0] = b[1]
                if np.isnan(b[j]):
                    b[j] = (b[j-1] + b[j+1])/2
            if np.isnan(b[len(b)-1]): 
                b[len(b)-1] = b[len(b)-2]
            d['bond'+self.stocks[i]] = b 

        '''
        # 종목별 실업률
        for i in range(len(self.today)):
            un = unem.loc[self.addDate(self.today[i],-30):self.addDate(self.today[i],self.period-30), 'unemploy'].reset_index(drop=True)
            for j in range(len(un)-1):
                if np.isnan(un[0]):
                    un[0] = un[1]
                if np.isnan(un[j]):
                    un[j] = (un[j-1] + un[j+1])/2
            if np.isnan(un[len(un)-1]):
                un[len(un)-1] = un[len(un)-2]
            d['unem'+self.stocks[i]] = un

        # 종목별 실업률 rolling
        for i in range(len(self.today)):
            un = unem_roll.loc[self.today[i]:self.addDate(self.today[i],self.period), 'unemploy_roll'].reset_index(drop=True)
            for j in range(len(un)-1):
                if np.isnan(un[0]):
                    un[0] = un[1]
                if np.isnan(un[j]):
                    un[j] = (un[j-1] + un[j+1])/2
            if np.isnan(un[len(un)-1]):
                un[len(un)-1] = un[len(un)-2]
            d['unem_roll'+self.stocks[i]] = un

        # 종목별 실업률 rolling
        for i in range(len(self.today)):
            g = gold.loc[self.today[i]:self.addDate(self.today[i],self.period)].reset_index(drop=True)
            for j in range(len(g)-1):
                
                if np.isnan(g[0]):
                    g[0] = g[1]
                if np.isnan(g[j]):
                    g[j] = (g[j-1] + g[j+1])/2
            if np.isnan(un[len(un)-1]):
                un[len(g)-1] = g[len(g)-2]
            d['gold'+self.stocks[i]] = g

        d.index = list(map(lambda x: datetime.datetime.strptime(self.addDate(self.today[0],int(str(x))), "%Y-%m-%d"), d.index))
        d.dropna(inplace=True)
        '''
        # 가중치 설정
        w = self.user_input_s
        if len(self.user_input_sb) != 0:
            self.stock_bond = self.user_input_sb

        # 주식60 채권40
        col_bond = ['bond'+ x for x in self.stocks]
        #col_gold = ['gold'+x for x in self.stocks]
        col64 = self.stocks + col_bond

        new_w = pd.Series(index=col64)

        new_w[:Backtest.nn] = (np.array(w)*self.stock_bond[0]).tolist()
        new_w[Backtest.nn:] = (np.array(w)*self.stock_bond[1]).tolist()

        # 동적
        '''
        col_dy = self.stocks + col_bond + col_gold
        laa_w = pd.DataFrame(index=d.index, columns=col_dy)
        good = True
        up = True
        
        #print("index in ")
        
        for i in d.index:
            i = str(i)[:10]
            for j in range(len(self.stocks)):
                if d.loc[i,'unem'+self.stocks[j]] > d.loc[i,'unem_roll'+self.stocks[j]] : # 불황기
                    good = False
                if d.loc[i,self.stocks[j]] < d.loc[i,'roll'+self.stocks[j]]:
                    up = False
                if good | up: # 주식 50
                    laa_w.loc[i, self.stocks] = [x * 0.5 for x in w]
                    laa_w.loc[i, col_bond] = [x * 0.25 for x in w]
                    laa_w.loc[i, col_gold] = [x * 0.25 for x in w]
                else: # 채권 50
                    laa_w.loc[i, self.stocks] = [x*0.25 for x in w]
                    laa_w.loc[i, col_bond] = [x*0.5 for x in w]
                    laa_w.loc[i, col_gold] = [x*0.25 for x in w]
        '''
        
        weight2 = new_w.copy()
        portfolio_2 = bt.AlgoStack(
                            rebal_period['week'],
                            bt.algos.SelectThese(col64),
                            bt.algos.WeighSpecified(**weight2),
                            bt.algos.Rebalance()
                        )
        p2 = bt.Strategy('portfolio 2', [bt.algos.Or([log, portfolio_2])])
<<<<<<< HEAD
        d.index = list(map(lambda x: datetime.datetime.strptime(self.addDate('2015-01-01',x), '%Y-%m-%d'), d.index))
=======

        d.index = list(map(lambda x: datetime.datetime.strptime(self.addDate('2015-01-01',x), '%Y-%m-%d'), d.index))
        d.dropna(inplace=True)
>>>>>>> 4e14025bf6b276fddb0d768586de338e04626cc6
        print(d)
        backtest_p2 = bt.Backtest(p2, d[new_w.index])
        print('222')
        result = bt.run(backtest_p2)

        Backtest.result_data.drop(Backtest.result_data.index[-1],inplace=True)
        colunms =  Backtest.result_data.columns
        MDD_return = []
        DD_return = []
        stock = Backtest.result_data.fillna(method = 'bfill')

        for n in colunms:
            close_list = Backtest.result_data[n].to_list()
            drawdown = [x-y for x, y in zip(close_list, self.cummax(close_list))]
            DD_return.append([x/y * 100 for x, y in zip(drawdown, self.cummax(close_list))])
            idx_lower = drawdown.index(min(drawdown))
            idx_upper = close_list.index(max(close_list[:idx_lower]))
            mdd = (close_list[idx_lower] - close_list[idx_upper])/close_list[idx_upper]
            MDD_return.append(mdd)
        
        return Backtest.result_data, MDD_return, DD_return




class Portfolio:
    def __init__(self, stock_all, start_date, stock_index) :
        self.stock_all = stock_all
        self.start_date = start_date
        self.stock_index = stock_index 
    
    def sum_of_product( xs, ys ):
        return sum( x * y for x, y in zip( xs, ys ) )
    
    def sum_of_squares( v ):
        return sum_of_product( v, v )
    
    def deviation(xs):
        x_mean = sum(xs)/len(xs)
        return [ x - mean for x in xs]
        
    def variance(x):
        n = len(x)
        deviations = deviation(x)
        return  sum_of_squares( deviations ) / ( n-1 )
    #공분산
    def covariance(x, y):
        n = len(x)
        return sum_of_product(deviation(x), deviation(y)) / (n-1)
    
    # 표준편차를 계산하는 함수
    def standard_deviation( x ):
        return math.sqrt( variance( x ) ) # math 모듈의 제곱근 함수 sqrt( )를 사용

    # 상관계수를 계산하는 함수
    def correlation( xs, ys ):
        stdev_x = standard_deviation( xs )
        stdev_y = standard_deviation( ys )
        if stdev_x > 0 and stdev_y > 0:
            return covariance( xs, ys ) / ( stdev_x * stdev_y )
        else :
            return 0
    
    def get_covmat(self):
        ret_daily = self.stock_all.pct_change()
        cov_daily = ret_daily.cov()
        covmat = cov_daily * 250
        return covmat
        
    def cummax(nums):
        cum = []
        n_max = 0
        for x in nums:
            if x > n_max:
                n_max = x
            cum.append(n_max)
        return cum


    def MDD(stock):
        colunms =  stock.columns
        MDD_return = []
        DD_return = []
        stock = stock.fillna(method = 'bfill')
        for n in colunms:
            close_list = stock[n].to_list()
            drawdown = [x-y for x, y in zip(close_list, cummax(close_list))]
            DD_return.append([x/y * 100 for x, y in zip(drawdown,  cummax(close_list))])
            idx_lower = drawdown.index(min(drawdown))
            idx_upper = close_list.index(max(close_list[:idx_lower]))
            mdd = (close_list[idx_lower] - close_list[idx_upper])/close_list[idx_upper]
            MDD_return.append(mdd)
        return MDD_return, DD_return

    def stock_set(self):
        # 저변동성 전략
        # 저변동성 값들
        # input이 stock 별 close 값
        def LOWSTD(stocks):
            stock = stocks
            stock = stock.iloc[-252:]
            ret = stock.pct_change()
            std_daily = ret.std()
            stock["Date"] = stock.index
            stock["Day_name"] = stock["Date"].dt.day_name()
            price_mon = stock[stock["Day_name"] == 'Monday']
            price_mon = price_mon.drop(['Date','Day_name'], axis=1)
            week_mon_ret = price_mon.pct_change().dropna()
            std_weekly = week_mon_ret.std()
            stock_name = price_mon.columns
            
            vol_rank = pd.DataFrame(columns = ["Daily_std", "Weekly_std"], index = stock_name)
            vol_rank["Daily_std"] = std_daily
            vol_rank["Weekly_std"] = std_weekly
            #print(vol_rank)
            vol_rank["std_rank"] = vol_rank['Weekly_std'].rank(ascending = True) +vol_rank['Daily_std'].rank(ascending = True)
            
            vol_rank["std_rank"] = vol_rank["std_rank"].rank(ascending= True, method ='dense').astype(int)
            #print(vol_rank["std_rank"].to_list())
            vol_rank = vol_rank.drop(['Weekly_std', 'Daily_std'], axis = 1)
            return vol_rank
        
        # 가속화 모멘텀 전략
        # output : 각 가속 모멘텀 합
        # input : stock 별 close
        def MAR(stockss):
            def expotential_weight(x):
                m=2.7699877 
                t=0.30787386
                b=-1.05428235
                return list(map(lambda w :m * np.exp(-1* t * w) + b , x ) )
            
            w_list = list(range(1,13))
            w_list = expotential_weight(w_list)
            w_list.reverse()       
            stock = stockss
            
            stock["Date"] = pd.to_datetime(stock.index)
            stock = stock.set_index("Date")
            stock_end = stock.resample(rule = '1M').last()
            stock_end = stock_end.pct_change()
            stock_acc = (1+stock_end).cumprod()-1

            stock_acc_w = stock_acc.iloc[-12:]
            stock_acc_w["w"] = w_list
            for x in stock_acc_w.columns:
                stock_acc_w[x] = stock_acc_w[x] * stock_acc_w['w']
            stock_acc_w = stock_acc_w.drop(["w"],axis=1)
            stock_acc_w = stock_acc_w.sum()
            stock_acc_w = pd.DataFrame(stock_acc_w)
            
            stock_acc_w["mar_rank"] = stock_acc_w.rank(ascending = True, method = 'dense').astype(int)
            stock_acc_w = stock_acc_w.drop([0],axis=1)
            return stock_acc_w
        
        # 밸류 전략 input은 종목 Code
        # PBR 값들
        def VP(stocks):
            def get_financial_statements(stocks):
                table = []
                stock_present = []
                for stock in stocks:
                    get_param = {
                     'pGB':1,
                     'gicode':'A%s'%(stock),
                     'cID':'',
                     'MenuYn':'Y',
                     'ReportGB':'',
                     'NewMenuID':103, #101:snapshot 102:기업개요 103:재무제표 104:재무비율 105:투자지표
                     'stkGb':701,
                     }     
                    get_param = parse.urlencode(get_param)
                    url="http://comp.fnguide.com/SVO2/ASP/SVD_Invest.asp?%s"%(get_param)
                    try:
                        tables = pd.read_html(url, header=0)
                        df1 = tables[1]
                        #11, 12, 13, 14
                        table.append(df1)
                        stock_present.append(stock)
                    except:
                        continue


                return stock_present, table
            try:
                stocks = stocks.drop(['Date'], axis=1)
            except:
                print("")
            stocks = stocks.columns.to_list()
            stock = list((map(lambda x : x.split('/')[0],stocks)))
            stock_present, table = get_financial_statements(stock)
            vp_stock = pd.DataFrame()
            per = []
            pcr = []
            psr = []
            pbr = []
            
            for i in range(len(stock_present)):
                try:
                    pbr.append(float(table[i].iloc[14,-1]))
                    per.append(float(table[i].iloc[11,-2]))
                    pcr.append(float(table[i].iloc[12,-2]))
                    psr.append(float(table[i].iloc[13,-2]))
                except:
                    pbr.append(float(table[i].iloc[9,-1]))
                    per.append(float(table[i].iloc[8,-2]))
                    pcr.append(0)
                    psr.append(float(table[i].iloc[11,-2]))
                
            vp_stock["Code"] = stock_present
            vp_stock["per"] = per
            vp_stock["pcr"] = pcr
            vp_stock["psr"] = psr
            vp_stock["pbr"] = pbr
            vp_stock = vp_stock.fillna(0)
            vp_stock['vp_rank'] = vp_stock["per"].rank(ascending = False,na_option = 'top') +vp_stock["psr"].rank(ascending = False, na_option = 'top')
            vp_stock['vp_rank'] += vp_stock["pcr"].rank(ascending = False, na_option = 'top')+ vp_stock["pbr"].rank(ascending = False, na_option = 'top')
            vp_stock['vp_rank'] = vp_stock['vp_rank'].rank(ascending = True, method = 'dense').astype(int)
            vp_stock = vp_stock.drop(['per','pcr', 'psr','pbr'], axis=1)
            return vp_stock
        
        #재무제표 이해 필요
        def QUAILTY(stocks):
            return 0
        
        def PROFIT(stocks):
            return 0
        
        low = LOWSTD(self.stock_all)
        mar = MAR(self.stock_all)
        vp = VP(self.stock_all)
        return low, mar, vp
        #return vp
    

    #최소분산포트폴리오
    def MVP(self):
        def obj_variance(weights, covmat):
            vol = np.sqrt(np.dot(weights.T, np.dot(covmat, weights)))
            return vol
        
        n_assets = len(self.stock_all.columns)
        #print("n_assets : " + str(n_assets))
        
        weights = np.ones([n_assets]) / n_assets
        date_stride = 252
        ret_daily = self.stock_all.pct_change()
        ret_annual = ret_daily.mean() * date_stride
        #ret_annual = np.sum(ret_daily.mean() * self.stock_all)
        
        cov_daily = ret_daily.cov()
        cov_annual = cov_daily * date_stride
        
        bnds = tuple( (0., 1.) for i in range(n_assets))
        cons = ( {'type' : 'eq', 'fun': lambda w: np.sum(w)-1})
        res = minimize(obj_variance, weights,(cov_annual), method='SLSQP', bounds=bnds, constraints=cons )
        
        return res
    
    
    #최소분산포트폴리오 + 샤프지수 
    def MVP_sharp(self):
        def obj_sharpe(weights, returns, covmat, rf):
            ret = np.dot(weights, returns)
            vol = np.sqrt(np.dot(weights.T, np.dot(covmat, weights)))
            return 1 /((ret-rf)/np.sqrt(vol))
        
        n_assets = len(self.stock_all.columns)
        date_stride = 252
        rf = 0.01
        weights = np.ones([n_assets]) / n_assets
        
        ret_daily = self.stock_all.pct_change()
        ret_annual = ret_daily.mean() * date_stride
        #ret_annual = np.sum(ret_daily.mean() * self.stock_all)
        
        cov_daily = ret_daily.cov()
        cov_annual = cov_daily * date_stride
        
        bnds = tuple( (0., 1.) for i in range(n_assets))
        cons = ( {'type' : 'eq', 'fun': lambda w: np.sum(w)-1})
        res = minimize(obj_sharpe, weights,(ret_annual, cov_annual, rf), method='SLSQP', bounds=bnds, constraints=cons )

        weight = res.x
        
        return res    

    def MRC(self):
        def obj_variance(weights, covmat):
            vol = np.sqrt(np.dot(weights.T, np.dot(covmat, weights)))
            #print(vol)
            mrc = np.dot(covmat, weights)/vol
            #print(mrc)
            rc = mrc * weights
            
            #print(rc)
            rc = rc / np.sum(rc)
            res = np.sum((rc - rc/len(rc))**2)
            #print(res) 
            return res 
        
        n_assets = len(self.stock_all.columns)
        #print("n_assets : " + str(n_assets))
        
        weights = np.ones([n_assets]) / n_assets
        date_stride = 252
        ret_daily = self.stock_all.pct_change()
        
        cov_daily = ret_daily.cov()
        cov_annual = cov_daily * date_stride
        
        bnds = tuple( (0., 1.) for i in range(n_assets))
        cons = ( {'type' : 'eq', 'fun': lambda w: np.sum(w)-1})
        res = minimize(obj_variance, weights,(cov_annual), method='SLSQP', bounds=bnds, constraints=cons )
        
        return res

def get_all_fdr_symbols(c_d):
    all_stocks = pd.DataFrame()
    for i in range(len(c_d)):
        code = c_d[i].split('/')[0]
        start = c_d[i].split('/')[1]    
        tmp_close = fdr.DataReader(code,start)['Close']
        all_stocks = pd.concat([all_stocks, tmp_close], axis=1)
    all_stocks.columns=c_d
    return all_stocks

def code_to_six(x):
    x = str(x)
    while len(x)!=6:
        x = "0" + x
    return x

def similar_date_start(x):
    if x == '[]':
        return None
    else:
        x = x[1:-2]
        x = x.split(',')
        tmp = ""
        for date in x:
            date = date.replace(" ","")
            date = date.replace("'","")
            tmp = tmp + date.split('~')[0] + '/'
        return tmp


csv_filename1 = os.path.join(os.path.dirname(__file__), 'top_200.csv')
csv_filename2 = os.path.join(os.path.dirname(__file__), 'top_200_clustering.csv')
k2_result = os.path.join(os.path.dirname(__file__), 'K200_result.csv')
k1_result = os.path.join(os.path.dirname(__file__), 'K100_result.csv')
kq_result = os.path.join(os.path.dirname(__file__), 'KQ_result.csv')

dd = fdr.StockListing('KRX')
d_set = {}
for x , y in dd[['Symbol','Name']].values:
    d_set[x]=y


@api_view(['GET'])
def get_top_output(request):
    if request.method == 'GET':
        result = {}
        top_output = ['삼성전자', '유한양행', '금호석유', 'Naver', '기아', '효성', '동국제강' 'BNK금융지주', '한온시스템', 'SK이노베이션']
        result['top'] = top_output
        return JsonResponse({'result' : result})

@api_view(['GET'])
def get_portfolio_output(request):
    if request.method == 'GET':
        result = {}

        market = request.GET['market']
        sector = request.GET['sector']
        ratio = request.GET['s_ratio']
        sector = sector.replace('[','').replace(']','').split(',')
        
        s_result =''
        if market == 'KOSPI200':
            s_result = pd.read_csv(k2_result, header=0, dtype=object)
        elif market == 'KOSPI100':
            s_result = pd.read_csv(k1_result, header=0, dtype=object)
        elif market == 'KOSDAQ':
            s_result = pd.read_csv(kq_result, header=0, dtype=object) 
        #print(sector)
        #print(s_result)
        s12_result = s_result[[(x in sector) for x in s_result['Sector'] ]]
        silmilar = s12_result['s_date'].to_list()
        r_sector = s12_result['Sector'].to_list()
        r_code = s12_result['Code'].to_list()
        r_name = []
        
        for x in r_code:
            d_name = d_set[x]
            #print(d_name)
            r_name.append(d_name)
        s12_pct = pd.DataFrame()
        for i in range(len(s12_result)):
            code = s12_result.iloc[i,0]
            s_date = s12_result.iloc[i,3]
            date = datetime.datetime.strptime(s_date,'%Y-%m-%d')
            e_date = str(date + datetime.timedelta(days=400))
            stock = fdr.DataReader(code, s_date, e_date)['Close']
            print('second')
            stock = pd.DataFrame(stock)
            s12_pct[s12_result['Code'].iloc[i]] = stock['Close'][:252].to_list()

        

        s12_port = Portfolio(s12_pct, "","")

        #print(s12_port)
        w1 = list(s12_port.MVP().x)
        #print(w1)
        w2 = list(s12_port.MVP_sharp().x)
        #print(w2)
        w3 = list(s12_port.MRC().x)

        #print(w3)
        
        t_port = {}
        t_port['similar_date'] = silmilar
        t_port['stocks'] = r_name
        t_port['sector'] = r_sector
        t_port['weight'] = [w1, w2, w3]
        result['result'] = t_port
        
        #print(t_port)
        
        today = silmilar # 포트폴리오 유사시점
        
        user_w = 0 # 일반:0, 샤프 지수:1 , 위험균형 : 2
        user_input_sb = [float(ratio), 1-float(ratio)] #[0.6,0.4] # p1 : 종목 채권
        user_input_s = [] # 종목별 비중

        stocks = r_name
        stock_bond = w1
        input_rebal_period = 'week' # week month quarter
        period = 300

        #model_w = [w1,w2] #[[0.3,0.5,0.2],[0.2,0.8],[0.4,0.6]]
        now = today[0]
        #result_data = pd.DataFrame()
        
        port1 = {}
        result_data, mdd, dd = Backtest(stocks=stocks,period=period, input_rebal_period = input_rebal_period,today=today, user_input_s = w1, user_input_sb=user_input_sb)() # 필수 매개변수: 종목명, 날짜
        #print(mdd)
        result_data = result_data.rename_axis('date').reset_index()
        result_data.rename(columns = {'portfolio 2': 'price'}, inplace = True )
        port1["data"] = result_data.to_dict('records')
        port1['mdd'] = mdd
        port1['dd'] =dd
        result['최대분산P'] = port1
        
        #print(port1)
        
        port2 = {}
        result_data, mdd, dd = Backtest(stocks=stocks,period = period, input_rebal_period = input_rebal_period, today=today, user_input_s = w2, user_input_sb=user_input_sb)() # 필수 매개변수: 종목명, 날짜
        result_data = result_data.rename_axis('date').reset_index()
        result_data.rename(columns = {'portfolio 2': 'price'}, inplace = True )
        port2["data"] = result_data.to_dict('records')
        port2['mdd'] = mdd
        port2['dd'] = dd
        result['샤프P'] = port2
        
        #print(port2)
        
        port3 = {}
        result_data, mdd, dd = Backtest(stocks=stocks,period = period, input_rebal_period = input_rebal_period,today=today, user_input_s = w3, user_input_sb=user_input_sb)() # 필수 매개변수: 종목명, 날짜
        result_data = result_data.rename_axis('date').reset_index()
        result_data.rename(columns = {'portfolio 2': 'price'}, inplace = True )
        port3["data"] = result_data.to_dict('records')
        port3['mdd'] = mdd
        port3['dd'] = dd
        result['위험균형P'] = port3
        #print (result)
        return JsonResponse({'result' : result})
    
    
@api_view(['GET'])
def get_sector_output(request):
    if request.method == 'GET':
        t200 = pd.read_csv(csv_filename1,header=0, index_col=0)
        c200 = pd.read_csv(csv_filename2 ,header=0, index_col=0)    
        print(t200)
        print(c200)
        t200["Code"] = list(map(lambda x : code_to_six(x) ,t200["Code"].to_list() ))
        symbols = t200["Code"]
        symbols_len = len(symbols)
        symbols_start = []
        symbols_end = []
        c_d = []

        c200['Today_Date'] = list(map(lambda x : x.split('~')[0], c200['Today_Date']))
        c200['Similar_Dates'] = list(map(lambda x : similar_date_start(x), c200['Similar_Dates']))

        for x in range(symbols_len):
            code = t200.iloc[x]["Code"]
            sector = t200.iloc[x]["Sector"]
            cluster = c200[c200["Sector"]== sector]
            s_date = cluster['Today_Date']
            try:
                e_date = cluster.iloc[0,2]
            except:
                continue

            if e_date==None:
                continue
            else:
                for i in e_date.split('/'):
                    if i != '':
                        c_d.append(code+'/'+i)

        for i in range(len(c_d)):
            start = datetime.date.fromisoformat(c_d[i].split('/')[1]) - timedelta(days=15)
            symbols_start.append(start.strftime('%Y-%m-%d'))
            end = datetime.date.fromisoformat(symbols_start[i]) + timedelta(days=60)
            symbols_end.append(end.strftime('%Y-%m-%d'))

        stock_all = get_all_fdr_symbols(c_d)
        stock_all = stock_all.reindex(stock_all.index.sort_values())
        try:
            stock_all = stock_all.drop(['Date'], axis=1)
        except:
            stock_all = stock_all
        port = Portfolio(stock_all, "2022-08-16", stock_all.index)
        low, mar, vp = port.stock_set()
        vp_dd = vp.drop_duplicates()
        vp_dd = vp_dd.set_index('Code',drop=True)
        vp_index = low.index
        vp_df = pd.DataFrame(index = vp_index)
        tmp = []

        for i in range(len(low)):
            vp_code = vp_index[i].split('/')[0]
            try:
                tmp.append(vp_dd.at[vp_code, 'vp_rank'])
            except:
                tmp.append(vp_dd['vp_rank'].max()+1)
        vp_df["vp_rank"] = tmp
        ranking = pd.concat([low,mar,vp_df], axis=1)
        
        f_w = [0.3, 0.3, 0.3]
        
        ranking['f_rank'] = ranking['std_rank'] * f_w[0] + ranking['mar_rank'] * f_w[1] + ranking['vp_rank'] *  f_w[2]
        ranking['f_rank'] = ranking['f_rank'].rank(method = 'dense')
        rank_set = pd.DataFrame(columns=['s_date','f_rank'], index = t200['Code'].to_list())
        rank_set['f_rank'] = 10000

        for i in range(len(ranking)):
            r_code = ranking.index[i].split('/')[0]
            r_date = ranking.index[i].split('/')[1]
            r_rank = ranking.iloc[i,3]
            if rank_set.loc[r_code,'f_rank'] > r_rank:
                rank_set.loc[r_code, 'f_rank'] = r_rank
                rank_set.loc[r_code, 's_date'] = r_date

        sector_data = t200
        sector_data = sector_data.set_index('Code', drop=True)
        sector_data['f_rank'] = 10000
        sector_data['s_date'] = ''
        for index in rank_set.index:
            f_rank = rank_set.loc[index,'f_rank']
            s_date = rank_set.loc[index,'s_date']
            sector_data.loc[index,'f_rank'] = f_rank
            sector_data.loc[index, 's_date'] = s_date
        s_result = sector_data[sector_data['f_rank']!=10000].sort_values(by= ['Sector', 'f_rank'], ascending = [False, True]).drop('Name',axis=1).drop_duplicates(['Sector'], keep='first')
        s_result = s_result.sort_values(by = 'f_rank')
        #print(s_result)
        s_result.to_csv('./KS200_result.csv')
        
        return JsonResponse({"Success" : "True"})
    
