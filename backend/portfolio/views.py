from django.shortcuts import render
from django.http.response import JsonResponse
from numpy import empty
from pkg_resources import empty_provider
from rest_framework.parsers import JSONParser 
from rest_framework import status

from rest_framework.decorators import api_view

import FinanceDataReader as fdr
import json

import pandas as pd
import numpy as np
import math
import datetime
from datetime import timedelta
from scipy.optimize import minimize
import csv
from urllib import parse
import datetime
import os


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
            print(vol_rank)
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
# kq_result = os.path.join(os.path.dirname(__file__), 'KQ_result.csv')



@api_view(['GET'])
def get_portfolio_output(request):
    if request.method == 'GET':
        result = {}
        market = request.GET['market']
        sector = request.GET['sector']
        ratio = request.GET['r_ratio']
        sector = sector.replace('[','').replace(']','').split(',')
        s_result =''
        if market == 'KOSPI200':
            s_result = pd.read_csv(k2_result, header=0, dtype=object)
        elif market == 'KOSPI100':
            s_result = pd.read_csv(k1_result, header=0, dtype=object)
        # elif market == 'KOSDAQ':
        #     s_result = pd.read_csv(kq_result, header=0, dtype=object) 
        s12_result = s_result[[(x in sector) for x in s_result['Sector'] ]]
        silmilar = s12_result['s_date'].to_list()
        r_sector = s12_result['Sector'].to_list()
        
        s12_pct = pd.DataFrame()
        for i in range(len(s12_result)):
            code = s12_result.iloc[i,0]
            s_date = s12_result.iloc[i,3]
            date = datetime.datetime.strptime(s_date,'%Y-%m-%d')
            e_date = str(date + datetime.timedelta(days=400))
            stock = fdr.DataReader(code, s_date, e_date)['Close']
            stock = pd.DataFrame(stock)
            s12_pct[s12_result['Code'].iloc[i]] = stock['Close'][:252].to_list()

        s12_port = Portfolio(s12_pct, "","")
        
        t_port = {}
        t_port['similar_date'] = silmilar
        t_port['stocks'] = r_sector
        t_port['weights'] = [list(s12_port.MVP().x),list(s12_port.MVP_sharp().x) ]
        result['result'] = t_port
        
        return JsonResponse(result)
    
    
@api_view(['GET'])
def get_sector_output(request):
    if request.method == 'GET':
        t200 = pd.read_csv(csv_filename1,header=0, index_col=0)
        c200 = pd.read_csv(csv_filename2 ,header=0, index_col=0)    
        
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
        print(s_result)
        s_result.to_csv('./KS200_result.csv')
        
        return JsonResponse({"Success" : "True"})
    
