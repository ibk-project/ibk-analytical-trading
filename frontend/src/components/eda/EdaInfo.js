import React, {useState, useEffect} from "react";
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import Tooltip from '@mui/material/Tooltip';
import { Container } from "@mui/material";
import styled from 'styled-components'

import ShortSingleLine from '../chart/ShortSingleLine';
import axios from 'axios';
import "../css/EdaInfo.css"

const NewsButton = styled.button`
  background-color: midnightblue;
  color: white;
  border: 0;
  /* width: 100%; */
  width: max-content;
  height: 25px;
  border-radius: 12px;
`;

function EdaInfo(props) {
    const mainColor = "#3d3d3d"
    const sidebarClass = props.isOpen ? "eda-info open" : "eda-info";
    const [edaType, setEdaType] = useState("none"); // none, market, sector, stock
    const [edaName, setEdaName] = useState("none"); // none, (name)
    const [edaCode, setEdaCode] = useState("none"); // none, (code)
    const [edaFlag, setEdaFlag] = useState(false);

    const [currentSimilarDateEnd, setCurrentSimilarDateEnd] = useState("none");
    const [currentSimilarDateStart, setCurrentSimlilarDateStart] = useState("none");
    const [currentSelectedFeature, setCurrentSelectedFeature] = useState("KOSDAQ");
    const [similarSelectedFeature, setSimilarSelectedFeature] = useState("none");
    const [newsData, setNewsData] = useState();
    // const [similarDateEDAReady, setSimilarDateEDAReady] = useState(false);

    const [marketData, setMarketData] = useState({
      currentDate: '2022-06-08~2022-07-08',
      // similarDates: ['2021-05-21~2021-06-19','2021-05-28~2021-06-26','2020-10-08~2020-11-06','2019-03-02~2019-03-31','2019-01-21~2019-02-19','2019-01-13~2019-02-11','2017-06-08~2017-07-07'],
      similarDates: ['2021-06-19','2021-06-26','2020-11-06','2019-03-31','2019-02-19','2019-02-11','2017-07-07'],
      newsKeywords: [["아베 피습", "2022-07-08"], ["코스피 상승", "2022-07-07"], ["바이던 음주", "2022-07-06"], ["옥수수 수염차", "2022-07-05"], ["일석 이조", "2022-07-04"]],
      kospi: [],
      kosdaq: [],
      brent: [],
      usdkrw: [],
      copper: [],
      bicheol: [],
      bank: [],
      oil: [],
      cosmetics: [],
      realestate: [],
      space: [],
    });

    const [similarDateData, setSimilarDateData] = useState({
      newsKeywords: [["아베 피습", "2022-07-08"], ["코스피 상승", "2022-07-07"], ["바이던 음주", "2022-07-06"], ["옥수수 수염차", "2022-07-05"], ["일석 이조", "2022-07-04"]],
      kospi: [],
      kosdaq: [],
      brent: [],
      usdkrw: [],
      copper: [],
      bicheol: [],
      bank: [],
      oil: [],
      cosmetics: [],
      realestate: [],
      space: [],
    });

    const getIndex = async(tempcode, startDate, endDate, today) => {
      await axios.get('/api/data-management/index/get', {
        params: {
          "code": tempcode,
          "date": startDate,
          "e_date": endDate,
          "type": "line"
        }
      }).then(res => {
        if(today===true){
          let temp_marketData = marketData;
          if(tempcode==="KQ11")
            temp_marketData.kosdaq = res.data.data;
          else if(tempcode==="KS11")
            temp_marketData.kospi = res.data.data;
          else if(tempcode==="USD/KRW")
            temp_marketData.usdkrw = res.data.data;
          setMarketData(temp_marketData);
        } else {
          let temp_similarData = similarDateData;
          if(tempcode==="KQ11")
            temp_similarData.kosdaq = res.data.data;
          else if(tempcode==="KS11")
            temp_similarData.kospi = res.data.data;
          else if(tempcode==="USD/KRW")
            temp_similarData.usdkrw = res.data.data;
          setSimilarDateData(temp_similarData);
        }
        
        // setIndexData(res.data.data);
        // makeIndexAnalysis(res.data.data);
      });
    }
    const getCommodity = async(tempcode, startDate, endDate, today) => {
      await axios.get('/api/data-management/commodity/one-data', {
        params: {
          "code": tempcode,
          "date": startDate,
          "e_date": endDate
        }
      }).then(res => {

        if(today===true){
          let temp_marketData = marketData;
          if(tempcode==="CL")
            temp_marketData.brent = res.data.data;
          else if(tempcode==="HG")
            temp_marketData.copper = res.data.data; 
          setMarketData(temp_marketData);
        } else {
          let temp_similarData = similarDateData;
          if(tempcode==="CL")
            temp_similarData.brent = res.data.data;
          else if(tempcode==="HG")
            temp_similarData.copper = res.data.data; 
          setSimilarDateData(temp_similarData);
        }
      });
    }

    const getSector = async(sectorName, startDate, endDate, today) => {
      await axios.get('/api/data-management/stock/sector-avg', {
        params: {
          "start_date": startDate,
          "end_date": endDate,
          "sector_name": sectorName
        }
      }).then(res => {
        res.data = res.data.data;
        if(today===true) {
          let temp_marketData = marketData;
          if(sectorName === "비철금속") {
            temp_marketData.bicheol = res.data;
          } else if(sectorName === "은행") {
            temp_marketData.bank = res.data;
          } else if(sectorName === "석유와가스") {
            temp_marketData.oil = res.data;
          } else if(sectorName === "화장품") {
            temp_marketData.cosmetics = res.data;
          } else if(sectorName === "부동산") {
            temp_marketData.realestate = res.data;
          } else if(sectorName === "우주항공과국방") {
            temp_marketData.space = res.data;
          } else if(sectorName === "양방향미디어와서비스") {
            temp_marketData.interactivemedia = res.data;
          } else if(sectorName === "게임엔터테인먼트") {
            temp_marketData.game = res.data;
          } else if(sectorName === "IT서비스") {
            temp_marketData.itservice = res.data;
          } else if(sectorName === "디스플레이패널") {
            temp_marketData.displaypanel = res.data;
          } else if(sectorName === "항공사") {
            temp_marketData.airplane = res.data;
          } else if(sectorName === "전자장비와기기") {
            temp_marketData.electricdevice = res.data;
          } else if(sectorName === "에너지장비및서비스") {
            temp_marketData.energydevice = res.data;
          } else if(sectorName === "조선") {
            temp_marketData.shipbuilding = res.data;
          } else if(sectorName === "건강관리업체및서비스") {
            temp_marketData.healthcare = res.data;
          } else if(sectorName === "출판") {
            temp_marketData.publish = res.data;
          } else if(sectorName === "반도체와반도체장비") {
            temp_marketData.semiconductor = res.data;
          } else if(sectorName === "방송과엔터테인먼트") {
            temp_marketData.entertainment = res.data;
          } else if(sectorName === "전기유틸리티") {
            temp_marketData.electricutility = res.data;
          } else if(sectorName === "문구류") {
            temp_marketData.pencil = res.data;
          } else if(sectorName === "통신장비") {
            temp_marketData.communication = res.data;
          } else if(sectorName === "도로와철도운송") {
            temp_marketData.road = res.data;
          } else if(sectorName === "생물공학") {
            temp_marketData.biology = res.data;
          } else if(sectorName === "해운사") {
            temp_marketData.shipping = res.data;
          } else if(sectorName === "소프트웨어") {
            temp_marketData.software = res.data;
          } else if(sectorName === "건설") {
            temp_marketData.construction = res.data;
          } else if(sectorName === "복합유틸리티") {
            temp_marketData.complexutility = res.data;
          } else if(sectorName === "디스플레이장비및부품") {
            temp_marketData.displaydevice = res.data;
          } else if(sectorName === "전자제품") {
            temp_marketData.electronics = res.data;
          } else if(sectorName === "전문소매") {
            temp_marketData.retail = res.data;
          } else if(sectorName === "화학") {
            temp_marketData.chemistry = res.data;
          }
          /*
            {'code': '277', 'name': '창업투자'},
            {'code': '303', 'name': '가구'},
            {'code': '298', 'name': '가정용기기와용품'},
            {'code': '321', 'name': '증권'},
            {'code': '296', 'name': '운송인프라'},
            {'code': '288', 'name': '건강관리기술'},
            {'code': '317', 'name': '호텔,레스토랑,레저'},
            {'code': '339', 'name': '다각화된소비자서비스'},
            {'code': '274', 'name': '섬유,의류,신발,호화품'},
            {'code': '283', 'name': '전기제품'},
            {'code': '308', 'name': '인터넷과카탈로그소매'},
            {'code': '292', 'name': '핸드셋'},
            {'code': '311', 'name': '포장재'},
            {'code': '281', 'name': '건강관리장비와용품'},
            {'code': '299', 'name': '기계'},
            {'code': '318', 'name': '종이와목재'},
            {'code': '273', 'name': '자동차'},
            {'code': '310', 'name': '광고'},
            {'code': '262', 'name': '생명과학도구및서비스'},
            {'code': '261', 'name': '제약'},
            {'code': '276', 'name': '복합기업'},
            {'code': '309', 'name': '음료'},
            {'code': '337', 'name': '카드'},
            {'code': '289', 'name': '건축자재'},
            {'code': '293', 'name': '컴퓨터와주변기기'},
            {'code': '271', 'name': '레저용장비와제품'},
            {'code': '270', 'name': '자동차부품'},
            {'code': '306', 'name': '전기장비'},
            {'code': '304', 'name': '철강'},
            {'code': '265', 'name': '판매업체'},
            {'code': '320', 'name': '건축제품'},
            {'code': '338', 'name': '사무용전자제품'},
            {'code': '264', 'name': '백화점과일반상점'},
            {'code': '297', 'name': '가정용품'},
            {'code': '324', 'name': '상업서비스와공급품'},
            {'code': '290', 'name': '교육서비스'},
            {'code': '326', 'name': '항공화물운송과물류'},
            {'code': '333', 'name': '무선통신서비스'},
            {'code': '315', 'name': '손해보험'},
            {'code': '302', 'name': '식품과기본식료품소매'},
            {'code': '312', 'name': '가스유틸리티'},
            {'code': '330', 'name': '생명보험'},
            {'code': '336', 'name': '다각화된통신서비스'},
            {'code': '319', 'name': '기타금융'},
            {'code': '268', 'name': '식품'},
            {'code': '334', 'name': '무역회사와판매업체'},
            {'code': '275', 'name': '담배'},
          */
          setMarketData(temp_marketData);
        } else {
          let temp_similarData = similarDateData;
          if(sectorName === "비철금속") {
            temp_similarData.bicheol = res.data;
          } else if(sectorName === "은행") {
            temp_similarData.bank = res.data;
          } else if(sectorName === "석유와가스") {
            temp_similarData.oil = res.data;
          } else if(sectorName === "화장품") {
            temp_similarData.cosmetics = res.data;
          } else if(sectorName === "부동산") {
            temp_similarData.realestate = res.data;
          } else if(sectorName === "우주항공과국방") {
            temp_similarData.space = res.data;
          } else if(sectorName === "양방향미디어와서비스") {
            temp_similarData.interactivemedia = res.data;
          } else if(sectorName === "게임엔터테인먼트") {
            temp_similarData.game = res.data;
          } else if(sectorName === "IT서비스") {
            temp_similarData.itservice = res.data;
          } else if(sectorName === "디스플레이패널") {
            temp_similarData.displaypanel = res.data;
          } else if(sectorName === "항공사") {
            temp_similarData.airplane = res.data;
          } else if(sectorName === "전자장비와기기") {
            temp_similarData.electricdevice = res.data;
          } else if(sectorName === "에너지장비및서비스") {
            temp_similarData.energydevice = res.data;
          } else if(sectorName === "조선") {
            temp_similarData.shipbuilding = res.data;
          } else if(sectorName === "건강관리업체및서비스") {
            temp_similarData.healthcare = res.data;
          } else if(sectorName === "출판") {
            temp_similarData.publish = res.data;
          } else if(sectorName === "반도체와반도체장비") {
            temp_similarData.semiconductor = res.data;
          } else if(sectorName === "방송과엔터테인먼트") {
            temp_similarData.entertainment = res.data;
          } else if(sectorName === "전기유틸리티") {
            temp_similarData.electricutility = res.data;
          } else if(sectorName === "문구류") {
            temp_similarData.pencil = res.data;
          } else if(sectorName === "통신장비") {
            temp_similarData.communication = res.data;
          } else if(sectorName === "도로와철도운송") {
            temp_similarData.road = res.data;
          } else if(sectorName === "생물공학") {
            temp_similarData.biology = res.data;
          } else if(sectorName === "해운사") {
            temp_similarData.shipping = res.data;
          } else if(sectorName === "소프트웨어") {
            temp_similarData.software = res.data;
          } else if(sectorName === "건설") {
            temp_similarData.construction = res.data;
          } else if(sectorName === "복합유틸리티") {
            temp_similarData.complexutility = res.data;
          } else if(sectorName === "디스플레이장비및부품") {
            temp_similarData.displaydevice = res.data;
          } else if(sectorName === "전자제품") {
            temp_similarData.electronics = res.data;
          } else if(sectorName === "전문소매") {
            temp_similarData.retail = res.data;
          } else if(sectorName === "화학") {
            temp_similarData.chemistry = res.data;
          }
          setSimilarDateData(temp_similarData);
        }
        
      });
    }

    const getSimilarDates = async() => {
      console.log("new similar dates for ", props.edaName);
      // 현재 시점으로 가정하고 유사 시점 가져옴
      let modeltype = (props.edaType==="sector"?"sector/"+props.edaCode:"market")
      // await axios.get('https://node02.spccluster.skku.edu:10638/market/model/'+props.edaCode)
      // .then(res => {
      //   console.log("axios res similarpoint is", res);
      //   let temp_marketData = marketData;
      //   temp_marketData.similarDates = res.points;
      //   setMarketData(temp_marketData);
      // });
      await axios.get(`/api/data-management/model/${modeltype}`).then(res => {
        console.log("model similar points res is ", res.data);
        let temp_marketData = marketData;

        if(modeltype==="market") {
          temp_marketData.similarDates = res.data.Result.points;
          console.log("temp_marketData similar dates is ", temp_marketData.similarDates);
        }
        else {
          let temp_array = res.data[0]['Similar Dates'].slice(1,-1).split(', ');
          temp_array = temp_array.map(x => x.split("~")[1]);
          console.log("temp_array is ", temp_array);
          //temp_marketData.similarDates = temp_array;
          temp_marketData.similarDates = temp_array.map(x => x.slice(0,-1));
          // temp_marketData.similarDates = temp_array.map(x => x.splice(0,-1));
        }
        setMarketData(temp_marketData);
      });
      // 100:market clustering, 322:비철금속, 301:은행, 313:석유와가스, 266:화장품, 280:부동산, 284:우주항공과국방
    }

    const getNews = async(date, isToday) => {
      await axios.get('/api/data-management/model/news').then(res => {
        setNewsData(res.data);
        let todaynews = [];
        let newsLen = 0;
        let tempday = date;
        // if(date.length>12){
        //   tempday = date.split("~")[1];
        // } else {
        //   tempday = date;
        // }
        
        while (newsLen<5){
          if(!res.data[tempday]){
            console.error("news date error", tempday, res.data[tempday]);
            break;
          }
          let tempnews = res.data[tempday];
          if(tempnews[0]!="" && tempnews[1]!=""){
            todaynews.push([(tempnews[0]+" "+tempnews[1]), tempday]);
            newsLen += 1;
          }
          let split_dates = tempday.split("-"); // 기존 형식 yyyy-mm-dd
          let day_dates = parseInt(split_dates[2]);
          let month_dates = parseInt(split_dates[1]);
          if(day_dates === 1){
            split_dates[2] = "28";
            if(month_dates === 1){
              split_dates[1] = "12";
              split_dates[0] -= 1;
            } else{
              split_dates[1] -= 1;
            }
          } else {
            split_dates[2] -= 1;
          }
          split_dates[1] = ('0'+split_dates[1]).slice(-2);
          split_dates[2] = ('0'+split_dates[2]).slice(-2);
          tempday = split_dates.join('-');
        }
        if(isToday === true){
          let temp_marketData = marketData;
          temp_marketData.newsKeywords = todaynews;
          setMarketData(temp_marketData);
        } else {
          let temp_similarData = similarDateData;
          temp_similarData.newsKeywords = todaynews;
          setSimilarDateData(temp_similarData);
        }
      })
    }

    useEffect(() => {
      console.log("eda code changed");
      getSimilarDates();
      if(props.edaType === "sector"){
        let startDate = marketData.currentDate.split("~")[0];
        let endDate = marketData.currentDate.split("~")[1];
        getSector(props.edaName, startDate, endDate, true);
      }
    }, [props.edaCode])

    useEffect(() => {
      if (props.edaType === "none") {
        setEdaFlag(false);
        setEdaType("none");
        setEdaName("none");
        setEdaCode("none");
      }
      else {
        setEdaFlag(true);
        setEdaType(props.edaType);
        setEdaName(props.edaName);
        setEdaCode(props.edaCode);
      }

      let startDate = marketData.currentDate.split("~")[0];
      let endDate = marketData.currentDate.split("~")[1];

      getSector("비철금속", startDate, endDate, true);
      getSector("은행", startDate, endDate, true);
      getSector("석유와가스", startDate, endDate, true);
      getSector("화장품", startDate, endDate, true);
      getSector("부동산", startDate, endDate, true);
      getSector("우주항공과국방", startDate, endDate, true);
      getSector("양방향미디어와서비스", startDate, endDate, true);
      getSector("게임엔터테인먼트", startDate, endDate, true);
      getSector("IT서비스", startDate, endDate, true);
      getSector("디스플레이패널", startDate, endDate, true);
      getSector("항공사", startDate, endDate, true);
      getSector("전자장비와기기", startDate, endDate, true);
      getSector("에너지장비및서비스", startDate, endDate, true);
      getSector("조선", startDate, endDate, true);
      getSector("건강관리업체및서비스", startDate, endDate, true);
      getSector("출판", startDate, endDate, true);
      getSector("반도체와반도체장비", startDate, endDate, true);
      getSector("방송과엔터테인먼트", startDate, endDate, true);
      getSector("전기유틸리티", startDate, endDate, true);
      getSector("문구류", startDate, endDate, true);
      getSector("통신장비", startDate, endDate, true);
      getSector("도로와철도운송", startDate, endDate, true);
      getSector("생물공학", startDate, endDate, true);
      getSector("해운사", startDate, endDate, true);
      getSector("소프트웨어", startDate, endDate, true);
      getSector("건설", startDate, endDate, true);
      getSector("복합유틸리티", startDate, endDate, true);
      getSector("디스플레이장비및부품", startDate, endDate, true);
      getSector("전자제품", startDate, endDate, true);
      getSector("전문소매", startDate, endDate, true);
      getSector("화학", startDate, endDate, true);

      // kospi 가져오기
      getIndex("KS11", startDate, endDate, true);
      // kosdaq 가져오기
      getIndex("KQ11", startDate, endDate, true);
      // USD/KRW 가져오기
      getIndex("USD/KRW", startDate, endDate, true);
      // 브랜트유 가져오기
      getCommodity("CL", startDate, endDate, true);
      // 구리 선물 가져오기
      getCommodity("HG", startDate, endDate, true);
      // 유사 시점 목록 가져오기
      
      
      getSimilarDates();

      getNews(endDate, true);
      // 백엔드에서 현재 시점 기본 marketData를 setMarketData에 저장 (similarDates, newsKeywords)
    }, [])

    useEffect(() => {
      if (currentSimilarDateEnd !== "none") {
        // 한 달 이전으로 빼기
        let currentSimilarDate_end = currentSimilarDateEnd;
        let split_dates = currentSimilarDateEnd.split("-"); // 기존 형식 yyyy-mm-dd
        let month_dates = parseInt(split_dates[1]);
        if(month_dates === 1){
          split_dates[0] -= 1;
          split_dates[1] = "12";
        } else {
          split_dates[1] -= 1;
        }
        
        split_dates[1] = ('0'+split_dates[1]).slice(-2);
        // split_dates[2] = ('0'+split_dates[2]).slice(-2);
        let currentSimilarDate_start = split_dates.join('-');
        setCurrentSimlilarDateStart(currentSimilarDate_start);

        // getSimilarDateData
        // 백엔드에서 currentSimilarDateEnd 날짜의 (뉴스 키워드 5개)와 주요 지수(kospi, brent유, KRW/USD, copper선물) 정보 가져와서 setSimilarDateData 에 저장

        getSector("비철금속", currentSimilarDate_start, currentSimilarDate_end, false);
        getSector("은행", currentSimilarDate_start, currentSimilarDate_end, false);
        getSector("석유와가스", currentSimilarDate_start, currentSimilarDate_end, false);
        getSector("화장품", currentSimilarDate_start, currentSimilarDate_end, false);
        getSector("부동산", currentSimilarDate_start, currentSimilarDate_end, false);
        getSector("우주항공과국방", currentSimilarDate_start, currentSimilarDate_end, false);
        getSector("양방향미디어와서비스", currentSimilarDate_start, currentSimilarDate_end, false);
        getSector("게임엔터테인먼트", currentSimilarDate_start, currentSimilarDate_end, false);
        getSector("IT서비스", currentSimilarDate_start, currentSimilarDate_end, false);
        getSector("디스플레이패널", currentSimilarDate_start, currentSimilarDate_end, false);
        getSector("항공사", currentSimilarDate_start, currentSimilarDate_end, false);
        getSector("전자장비와기기", currentSimilarDate_start, currentSimilarDate_end, false);
        getSector("에너지장비및서비스", currentSimilarDate_start, currentSimilarDate_end, false);
        getSector("조선", currentSimilarDate_start, currentSimilarDate_end, false);
        getSector("건강관리업체및서비스", currentSimilarDate_start, currentSimilarDate_end, false);
        getSector("출판", currentSimilarDate_start, currentSimilarDate_end, false);
        getSector("반도체와반도체장비", currentSimilarDate_start, currentSimilarDate_end, false);
        getSector("방송과엔터테인먼트", currentSimilarDate_start, currentSimilarDate_end, false);
        getSector("전기유틸리티", currentSimilarDate_start, currentSimilarDate_end, false);
        getSector("문구류", currentSimilarDate_start, currentSimilarDate_end, false);
        getSector("통신장비", currentSimilarDate_start, currentSimilarDate_end, false);
        getSector("도로와철도운송", currentSimilarDate_start, currentSimilarDate_end, false);
        getSector("생물공학", currentSimilarDate_start, currentSimilarDate_end, false);
        getSector("해운사", currentSimilarDate_start, currentSimilarDate_end, false);
        getSector("소프트웨어", currentSimilarDate_start, currentSimilarDate_end, false);
        getSector("건설", currentSimilarDate_start, currentSimilarDate_end, false);
        getSector("복합유틸리티", currentSimilarDate_start, currentSimilarDate_end, false);
        getSector("디스플레이장비및부품", currentSimilarDate_start, currentSimilarDate_end, false);
        getSector("전자제품", currentSimilarDate_start, currentSimilarDate_end, false);
        getSector("전문소매", currentSimilarDate_start, currentSimilarDate_end, false);
        getSector("화학", currentSimilarDate_start, currentSimilarDate_end, false);

        // kospi 가져오기
        getIndex("KS11", currentSimilarDate_start, currentSimilarDate_end, false);
        // kosdaq 가져오기
        getIndex("KQ11", currentSimilarDate_start, currentSimilarDate_end, false);
        // USD/KRW 가져오기
        getIndex("USD/KRW", currentSimilarDate_start, currentSimilarDate_end, false);
        // 브랜트유 가져오기
        getCommodity("CL", currentSimilarDate_start, currentSimilarDate_end, false);
        // 구리 선물 가져오기
        getCommodity("HG", currentSimilarDate_start, currentSimilarDate_end, false);


        getNews(currentSimilarDate_end, false);

        if(similarSelectedFeature === 'none')
          setSimilarSelectedFeature("KOSPI");
      }
    }, [currentSimilarDateEnd])

    
    const featureSelection1 = ["KOSDAQ", "BRENT", "USD/KRW", "COPPER"];
    const featureSelection2 = ["KOSPI", "KOSDAQ", "BRENT", "USD/KRW", "COPPER"];

    const buttonSX = {
      "&:hover": {
        borderColor:'blue'
      },
    };

    const similarDateClick = (e) => {
      setCurrentSimilarDateEnd(e.target.outerText);
      // ex. '2021-05-21~2020-06-19'
    };
    const featureClick = (e) => {
      setCurrentSelectedFeature(e.target.outerText);
    }
    const featureClick2 = (e) => {
      setSimilarSelectedFeature(e.target.outerText);
    }

  
    return (
        <div className={sidebarClass}>
            <div id="eda-info-container">
                {edaFlag ?
                <>
                <Divider key={"22224"} variant="middle" sx={{mb:"5px", fontSize:"larger"}}> 기준 시점 </Divider>
                {/* 기준 시점 파트 */}
                <Box key={"556554"} sx={{ width: '100%' }}>
                  <Grid container key={"0020534"} style={{textAlign: "center"}}>
                    <Grid item key={"grid100"} xs={6}> {/* 왼쪽 파트 */}
                      <Chip key={"1234"} label={(props.edaName==="전체 시장"?("KOSPI"):(props.edaName)) + "  " + marketData.currentDate}  sx={{ fontSize: 20, width: 500, mt: 2, mb: 1, bgcolor: mainColor, color:'white' }}/>
                      {/* <Typography key={"1235"} gutterBottom variant="h4" component="div" sx={{my:4}}>
                        Chart Here
                      </Typography> */}
                      <ShortSingleLine 
                      title={(props.edaName==="전체 시장"?("KOSPI"):
                      (props.edaName+(props.edaType==="sector"?" 섹터":"")))} 
                      data={((props.edaType==="market")?(marketData.kospi):(
                      (props.edaName==="비철금속")?(marketData.bicheol):
                      (props.edaName==="은행")?(marketData.bank):
                      (props.edaName==="화장품")?(marketData.cosmetics):
                      (props.edaName==="석유와가스")?(marketData.oil):
                      (props.edaName==="부동산")?(marketData.realestate):
                      (props.edaName==="우주항공과국방")?(marketData.space):
                      (props.edaName==="양방향미디어와서비스")?(marketData.interactivemedia):
                      (props.edaName==="게임엔터테인먼트")?(marketData.game):
                      (props.edaName==="IT서비스")?(marketData.itservice):
                      (props.edaName==="디스플레이패널")?(marketData.displaypanel):
                      (props.edaName==="항공사")?(marketData.airplane):
                      (props.edaName==="전자장비와기기")?(marketData.electricdevice):
                      (props.edaName==="에너지장비및서비스")?(marketData.energydevice):
                      (props.edaName==="조선")?(marketData.shipbuilding):
                      (props.edaName==="건강관리업체및서비스")?(marketData.healthcare):
                      (props.edaName==="출판")?(marketData.publish):
                      (props.edaName==="반도체와반도체장비")?(marketData.semiconductor):
                      (props.edaName==="방송과엔터테인먼트")?(marketData.entertainment):
                      (props.edaName==="전기유틸리티")?(marketData.electricutility):
                      (props.edaName==="문구류")?(marketData.pencil):
                      (props.edaName==="통신장비")?(marketData.communication):
                      (props.edaName==="도로와철도운송")?(marketData.road):
                      (props.edaName==="생물공학")?(marketData.biology):
                      (props.edaName==="해운사")?(marketData.shipping):
                      (props.edaName==="소프트웨어")?(marketData.software):
                      (props.edaName==="건설")?(marketData.construction):
                      (props.edaName==="복합유틸리티")?(marketData.complexutility):
                      (props.edaName==="디스플레이장비및부품")?(marketData.displaydevice):
                      (props.edaName==="전자제품")?(marketData.electronics):
                      (props.edaName==="전문소매")?(marketData.retail):(marketData.chemistry) //화학
                      ))} 
                      place={"left"}/>
                    </Grid>
                    <Grid item key={"grid101"} xs={6} sx={{textAlign: 'center', pb:'7px'}}> {/* 오른쪽 파트 */}
                      <Chip key={"1236"} label={marketData.currentDate} sx={{ borderRadius: 3, fontSize: 20, width: 400, mt: 2, mb: 1, bgcolor: "midnightblue", color:'white' }}/>
                      <Grid key={"1237"} container align="center" justifyContent="center" alignItems="center" sx={{ maxWidth: 500, textAlign: 'center', mx:'auto'}}>
                        <Grid item key={"99192"} sm={2} sx={{ border:0, width:'100%', height:'100%', bgcolor:'white', color:'black', borderRadius:0}}>
                              주요 지수:
                        </Grid>
                        {(props.edaName==="전체 시장"?featureSelection1:featureSelection2).map((value) => (
                          <>
                          {(currentSelectedFeature===value)?
                            <Grid item key={value} sm={2}><Button key={"1238"+{value}} onClick={(e) => featureClick(e)} sx={{ border:0, width:'100%', height:'100%', bgcolor:'black', color:'white', borderColor:'black', borderRadius:0}}>
                              {value}
                            </Button></Grid>
                          :
                            <Grid item key={value} sm={2}><Button key={"1234"+{value}} onClick={(e) => featureClick(e)} sx={{ border:0, width:'100%', height:'100%',  bgcolor:'white', color:'black', borderRadius:0}}>
                              {value}
                            </Button></Grid>
                          }
                          </>
                        ))}
                      </Grid>
                      <Box >
                        {props.edaName==="전체 시장"?
                          <></>
                          :
                          (currentSelectedFeature==="KOSPI" && <ShortSingleLine title={"KOSPI"} data={marketData.kospi} />)
                        }
                        {currentSelectedFeature==="KOSDAQ" && <ShortSingleLine title={"KOSDAQ"} data={marketData.kosdaq} />}
                        {currentSelectedFeature==="BRENT" && <ShortSingleLine title={"BRENT"} data={marketData.brent} />}
                        {currentSelectedFeature==="USD/KRW" && <ShortSingleLine title={"USD/KRW"} data={marketData.usdkrw} />}
                        {currentSelectedFeature==="COPPER" && <ShortSingleLine title={"COPPER"} data={marketData.copper} />}
                      </Box>
                      
                      <Box key={"1239"}>
                        <Grid container key={"1240"} align="center" justifyContent="center" alignItems="center" sx={{ maxWidth: 500, textAlign: 'center', mx:'auto'}}>
                          <Grid item key={"1241"} sm={4} sx={{ px:1, pt:1 }}><NewsButton key={"1242"} style={{backgroundColor:'black', color:'white'}}>
                            최근 주요 뉴스 키워드
                          </NewsButton></Grid>
                          {marketData.newsKeywords.map((value) => (
                            <>
                              <Grid item key={value[0]} sx={{ px:1, pt:1 }}><Tooltip key={"1234123"+value[0]} title={value[1]} arrow><NewsButton key={"1234532"+value[0]}>
                                {value[0]}
                              </NewsButton></Tooltip></Grid>
                            </>
                          ))}
                        </Grid>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
                {/* 중간 분리선 */}
                <Divider key={"22225"} variant="middle" sx={{mt:"20px", mb:"5px", fontSize:"larger"}}> 유사 시점 </Divider>
                {/* 유사 시점 파트 */}
                <Box key={"002020"} sx={{ width: '100%', mb:'80px' }}>
                  <Grid container key={"1234754"} style={{textAlign: "center"}}>
                    <Grid item key={"341234"} xs={6}> {/* 왼쪽 파트 */}
                      <Chip key={"512342"} color="default" label={"유사 시점 탐색 결과"} sx={{ fontSize: 20, width: 500, mt: 5, bgcolor: mainColor, color:'white', borderRadius:1 }}/>
                      <Paper key={"612342"} style={{minHeight: 100, maxHeight: 250, maxWidth: 500, overflow: 'auto'}} sx={{ mx:'auto', mb: 2 }}>

                        <List key="929294">
                          {marketData.similarDates.map((value) => (
                            <ListItem key={value} sx={{py:0.5}} >
                              {(currentSimilarDateEnd===value)?
                                <ListItemButton key={"button1"+{value}} onClick={(e) => similarDateClick(e)} sx={{bgcolor:'midnightblue', borderRadius: 3, color:'white', buttonSX}}>
                                  <ListItemText key={"text1"+value} primary={`${value}`} />
                                </ListItemButton>
                                :
                                <ListItemButton key={"button1"+value} onClick={(e) => similarDateClick(e)} sx={{bgcolor: 'lightgrey', borderRadius: 3, color:'black'}}>
                                  <ListItemText key={"text1"+value} primary={`${value}`} />
                                </ListItemButton>
                              }
                              
                            </ListItem>
                          ))}
                        </List>
                      </Paper>

                      {currentSimilarDateEnd==='none'?(
                        <>
                        </>
                      ):(<>
                        <Chip key={"1237"} label={(props.edaName==="전체 시장"?("KOSPI"):(props.edaName)) + "  " + currentSimilarDateStart+"~"+currentSimilarDateEnd}  sx={{ fontSize: 20, width: 500, mt: 2, mb: 1, bgcolor: mainColor, color:'white' }}/>
                        <ShortSingleLine 
                          title={(props.edaName==="전체 시장"?("KOSPI"):
                          (props.edaName+(props.edaType==="sector"?" 섹터":"")))} 
                          data={((props.edaType==="market")?(similarDateData.kospi):(
                          (props.edaName==="비철금속")?(similarDateData.bicheol):
                          (props.edaName==="은행")?(similarDateData.bank):
                          (props.edaName==="화장품")?(similarDateData.cosmetics):
                          (props.edaName==="석유와가스")?(similarDateData.oil):
                          (props.edaName==="부동산")?(similarDateData.realestate):
                          (props.edaName==="우주항공과국방")?(similarDateData.space):
                          (props.edaName==="양방향미디어와서비스")?(similarDateData.interactivemedia):
                          (props.edaName==="게임엔터테인먼트")?(similarDateData.game):
                          (props.edaName==="IT서비스")?(similarDateData.itservice):
                          (props.edaName==="디스플레이패널")?(similarDateData.displaypanel):
                          (props.edaName==="항공사")?(similarDateData.airplane):
                          (props.edaName==="전자장비와기기")?(similarDateData.electricdevice):
                          (props.edaName==="에너지장비및서비스")?(similarDateData.energydevice):
                          (props.edaName==="조선")?(similarDateData.shipbuilding):
                          (props.edaName==="건강관리업체및서비스")?(similarDateData.healthcare):
                          (props.edaName==="출판")?(similarDateData.publish):
                          (props.edaName==="반도체와반도체장비")?(similarDateData.semiconductor):
                          (props.edaName==="방송과엔터테인먼트")?(similarDateData.entertainment):
                          (props.edaName==="전기유틸리티")?(similarDateData.electricutility):
                          (props.edaName==="문구류")?(similarDateData.pencil):
                          (props.edaName==="통신장비")?(similarDateData.communication):
                          (props.edaName==="도로와철도운송")?(similarDateData.road):
                          (props.edaName==="생물공학")?(similarDateData.biology):
                          (props.edaName==="해운사")?(similarDateData.shipping):
                          (props.edaName==="소프트웨어")?(similarDateData.software):
                          (props.edaName==="건설")?(similarDateData.construction):
                          (props.edaName==="복합유틸리티")?(similarDateData.complexutility):
                          (props.edaName==="디스플레이장비및부품")?(similarDateData.displaydevice):
                          (props.edaName==="전자제품")?(similarDateData.electronics):
                          (props.edaName==="전문소매")?(similarDateData.retail):(similarDateData.chemistry)
                          ))} 
                          place={"left"}
                          currentData={((props.edaType==="market")?(marketData.kospi):(
                            (props.edaName==="비철금속")?(marketData.bicheol):
                            (props.edaName==="은행")?(marketData.bank):
                            (props.edaName==="화장품")?(marketData.cosmetics):
                            (props.edaName==="석유와가스")?(marketData.oil):
                            (props.edaName==="부동산")?(marketData.realestate):
                            (props.edaName==="우주항공과국방")?(marketData.space):
                            (props.edaName==="양방향미디어와서비스")?(marketData.interactivemedia):
                            (props.edaName==="게임엔터테인먼트")?(marketData.game):
                            (props.edaName==="IT서비스")?(marketData.itservice):
                            (props.edaName==="디스플레이패널")?(marketData.displaypanel):
                            (props.edaName==="항공사")?(marketData.airplane):
                            (props.edaName==="전자장비와기기")?(marketData.electricdevice):
                            (props.edaName==="에너지장비및서비스")?(marketData.energydevice):
                            (props.edaName==="조선")?(marketData.shipbuilding):
                            (props.edaName==="건강관리업체및서비스")?(marketData.healthcare):
                            (props.edaName==="출판")?(marketData.publish):
                            (props.edaName==="반도체와반도체장비")?(marketData.semiconductor):
                            (props.edaName==="방송과엔터테인먼트")?(marketData.entertainment):
                            (props.edaName==="전기유틸리티")?(marketData.electricutility):
                            (props.edaName==="문구류")?(marketData.pencil):
                            (props.edaName==="통신장비")?(marketData.communication):
                            (props.edaName==="도로와철도운송")?(marketData.road):
                            (props.edaName==="생물공학")?(marketData.biology):
                            (props.edaName==="해운사")?(marketData.shipping):
                            (props.edaName==="소프트웨어")?(marketData.software):
                            (props.edaName==="건설")?(marketData.construction):
                            (props.edaName==="복합유틸리티")?(marketData.complexutility):
                            (props.edaName==="디스플레이장비및부품")?(marketData.displaydevice):
                            (props.edaName==="전자제품")?(marketData.electronics):
                            (props.edaName==="전문소매")?(marketData.retail):(marketData.chemistry) //화학
                            ))}/>
                        </>
                      )}
                      
                    </Grid>
                    <Grid item key={"6112344"} xs={6} sx={{textAlign: 'center', paddingTop:'5px'}}> {/* 오른쪽 파트 */}
                    {/* {similarDateEDAReady===false?( */}
                    {similarSelectedFeature==="none"?(
                      <>
                      <Typography gutterBottom key={"777777"} variant="h6" component="div" sx={{my:15}}>
                        유사시점을 선택해주세요
                      </Typography>
                      </>
                    ):(
                      <>
                      <Chip label={currentSimilarDateStart+"~"+currentSimilarDateEnd} key={"8765864"} sx={{ borderRadius: 3, fontSize: 20, width: 400, mt: 2, mb: 1, bgcolor: "midnightblue", color:'white' }}/>
                      <Grid container key={"3214294"} align="center" justifyContent="center" alignItems="center" sx={{ maxWidth: 500, textAlign: 'center', mx:'auto'}}>
                        <Grid item key={"99192"} sm={2} sx={{ border:0, width:'100%', height:'100%', bgcolor:'white', color:'black', borderRadius:0}}>
                              주요 지수:
                        </Grid>
                        {featureSelection2.map((value) => (
                          <>
                          {(similarSelectedFeature===value)?
                            <Grid item key={value} sm={2}><Button key={"button2"+{value}} onClick={(e) => featureClick2(e)} sx={{ border:0, width:'100%', height:'100%', bgcolor:'black', color:'white', borderColor:'black', borderRadius:0}}>
                              {value}
                            </Button></Grid>
                          :
                            <Grid item key={value} sm={2}><Button key={"button2"+{value}} onClick={(e) => featureClick2(e)} sx={{ border:0, width:'100%', height:'100%',  bgcolor:'white', color:'black', borderRadius:0}}>
                              {value}
                            </Button></Grid>
                          }
                          </>
                        ))}
                      </Grid>
                      
                      <Box >
                        {similarSelectedFeature==="KOSPI" && <ShortSingleLine title={"KOSPI"} data={similarDateData.kospi} />}
                        {similarSelectedFeature==="KOSDAQ" && <ShortSingleLine title={"KOSDAQ"} data={similarDateData.kosdaq} />}
                        {similarSelectedFeature==="BRENT" && <ShortSingleLine title={"BRENT"} data={similarDateData.brent} />}
                        {similarSelectedFeature==="USD/KRW" && <ShortSingleLine title={"USD/KRW"} data={similarDateData.usdkrw} />}
                        {similarSelectedFeature==="COPPER" && <ShortSingleLine title={"COPPER"} data={similarDateData.copper} />}
                      </Box>

                      <Box key={"6134444"}>
                        <Grid container key={"86565464"} align="center" justifyContent="center" alignItems="center" sx={{ maxWidth: 500, textAlign: 'center', mx:'auto'}}>
                          <Grid item key={"grid000"} sm={4} sx={{ px:1, pt:1 }}><NewsButton key={"6123424"} style={{backgroundColor:'black', color:'white'}}>
                            최근 주요 뉴스 키워드
                          </NewsButton></Grid>
                          {similarDateData.newsKeywords.map((value) => (
                            <>
                              <Grid item key={value[0]} sx={{ px:1, pt:1 }}><Tooltip key={"1010250"+value[0]} title={value[1]} arrow ><NewsButton>
                                {value[0]}
                              </NewsButton></Tooltip></Grid>
                            </>
                          ))}
                        </Grid>
                      </Box>
                      </>
                    )}
                    </Grid>
                  </Grid>
                </Box>

                </>
                :
                null}
            </div>
        </div>
    )
}

export default EdaInfo;
