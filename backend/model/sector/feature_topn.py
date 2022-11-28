import pandas as pd
import pandas_datareader as pdr
import numpy as np
import math
import matplotlib.pyplot as plt
from tqdm.auto import tqdm # progress bar
import FinanceDataReader as fdr

import OpenDartReader
api_key = 'ba7e1b11603d446d5f7283785cc42f70f8ae397f'
dart = OpenDartReader(api_key)
import datetime
from datetime import date
from dateutil.relativedelta import relativedelta
from model.marcap import marcap_data
import time # for sleep

from bs4 import BeautifulSoup # Importing BeautifulSoup class from the bs4 module
import requests as req # Importing the HTTP library


class DataCollector_TopN():
    def __init__(self, START_DATE, END_DATE, START_YEAR, END_YEAR, COMPANY_NUM, df_krx_top):
        self.START_YEAR = START_YEAR
        self.END_YEAR = END_YEAR
        self.START_DATE = START_DATE
        self.END_DATE = END_DATE
        self.COMPANY_NUM = COMPANY_NUM
        self.df_krx_top = df_krx_top
        self.FS_COL = ['종목코드', '사업년도', '분기', '유동자산', '비유동자산', '자산총계', '유동부채',
                      '비유동부채', '부채총계', '자본총계', '수익(매출액)', 
                      '영업이익', '당기순이익(손실)', '영업활동 현금흐름'] # 삼성전자 기준 기본 이름
        self.fs_all = [] # 각 년도 재무제표 사업보고서 dataframe 리스트
        self.new_df = pd.DataFrame()
        
    def collect_fs(self): # financial statements (재무제표)
        for year in tqdm(range(self.START_YEAR, self.END_YEAR), desc=("Fetching "+str(self.END_YEAR-self.START_YEAR)+" years data")):
            time.sleep(1)
            fs_temp = pd.DataFrame(columns = columns)
            for i in tqdm(self.df_krx_top["Code"][0:].astype(str), desc="Fetching FS data for top "+str(self.COMPANY_NUM)+" companies in "+str(year)):
                time.sleep(0.1)
                temp_row = []
                if(dart.finstate_all(corp=i, bsns_year=year, reprt_code='11011') is None): # 사업보고서 공시 자료가 없음
                    temp_row = [i,year,4, '-1','-1','-1','-1','-1','-1','-1','-1','-1','-1','-1']
                else:
                    temp_fsall = dart.finstate_all(corp=i, bsns_year=year, reprt_code='11011') # year년도 사업보고서(4반기)
                    temp_fsall = temp_fsall[['bsns_year', 'sj_nm', 'account_id', 'account_nm', 'thstrm_nm', 'thstrm_amount']]
                    temp_row.extend([i, year, 4]) # 종목코드, 사업년도, 분기
                    for j in columns[3:]: # 유동자산~영업활동 현금흐름
                        if (len(temp_fsall.loc[temp_fsall['account_nm']==j]['thstrm_amount'].tolist())): # 값이 있을 경우 바로 진행
                            temp_row.append(temp_fsall.loc[temp_fsall['account_nm']==j]['thstrm_amount'].tolist()[0])
                        else:  # 만약 값이 비어있을 경우, 예외 처리
                            if (j == "유동자산"): # 비어 있는 값이 "유동자산" 일 경우
                                if (len(temp_fsall.loc[temp_fsall['account_nm']=="l. 유동자산"]['thstrm_amount'].tolist())): # 이름을 "l. 유동자산"로 다시 확인해서 값이 있는지 확인
                                    temp_row.append(temp_fsall.loc[temp_fsall['account_nm']=="l. 유동자산"]['thstrm_amount'].tolist()[0])
                                elif (len(temp_fsall.loc[temp_fsall['account_nm']=="I.유동자산"]['thstrm_amount'].tolist())): # 이름을 "I.유동자산"로 다시 확인해서 값이 있는지 확인
                                    temp_row.append(temp_fsall.loc[temp_fsall['account_nm']=="I.유동자산"]['thstrm_amount'].tolist()[0])
                                else:
                                    print("error in 유동자산, i is ", i)
                            elif (j == "비유동자산"): # 비어 있는 값이 "비유동자산" 일 경우
                                if (len(temp_fsall.loc[temp_fsall['account_nm']=="ll. 비유동자산"]['thstrm_amount'].tolist())): # 이름을 "ll. 비유동자산"로 다시 확인해서 값이 있는지 확인
                                    temp_row.append(temp_fsall.loc[temp_fsall['account_nm']=="ll. 비유동자산"]['thstrm_amount'].tolist()[0])
                                elif (len(temp_fsall.loc[temp_fsall['account_nm']=="Ⅱ.비유동자산"]['thstrm_amount'].tolist())): # 이름을 "Ⅱ.비유동자산"로 다시 확인해서 값이 있는지 확인
                                    temp_row.append(temp_fsall.loc[temp_fsall['account_nm']=="Ⅱ.비유동자산"]['thstrm_amount'].tolist()[0])
                                else:
                                    print("error in 비유동자산, i is ", i)

                            elif (j == "자산총계"): # 비어 있는 값이 "자산총계" 일 경우
                                if (len(temp_fsall.loc[temp_fsall['account_nm']=="자산 총계"]['thstrm_amount'].tolist())): # 이름을 "자산 총계"로 다시 확인해서 값이 있는지 확인
                                    temp_row.append(temp_fsall.loc[temp_fsall['account_nm']=="자산 총계"]['thstrm_amount'].tolist()[0])
                                elif(len(temp_fsall.loc[temp_fsall['account_id']=="ifrs-full_Assets"]['thstrm_amount'].tolist())): # id가 "ifrs-full_Assets"로 다시 확인해서 값이 있는지 확인
                                    temp_row.append(temp_fsall.loc[temp_fsall['account_id']=="ifrs-full_Assets"]['thstrm_amount'].tolist()[0])
                                elif(len(temp_fsall.loc[temp_fsall['account_id']=="ifrs_Assets"]['thstrm_amount'].tolist())): # id가 "ifrs_Assets"로 다시 확인해서 값이 있는지 확인
                                    temp_row.append(temp_fsall.loc[temp_fsall['account_id']=="ifrs_Assets"]['thstrm_amount'].tolist()[0])
                                else:
                                    print("error in 자산총계, i is ", i)

                            elif (j == "유동부채"): # 비어 있는 값이 "유동부채" 일 경우
                                if (len(temp_fsall.loc[temp_fsall['account_nm']=="l. 유동부채"]['thstrm_amount'].tolist())): # 이름을 "l. 유동부채"로 다시 확인해서 값이 있는지 확인
                                    temp_row.append(temp_fsall.loc[temp_fsall['account_nm']=="l. 유동부채"]['thstrm_amount'].tolist()[0])
                                elif (len(temp_fsall.loc[temp_fsall['account_nm']=="I.유동부채"]['thstrm_amount'].tolist())): # 이름을 "I.유동부채"로 다시 확인해서 값이 있는지 확인
                                    temp_row.append(temp_fsall.loc[temp_fsall['account_nm']=="I.유동부채"]['thstrm_amount'].tolist()[0])
                                else:
                                    print("error in 유동부채, i is ", i)

                            elif (j == "비유동부채"): # 비어 있는 값이 "비유동부채" 일 경우
                                if (len(temp_fsall.loc[temp_fsall['account_nm']=="ll. 비유동자산"]['thstrm_amount'].tolist())): # 이름을 "ll. 비유동자산"로 다시 확인해서 값이 있는지 확인
                                    temp_row.append(temp_fsall.loc[temp_fsall['account_nm']=="ll. 비유동자산"]['thstrm_amount'].tolist()[0])
                                elif (len(temp_fsall.loc[temp_fsall['account_nm']=="Ⅱ.비유동부채"]['thstrm_amount'].tolist())): # 이름을 "Ⅱ.비유동부채"로 다시 확인해서 값이 있는지 확인
                                    temp_row.append(temp_fsall.loc[temp_fsall['account_nm']=="Ⅱ.비유동부채"]['thstrm_amount'].tolist()[0])
                                else:
                                    print("error in 비유동부채, i is ", i)

                            elif (j == "부채총계"): # 비어 있는 값이 "부채총계" 일 경우
                                if (len(temp_fsall.loc[temp_fsall['account_nm']=="부채 총계"]['thstrm_amount'].tolist())): # 이름을 "부채 총계"로 다시 확인해서 값이 있는지 확인
                                    temp_row.append(temp_fsall.loc[temp_fsall['account_nm']=="부채 총계"]['thstrm_amount'].tolist()[0])
                                elif(len(temp_fsall.loc[temp_fsall['account_id']=="ifrs-full_Liabilities"]['thstrm_amount'].tolist())): # id가 "ifrs-full_Liabilities"로 다시 확인해서 값이 있는지 확인
                                    temp_row.append(temp_fsall.loc[temp_fsall['account_id']=="ifrs-full_Liabilities"]['thstrm_amount'].tolist()[0])
                                elif(len(temp_fsall.loc[temp_fsall['account_id']=="ifrs_Liabilities"]['thstrm_amount'].tolist())): # id가 "ifrs_Liabilities"로 다시 확인해서 값이 있는지 확인
                                    temp_row.append(temp_fsall.loc[temp_fsall['account_id']=="ifrs_Liabilities"]['thstrm_amount'].tolist()[0])
                                else:
                                    print("error in 부채총계, i is ", i)

                            elif (j == "자본총계"): # 비어 있는 값이 "자본총계" 일 경우
                                if (len(temp_fsall.loc[temp_fsall['account_nm']=="자본 총계"]['thstrm_amount'].tolist())): # 이름을 "자본 총계"로 다시 확인해서 값이 있는지 확인
                                    temp_row.append(temp_fsall.loc[temp_fsall['account_nm']=="자본 총계"]['thstrm_amount'].tolist()[0])
                                elif (len(temp_fsall.loc[temp_fsall['account_nm']=="당기말"]['thstrm_amount'].tolist())): # 이름을 "당기말"로 다시 확인해서 값이 있는지 확인
                                    temp_row.append(temp_fsall.loc[temp_fsall['account_nm']=="당기말"]['thstrm_amount'].tolist()[0])
                                elif (len(temp_fsall.loc[temp_fsall['account_nm']=="당기말자본"]['thstrm_amount'].tolist())): # 이름을 "당기말자본"로 다시 확인해서 값이 있는지 확인
                                    temp_row.append(temp_fsall.loc[temp_fsall['account_nm']=="당기말자본"]['thstrm_amount'].tolist()[0])
                                elif (len(temp_fsall.loc[temp_fsall['account_nm']=="기말"]['thstrm_amount'].tolist())): # 이름을 "기말"로 다시 확인해서 값이 있는지 확인
                                    temp_row.append(temp_fsall.loc[temp_fsall['account_nm']=="기말"]['thstrm_amount'].tolist()[0])
                                elif(len(temp_fsall.loc[temp_fsall['account_id']=="ifrs-full_Equity"]['thstrm_amount'].tolist())): # id가 "ifrs-full_Equity"로 다시 확인해서 값이 있는지 확인
                                    temp_row.append(temp_fsall.loc[temp_fsall['account_id']=="ifrs-full_Equity"]['thstrm_amount'].tolist()[0])
                                elif(len(temp_fsall.loc[temp_fsall['account_id']=="ifrs_Equity"]['thstrm_amount'].tolist())): # id가 "ifrs_Equity"로 다시 확인해서 값이 있는지 확인
                                    temp_row.append(temp_fsall.loc[temp_fsall['account_id']=="ifrs_Equity"]['thstrm_amount'].tolist()[0])
                                else:
                                    print("error in 자본총계, i is ", i)

                            elif (j == "수익(매출액)"): # 비어 있는 값이 "수익(매출액)" 일 경우
                                if (len(temp_fsall.loc[temp_fsall['account_nm']=="매출"]['thstrm_amount'].tolist())): # 이름을 "매출"로 다시 확인해서 값이 있는지 확인
                                    temp_row.append(temp_fsall.loc[temp_fsall['account_nm']=="매출"]['thstrm_amount'].tolist()[0])  
                                elif(len(temp_fsall.loc[temp_fsall['account_nm']=="매출액"]['thstrm_amount'].tolist())): # 이름을 "매출액"로 다시 확인해서 값이 있는지 확인
                                    temp_row.append(temp_fsall.loc[temp_fsall['account_nm']=="매출액"]['thstrm_amount'].tolist()[0])
                                elif(len(temp_fsall.loc[temp_fsall['account_nm']=="영업수익"]['thstrm_amount'].tolist())): # 이름을 "영업수익"로 다시 확인해서 값이 있는지 확인
                                    temp_row.append(temp_fsall.loc[temp_fsall['account_nm']=="영업수익"]['thstrm_amount'].tolist()[0])
                                elif(len(temp_fsall.loc[temp_fsall['account_nm']=="매출액(영업수익)"]['thstrm_amount'].tolist())): # 이름을 "매출액(영업수익)"로 다시 확인해서 값이 있는지 확인
                                    temp_row.append(temp_fsall.loc[temp_fsall['account_nm']=="매출액(영업수익)"]['thstrm_amount'].tolist()[0])
                                elif(len(temp_fsall.loc[temp_fsall['account_nm']=="매출 및 지분법 손익"]['thstrm_amount'].tolist())): # 이름을 "매출 및 지분법 손익"로 다시 확인해서 값이 있는지 확인
                                    temp_row.append(temp_fsall.loc[temp_fsall['account_nm']=="매출 및 지분법 손익"]['thstrm_amount'].tolist()[0])
                                elif(len(temp_fsall.loc[temp_fsall['account_nm']=="영업수익(매출액)"]['thstrm_amount'].tolist())): # 이름을 "영업수익(매출액)"로 다시 확인해서 값이 있는지 확인
                                    temp_row.append(temp_fsall.loc[temp_fsall['account_nm']=="영업수익(매출액)"]['thstrm_amount'].tolist()[0])
                                elif(len(temp_fsall.loc[temp_fsall['account_id']=="ifrs-full_Revenue"]['thstrm_amount'].tolist())): # id가 "ifrs-full_Revenue"로 다시 확인해서 값이 있는지 확인
                                    temp_row.append(temp_fsall.loc[temp_fsall['account_id']=="ifrs-full_Revenue"]['thstrm_amount'].tolist()[0])
                                elif(len(temp_fsall.loc[temp_fsall['account_id']=="ifrs_Revenue"]['thstrm_amount'].tolist())): # id가 "ifrs_Revenue"로 다시 확인해서 값이 있는지 확인
                                    temp_row.append(temp_fsall.loc[temp_fsall['account_id']=="ifrs_Revenue"]['thstrm_amount'].tolist()[0])
                                else:
                                    print("error in 수익(매출액), i is ", i)

                            elif (j == "영업이익"): # 비어 있는 값이 "영업이익" 일 경우
                                if (len(temp_fsall.loc[temp_fsall['account_nm']=="영업이익(손실)"]['thstrm_amount'].tolist())): # 이름을 "영업이익(손실)"로 다시 확인해서 값이 있는지 확인
                                    temp_row.append(temp_fsall.loc[temp_fsall['account_nm']=="영업이익(손실)"]['thstrm_amount'].tolist()[0])
                                elif (len(temp_fsall.loc[temp_fsall['account_nm']=="영업이익 (손실)"]['thstrm_amount'].tolist())): # 이름을 "영업이익 (손실)"로 다시 확인해서 값이 있는지 확인
                                    temp_row.append(temp_fsall.loc[temp_fsall['account_nm']=="영업이익 (손실)"]['thstrm_amount'].tolist()[0])
                                elif (len(temp_fsall.loc[temp_fsall['account_nm']=="영업손실"]['thstrm_amount'].tolist())): # 이름을 "영업손실"로 다시 확인해서 값이 있는지 확인
                                    temp_row.append(temp_fsall.loc[temp_fsall['account_nm']=="영업손실"]['thstrm_amount'].tolist()[0])
                                elif (len(temp_fsall.loc[temp_fsall['account_nm']=="영업손익"]['thstrm_amount'].tolist())): # 이름을 "영업손익"로 다시 확인해서 값이 있는지 확인
                                    temp_row.append(temp_fsall.loc[temp_fsall['account_nm']=="영업손익"]['thstrm_amount'].tolist()[0])
                                elif (len(temp_fsall.loc[temp_fsall['account_nm']=="V. 영업손익"]['thstrm_amount'].tolist())): # 이름을 "V. 영업손익"로 다시 확인해서 값이 있는지 확인
                                    temp_row.append(temp_fsall.loc[temp_fsall['account_nm']=="V. 영업손익"]['thstrm_amount'].tolist()[0])
                                elif(len(temp_fsall.loc[temp_fsall['account_id']=="dart_OperatingIncomeLoss"]['thstrm_amount'].tolist())): # id가 "dart_OperatingIncomeLoss"로 다시 확인해서 값이 있는지 확인
                                    temp_row.append(temp_fsall.loc[temp_fsall['account_id']=="dart_OperatingIncomeLoss"]['thstrm_amount'].tolist()[0])
                                else:
                                    print("error in 영업이익, i is ", i)

                            elif (j == "당기순이익(손실)"): # 비어 있는 값이 "당기순이익(손실)" 일 경우
                              if(len(temp_fsall.loc[temp_fsall['account_nm']=="당기순이익"]['thstrm_amount'].tolist())): # 이름을 "당기순이익"로 다시 확인해서 값이 있는지 확인
                                temp_row.append(temp_fsall.loc[temp_fsall['account_nm']=="당기순이익"]['thstrm_amount'].tolist()[0])
                              elif(len(temp_fsall.loc[temp_fsall['account_nm']=="연결당기순이익"]['thstrm_amount'].tolist())): # 이름을 "연결당기순이익"로 다시 확인해서 값이 있는지 확인
                                temp_row.append(temp_fsall.loc[temp_fsall['account_nm']=="연결당기순이익"]['thstrm_amount'].tolist()[0])
                              elif(len(temp_fsall.loc[temp_fsall['account_nm']=="연결당기순이익(손실)"]['thstrm_amount'].tolist())): # 이름을 "연결당기순이익(손실)"로 다시 확인해서 값이 있는지 확인
                                temp_row.append(temp_fsall.loc[temp_fsall['account_nm']=="연결당기순이익(손실)"]['thstrm_amount'].tolist()[0])
                              elif(len(temp_fsall.loc[temp_fsall['account_nm']=="당기의 순이익"]['thstrm_amount'].tolist())): # 이름을 "당기의 순이익"로 다시 확인해서 값이 있는지 확인
                                temp_row.append(temp_fsall.loc[temp_fsall['account_nm']=="당기의 순이익"]['thstrm_amount'].tolist()[0])
                              elif(len(temp_fsall.loc[temp_fsall['account_nm']=="당기순손실"]['thstrm_amount'].tolist())): # 이름을 "당기순손실"로 다시 확인해서 값이 있는지 확인
                                temp_row.append(temp_fsall.loc[temp_fsall['account_nm']=="당기순손실"]['thstrm_amount'].tolist()[0])
                              elif(len(temp_fsall.loc[temp_fsall['account_nm']=="당기순손익"]['thstrm_amount'].tolist())): # 이름을 "당기순손익"로 다시 확인해서 값이 있는지 확인
                                temp_row.append(temp_fsall.loc[temp_fsall['account_nm']=="당기순손익"]['thstrm_amount'].tolist()[0])
                              elif(len(temp_fsall.loc[temp_fsall['account_nm']=="분기순이익"]['thstrm_amount'].tolist())): # 이름을 "분기순이익"로 다시 확인해서 값이 있는지 확인
                                temp_row.append(temp_fsall.loc[temp_fsall['account_nm']=="분기순이익"]['thstrm_amount'].tolist()[0])
                              elif(len(temp_fsall.loc[temp_fsall['account_id']=="ifrs-ifrs-full_ProfitLoss"]['thstrm_amount'].tolist())): # id가 "ifrs-ifrs-full_ProfitLoss"로 다시 확인해서 값이 있는지 확인
                                temp_row.append(temp_fsall.loc[temp_fsall['account_id']=="ifrs-ifrs-full_ProfitLoss"]['thstrm_amount'].tolist()[0])
                              elif(len(temp_fsall.loc[temp_fsall['account_id']=="ifrs-full_ProfitLoss"]['thstrm_amount'].tolist())): # id가 "ifrs-full_ProfitLoss"로 다시 확인해서 값이 있는지 확인
                                temp_row.append(temp_fsall.loc[temp_fsall['account_id']=="ifrs-full_ProfitLoss"]['thstrm_amount'].tolist()[0])
                              elif(len(temp_fsall.loc[temp_fsall['account_id']=="ifrs_ProfitLoss"]['thstrm_amount'].tolist())): # id가 "ifrs_ProfitLoss"로 다시 확인해서 값이 있는지 확인
                                temp_row.append(temp_fsall.loc[temp_fsall['account_id']=="ifrs_ProfitLoss"]['thstrm_amount'].tolist()[0])
                              else:
                                print("error in 당기순이익, i is ", i)

                            elif (j == "영업활동 현금흐름"): # 비어 있는 값이 "영업활동 현금흐름" 일 경우
                              if(len(temp_fsall.loc[temp_fsall['account_nm']=="영업활동으로 인한 현금흐름"]['thstrm_amount'].tolist())): # 이름을 "영업활동으로 인한 현금흐름"로 다시 확인해서 값이 있는지 확인
                                temp_row.append(temp_fsall.loc[temp_fsall['account_nm']=="영업활동으로 인한 현금흐름"]['thstrm_amount'].tolist()[0])
                              elif(len(temp_fsall.loc[temp_fsall['account_nm']=="영업활동현금흐름"]['thstrm_amount'].tolist())): # 이름을 "영업활동현금흐름"로 다시 확인해서 값이 있는지 확인
                                temp_row.append(temp_fsall.loc[temp_fsall['account_nm']=="영업활동현금흐름"]['thstrm_amount'].tolist()[0])
                              elif(len(temp_fsall.loc[temp_fsall['account_nm']=="영업활동순현금흐름 합계"]['thstrm_amount'].tolist())): # 이름을 "영업활동순현금흐름 합계"로 다시 확인해서 값이 있는지 확인
                                temp_row.append(temp_fsall.loc[temp_fsall['account_nm']=="영업활동순현금흐름 합계"]['thstrm_amount'].tolist()[0])
                              elif(len(temp_fsall.loc[temp_fsall['account_nm']=="영업활동으로 인한 순현금흐름"]['thstrm_amount'].tolist())): # 이름을 "영업활동으로 인한 순현금흐름"로 다시 확인해서 값이 있는지 확인
                                temp_row.append(temp_fsall.loc[temp_fsall['account_nm']=="영업활동으로 인한 순현금흐름"]['thstrm_amount'].tolist()[0])
                              elif(len(temp_fsall.loc[temp_fsall['account_nm']=="Ⅰ. 영업활동현금흐름"]['thstrm_amount'].tolist())): # 이름을 "Ⅰ. 영업활동현금흐름"로 다시 확인해서 값이 있는지 확인
                                temp_row.append(temp_fsall.loc[temp_fsall['account_nm']=="Ⅰ. 영업활동현금흐름"]['thstrm_amount'].tolist()[0])
                              elif(len(temp_fsall.loc[temp_fsall['account_nm']=="I. 영업활동현금흐름"]['thstrm_amount'].tolist())): # 이름을 "I. 영업활동현금흐름"로 다시 확인해서 값이 있는지 확인
                                temp_row.append(temp_fsall.loc[temp_fsall['account_nm']=="I. 영업활동현금흐름"]['thstrm_amount'].tolist()[0])
                              elif(len(temp_fsall.loc[temp_fsall['account_nm']=="영업으로부터 창출된 현금흐름"]['thstrm_amount'].tolist())): # 이름을 "영업으로부터 창출된 현금흐름"로 다시 확인해서 값이 있는지 확인
                                temp_row.append(temp_fsall.loc[temp_fsall['account_nm']=="영업으로부터 창출된 현금흐름"]['thstrm_amount'].tolist()[0])
                              elif(len(temp_fsall.loc[temp_fsall['account_nm']=="Ⅰ. 영업활동으로 인한 현금흐름"]['thstrm_amount'].tolist())): # 이름을 "Ⅰ. 영업활동으로 인한 현금흐름"로 다시 확인해서 값이 있는지 확인
                                temp_row.append(temp_fsall.loc[temp_fsall['account_nm']=="Ⅰ. 영업활동으로 인한 현금흐름"]['thstrm_amount'].tolist()[0])
                              elif(len(temp_fsall.loc[temp_fsall['account_id']=="ifrs-full_CashFlowsFromUsedInOperatingActivities"]['thstrm_amount'].tolist())): # id가 "ifrs-full_CashFlowsFromUsedInOperatingActivities"로 다시 확인해서 값이 있는지 확인
                                temp_row.append(temp_fsall.loc[temp_fsall['account_id']=="ifrs-full_CashFlowsFromUsedInOperatingActivities"]['thstrm_amount'].tolist()[0])
                              elif(len(temp_fsall.loc[temp_fsall['account_id']=="ifrs_CashFlowsFromUsedInOperatingActivities"]['thstrm_amount'].tolist())): # id가 "ifrs_CashFlowsFromUsedInOperatingActivities"로 다시 확인해서 값이 있는지 확인
                                temp_row.append(temp_fsall.loc[temp_fsall['account_id']=="ifrs_CashFlowsFromUsedInOperatingActivities"]['thstrm_amount'].tolist()[0])
                              elif(i == "285130"): # SK케미칼은 영업활동 현금흐름이 재무제표에 없음
                                temp_row.append("509300000000")
                              else:
                                print("error in 영업활동 현금흐름, i is ", i)

                            else:
                              print("error here")   
                            
                temp_series = pd.Series(temp_row, index=columns)
                fs_temp = fs_temp.append(temp_series, ignore_index = True)
            self.fs_all.append(fsall_temp)
        print(self.fs_all)
        fs_all[0].to_csv("2017fs_top200")
        fs_all[1].to_csv("2018fs_top200")
        fs_all[2].to_csv("2019fs_top200")
        fs_all[3].to_csv("2020fs_top200")
        fs_all[4].to_csv("2021fs_top200")
        
    def collect_top_stocks_info(self): # 시가총액 상위 N개 기업 코드와 섹터
        base_url = "https://finance.naver.com/item/main.naver?code=" # 각 종목 상세 데이터 페이지
        self.new_df = pd.DataFrame(columns=["Name", "Code", "Sector"])
        for row in tqdm(range(len(self.df_krx_top["Code"])), desc = "adding stock info and sector name"):
            current_row = self.df_krx_top.iloc[row]
            temp_series = [current_row["Name"], current_row["Code"]]
            temp_url = base_url + current_row["Code"]
            Web = req.get(temp_url) # Requesting for the website
            S = BeautifulSoup(Web.text, 'lxml') # Creating a BeautifulSoup object and specifying the parser
            if (S.find(class_="h_sub sub_tit7") is None):
                temp_series.append("기타")
            else:
                sector_name = S.find(class_="h_sub sub_tit7").find('a').contents[0]
                temp_series.append(sector_name)

            temp_dict = {'Name':temp_series[0], 'Code':temp_series[1], 'Sector':temp_series[2]}
            self.new_df = self.new_df.append(temp_dict, ignore_index=True)
        self.new_df.to_csv('top200종목_섹터.csv')
            
    def make_sector_data(self): # 수집한 데이터 이용해 섹터 데이터 생성
        sector_dataframe = pd.DataFrame(columns=['Sector', 'Date', 'Open_Total', 'Close_Total', 'Volume_Total', 'Changes_abs_Total', 'Changes_Total', 'adv', 'red', 'stock_num'])
        for sectorname, code, sector in tqdm(self.new_df.values, desc='outer tqdm'):
            temp_df = fdr.DataReader(code, self.START_DATE, self.END_DATE)
            for j in temp_df.index:
                if (j in sector_dataframe["Date"].values) and (sector in sector_dataframe[sector_dataframe["Date"]==j]["Sector"].values): # Date and Sector already created 
                    temp_series = temp_df.loc[j]
                    temp_index = sector_dataframe.loc[(sector_dataframe["Date"]==j) & (sector_dataframe["Sector"]==sector)].index[0]
                    sector_dataframe.at[temp_index, "Open_Total"] += temp_series['Open']
                    sector_dataframe.at[temp_index, "Close_Total"] += temp_series['Close']
                    sector_dataframe.at[temp_index, "Volume_Total"] += temp_series['Volume']
                    sector_dataframe.at[temp_index, "Changes_abs_Total"] += abs(temp_series['Change']) # 주가 변화량 절댓값의 합
                    sector_dataframe.at[temp_index, "Changes_Total"] += (temp_series['Change']) # 주가 변화량의 합
                    sector_dataframe.at[temp_index, "stock_num"] += 1 # 주식 개수
                    if (temp_series['Change']>0):
                      sector_dataframe.at[temp_index, "adv"] += 1  # advance 상승한 주식
                    elif (temp_series['Change']<0):
                      sector_dataframe.at[temp_index, "red"] += 1 # reduce/decline 하락한 주식
                else: # date or sector doesn't exist yet in df
                    # add new row with j date into sector_dataframe
                    temp_series = temp_df.loc[j]
                    if(temp_series['Change'] == 0):
                      new_row = pd.DataFrame([[sector,j,temp_series['Open'],temp_series['Close'],temp_series['Volume'],abs(temp_series['Change']),temp_series['Change'],0,0,1]], columns=['Sector', 'Date', 'Open_Total', 'Close_Total', 'Volume_Total', 'Changes_abs_Total', 'Changes_Total', 'adv', 'red', 'stock_num'])
                    elif(temp_series['Change']>0):
                      new_row = pd.DataFrame([[sector,j,temp_series['Open'],temp_series['Close'],temp_series['Volume'],abs(temp_series['Change']),temp_series['Change'],1,0,1]], columns=['Sector', 'Date', 'Open_Total', 'Close_Total', 'Volume_Total', 'Changes_abs_Total', 'Changes_Total', 'adv', 'red', 'stock_num'])
                    else:
                      new_row = pd.DataFrame([[sector,j,temp_series['Open'],temp_series['Close'],temp_series['Volume'],abs(temp_series['Change']),temp_series['Change'],0,1,1]], columns=['Sector', 'Date', 'Open_Total', 'Close_Total', 'Volume_Total', 'Changes_abs_Total', 'Changes_Total', 'adv', 'red', 'stock_num'])
                    sector_dataframe = pd.concat([sector_dataframe, new_row], ignore_index = True)
        
        sector_dataframe.to_csv(PATH_STOCK)
    
    def run(self):
#         print("Collecting Financial Statements data...")
#         self.collect_fs()
        print("Collecting Stock Sector info...")
        self.collect_top_stocks_info()
        print("Making Sector Data...")
        self.make_sector_data()