import React, {useState, useEffect} from "react";
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import Tooltip from '@mui/material/Tooltip';
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

    const [similarPointButton, setSimilarPointButton] = useState("button1"); // "button1", "button2" 유사시점에서 KOSPI/섹터 그래프를 보여줄지, 주요지수 그래프를 보여줄지 고르는 버튼
    const [similarityDistance, setSimilarityDistance] = useState("loading..."); // distance 값

    const [currentSimilarDateEnd, setCurrentSimilarDateEnd] = useState("none");
    const [currentSimilarDateStart, setCurrentSimlilarDateStart] = useState("none");
    const [currentSelectedFeature, setCurrentSelectedFeature] = useState("KOSDAQ");
    const [similarSelectedFeature, setSimilarSelectedFeature] = useState("none");
    const [newsData, setNewsData] = useState();
    const [getDistance, setGetDistance] = useState(0);
    // const [similarDateEDAReady, setSimilarDateEDAReady] = useState(false);

    const [marketData, setMarketData] = useState({
      currentDate: '2022-10-24~2022-11-25',
      // similarDates: ['2021-05-21~2021-06-19','2021-05-28~2021-06-26','2020-10-08~2020-11-06','2019-03-02~2019-03-31','2019-01-21~2019-02-19','2019-01-13~2019-02-11','2017-06-08~2017-07-07'],
      similarDates: ['2021-06-19','2021-06-26','2020-11-06','2019-03-31','2019-02-19','2019-02-11','2017-07-07'],
      newsKeywords: [
        ["아베 피습", "2022-07-08", "아베 연설 중 정체불명의 괴한에게 피습 돼..."], 
        ["코스피 상승", "2022-07-07", "코스피 이틀 간 끝없이 상승해 불안"], 
        ["바이던 음주", "2022-07-06", "바이던 내한 중 막걸리와 사랑에 빠져.. 음주 후 귀국"], 
        ["옥수수 수염차", "2022-07-05"], "옥수수로 만든 수염차가 인기", 
        ["일석 이조", "2022-07-04", "일석은 이조다... 박지윤의 명언 되찾아..."]],
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
      interactivemedia: [],
      game: [],
      itservice: [],
      displaypanel: [],
      airplane: [],
      electricdevice: [],
      energydevice: [],
      shipbuilding: [],
      healthcare: [],
      publish: [],
      semiconductor: [],
      entertainment: [],
      electricutility: [],
      pencil: [],
      communication: [],
      road: [],
      biology: [],
      shipping: [],
      software: [],
      construction: [],
      complexutility: [],
      displaydevice: [],
      electronics: [],
      retail: [],
      chemistry: [],
      vc: [],
      furniture: [],
      homeutility: [],
      stock: [],
      transportation: [],
      healthtechnology: [],
      hotel: [],
      consumerservice: [],
      fiber: [],
      elctricproduct: [],
      internetretail: [],
      handset: [],
      packing: [],
      healthcaredevice: [],
      machine: [],
      paper: [],
      car: [],
      advertisement: [],
      biologytool: [],
      pharmacy: [],
      mixed: [],
      drink: [],
      card: [],
      buildingmaterial: [],
      computer: [],
      leisure: [],
      carpart: [],
      electricequipment: [],
      steel: [],
      sales: [],
      buildingproduct: [],
      office: [],
      departmentstore: [],
      homethings: [],
      commercialservice: [],
      educationservice: [],
      aircargo: [],
      radiocommunication: [],
      damageinsurance: [],
      grooceries: [],
      gasutility: [],
      biologyinsurance: [],
      mixedcommunication: [],
      finance: [],
      food: [],
      trade: [],
      tobacco: [],
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
      interactivemedia: [],
      game: [],
      itservice: [],
      displaypanel: [],
      airplane: [],
      electricdevice: [],
      energydevice: [],
      shipbuilding: [],
      healthcare: [],
      publish: [],
      semiconductor: [],
      entertainment: [],
      electricutility: [],
      pencil: [],
      communication: [],
      road: [],
      biology: [],
      shipping: [],
      software: [],
      construction: [],
      complexutility: [],
      displaydevice: [],
      electronics: [],
      retail: [],
      chemistry: [],
      vc: [],
      furniture: [],
      homeutility: [],
      stock: [],
      transportation: [],
      healthtechnology: [],
      hotel: [],
      consumerservice: [],
      fiber: [],
      elctricproduct: [],
      internetretail: [],
      handset: [],
      packing: [],
      healthcaredevice: [],
      machine: [],
      paper: [],
      car: [],
      advertisement: [],
      biologytool: [],
      pharmacy: [],
      mixed: [],
      drink: [],
      card: [],
      buildingmaterial: [],
      computer: [],
      leisure: [],
      carpart: [],
      electricequipment: [],
      steel: [],
      sales: [],
      buildingproduct: [],
      office: [],
      departmentstore: [],
      homethings: [],
      commercialservice: [],
      educationservice: [],
      aircargo: [],
      radiocommunication: [],
      damageinsurance: [],
      grooceries: [],
      gasutility: [],
      biologyinsurance: [],
      mixedcommunication: [],
      finance: [],
      food: [],
      trade: [],
      tobacco: [],
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
          // else if(tempcode==="HG")
          //   temp_marketData.copper = res.data.data; 
          setMarketData(temp_marketData);
        } else {
          let temp_similarData = similarDateData;
          if(tempcode==="CL")
            temp_similarData.brent = res.data.data;
          // else if(tempcode==="HG")
          //   temp_similarData.copper = res.data.data; 
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
        console.log(res.data);
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
          } else if (sectorName === "창업투자") {
            temp_marketData.vc = res.data;
          } else if (sectorName === "가구") {
            temp_marketData.furniture = res.data;
          } else if (sectorName === "가정용기기와용품") {
            temp_marketData.homeutility = res.data;
          } else if (sectorName === "증권") {
            temp_marketData.stock = res.data;
          } else if (sectorName === "운송인프라") {
            temp_marketData.transportation = res.data;
          } else if (sectorName === "건강관리기술") {
            temp_marketData.healthtechnology = res.data;
          } else if (sectorName === "호텔,레스토랑,레저") {
            temp_marketData.hotel = res.data;
          } else if (sectorName === "다각화된소비자서비스") {
            temp_marketData.consumerservice = res.data;
          } else if (sectorName === "섬유,의류,신발,호화품") {
            temp_marketData.fiber = res.data;
          } else if (sectorName === "전기제품") {
            temp_marketData.elctricproduct = res.data;
          } else if (sectorName === "인터넷과카탈로그소매") {
            temp_marketData.internetretail = res.data;
          } else if (sectorName === "핸드셋") {
            temp_marketData.handset = res.data;
          } else if (sectorName === "포장재") {
            temp_marketData.packing = res.data;
          } else if (sectorName === "건강관리장비와용품") {
            temp_marketData.healthcaredevice = res.data;
          } else if (sectorName === "기계") {
            temp_marketData.machine = res.data;
          } else if (sectorName === "종이와목재") {
            temp_marketData.paper = res.data;
          } else if (sectorName === "자동차") {
            temp_marketData.car = res.data;
          } else if (sectorName === "광고") {
            temp_marketData.advertisement = res.data;
          } else if (sectorName === "생명과학도구및서비스") {
            temp_marketData.biologytool = res.data;
          } else if (sectorName === "제약") {
            temp_marketData.pharmacy = res.data;
          } else if (sectorName === "복합기업") {
            temp_marketData.mixed = res.data;
          } else if (sectorName === "음료") {
            temp_marketData.drink = res.data;
          } else if (sectorName === "카드") {
            temp_marketData.card = res.data;
          } else if (sectorName === "건축자재") {
            temp_marketData.buildingmaterial = res.data;
          } else if (sectorName === "컴퓨터와주변기기") {
            temp_marketData.computer = res.data;
          } else if (sectorName === "레저용장비와제품") {
            temp_marketData.leisure = res.data;
          } else if (sectorName === "자동차부품") {
            temp_marketData.carpart = res.data;
          } else if (sectorName === "전기장비") {
            temp_marketData.electricequipment = res.data;
          } else if (sectorName === "철강") {
            temp_marketData.steel = res.data;
          } else if (sectorName === "판매업체") {
            temp_marketData.sales = res.data;
          } else if (sectorName === "건축제품") {
            temp_marketData.buildingproduct = res.data;
          } else if (sectorName === "사무용전자제품") {
            temp_marketData.office = res.data;
          } else if (sectorName === "백화점과일반상점") {
            temp_marketData.departmentstore = res.data;
          } else if (sectorName === "가정용품") {
            temp_marketData.homethings = res.data;
          } else if (sectorName === "상업서비스와공급품") {
            temp_marketData.commercialservice = res.data;
          } else if (sectorName === "교육서비스") {
            temp_marketData.educationservice = res.data;
          } else if (sectorName === "항공화물운송과물류") {
            temp_marketData.aircargo = res.data;
          } else if (sectorName === "무선통신서비스") {
            temp_marketData.radiocommunication = res.data;
          } else if (sectorName === "손해보험") {
            temp_marketData.damageinsurance = res.data;
          } else if (sectorName === "식품과기본식료품소매") {
            temp_marketData.grooceries = res.data;
          } else if (sectorName === "가스유틸리티") {
            temp_marketData.gasutility = res.data;
          } else if (sectorName === "생명보험") {
            temp_marketData.biologyinsurance = res.data;
          } else if (sectorName === "다각화된통신서비스") {
            temp_marketData.mixedcommunication = res.data;
          } else if (sectorName === "기타금융") {
            temp_marketData.finance = res.data;
          } else if (sectorName === "식품") {
            temp_marketData.food = res.data;
          } else if (sectorName === "무역회사와판매업체") {
            temp_marketData.trade = res.data;
          } else if (sectorName === "담배") {
            temp_marketData.tobacco = res.data;
          }
          setMarketData(temp_marketData);
        } else {
          let temp_similarData = similarDateData;
          if(sectorName === "비철금속") {
            temp_similarData.bicheol = res.data;
            getSimilarityDistance(temp_similarData.bicheol, marketData.bicheol);
          } else if(sectorName === "은행") {
            temp_similarData.bank = res.data;
            getSimilarityDistance(temp_similarData.bank, marketData.bank);
          } else if(sectorName === "석유와가스") {
            temp_similarData.oil = res.data;
            getSimilarityDistance(temp_similarData.oil, marketData.oil);
          } else if(sectorName === "화장품") {
            temp_similarData.cosmetics = res.data;
            getSimilarityDistance(temp_similarData.cosmetics, marketData.cosmetics);
          } else if(sectorName === "부동산") {
            temp_similarData.realestate = res.data;
            getSimilarityDistance(temp_similarData.realestate, marketData.realestate);
          } else if(sectorName === "우주항공과국방") {
            temp_similarData.space = res.data;
            getSimilarityDistance(temp_similarData.space, marketData.space);
          } else if(sectorName === "양방향미디어와서비스") {
            temp_similarData.interactivemedia = res.data;
            getSimilarityDistance(temp_similarData.interactivemedia, marketData.interactivemedia);
          } else if(sectorName === "게임엔터테인먼트") {
            temp_similarData.game = res.data;
            getSimilarityDistance(temp_similarData.game, marketData.game);
          } else if(sectorName === "IT서비스") {
            temp_similarData.itservice = res.data;
            getSimilarityDistance(temp_similarData.itservice, marketData.itservice);
          } else if(sectorName === "디스플레이패널") {
            temp_similarData.displaypanel = res.data;
            getSimilarityDistance(temp_similarData.displaypanel, marketData.displaypanel);
          } else if(sectorName === "항공사") {
            temp_similarData.airplane = res.data;
            getSimilarityDistance(temp_similarData.airplane, marketData.airplane);
          } else if(sectorName === "전자장비와기기") {
            temp_similarData.electricdevice = res.data;
            getSimilarityDistance(temp_similarData.electricdevice, marketData.electricdevice);
          } else if(sectorName === "에너지장비및서비스") {
            temp_similarData.energydevice = res.data;
            getSimilarityDistance(temp_similarData.energydevice, marketData.energydevice);
          } else if(sectorName === "조선") {
            temp_similarData.shipbuilding = res.data;
            getSimilarityDistance(temp_similarData.shipbuilding, marketData.shipbuilding);
          } else if(sectorName === "건강관리업체및서비스") {
            temp_similarData.healthcare = res.data;
            getSimilarityDistance(temp_similarData.healthcare, marketData.healthcare);
          } else if(sectorName === "출판") {
            temp_similarData.publish = res.data;
            getSimilarityDistance(temp_similarData.publish, marketData.publish);
          } else if(sectorName === "반도체와반도체장비") {
            temp_similarData.semiconductor = res.data;
            getSimilarityDistance(temp_similarData.semiconductor, marketData.semiconductor);
          } else if(sectorName === "방송과엔터테인먼트") {
            temp_similarData.entertainment = res.data;
            getSimilarityDistance(temp_similarData.entertainment, marketData.entertainment);
          } else if(sectorName === "전기유틸리티") {
            temp_similarData.electricutility = res.data;
            getSimilarityDistance(temp_similarData.electricutility, marketData.electricutility);
          } else if(sectorName === "문구류") {
            temp_similarData.pencil = res.data;
            getSimilarityDistance(temp_similarData.pencil, marketData.pencil);
          } else if(sectorName === "통신장비") {
            temp_similarData.communication = res.data;
            getSimilarityDistance(temp_similarData.communication, marketData.communication);
          } else if(sectorName === "도로와철도운송") {
            temp_similarData.road = res.data;
            getSimilarityDistance(temp_similarData.road, marketData.road);
          } else if(sectorName === "생물공학") {
            temp_similarData.biology = res.data;
            getSimilarityDistance(temp_similarData.biology, marketData.biology);
          } else if(sectorName === "해운사") {
            temp_similarData.shipping = res.data;
            getSimilarityDistance(temp_similarData.shipping, marketData.shipping);
          } else if(sectorName === "소프트웨어") {
            temp_similarData.software = res.data;
            getSimilarityDistance(temp_similarData.software, marketData.software);
          } else if(sectorName === "건설") {
            temp_similarData.construction = res.data;
            getSimilarityDistance(temp_similarData.construction, marketData.construction);
          } else if(sectorName === "복합유틸리티") {
            temp_similarData.complexutility = res.data;
            getSimilarityDistance(temp_similarData.complexutility, marketData.complexutility);
          } else if(sectorName === "디스플레이장비및부품") {
            temp_similarData.displaydevice = res.data;
            getSimilarityDistance(temp_similarData.displaydevice, marketData.displaydevice);
          } else if(sectorName === "전자제품") {
            temp_similarData.electronics = res.data;
            getSimilarityDistance(temp_similarData.electronics, marketData.electronics);
          } else if(sectorName === "전문소매") {
            temp_similarData.retail = res.data;
            getSimilarityDistance(temp_similarData.retail, marketData.retail);
          } else if(sectorName === "화학") {
            temp_similarData.chemistry = res.data;
            getSimilarityDistance(temp_similarData.chemistry, marketData.chemistry);
          } else if (sectorName === "창업투자") {
            temp_similarData.vc = res.data;
            getSimilarityDistance(temp_similarData.vc, marketData.vc);
          } else if (sectorName === "가구") {
            temp_similarData.furniture = res.data;
            getSimilarityDistance(temp_similarData.furniture, marketData.furniture);
          } else if (sectorName === "가정용기기와용품") {
            temp_similarData.homeutility = res.data;
            getSimilarityDistance(temp_similarData.homeutility, marketData.homeutility);
          } else if (sectorName === "증권") {
            temp_similarData.stock = res.data;
            getSimilarityDistance(temp_similarData.stock, marketData.stock);
          } else if (sectorName === "운송인프라") {
            temp_similarData.transportation = res.data;
            getSimilarityDistance(temp_similarData.transportation, marketData.transportation);
          } else if (sectorName === "건강관리기술") {
            temp_similarData.healthtechnology = res.data;
            getSimilarityDistance(temp_similarData.healthtechnology, marketData.healthtechnology);
          } else if (sectorName === "호텔,레스토랑,레저") {
            temp_similarData.hotel = res.data;
            getSimilarityDistance(temp_similarData.hotel, marketData.hotel);
          } else if (sectorName === "다각화된소비자서비스") {
            temp_similarData.consumerservice = res.data;
            getSimilarityDistance(temp_similarData.consumerservice, marketData.consumerservice);
          } else if (sectorName === "섬유,의류,신발,호화품") {
            temp_similarData.fiber = res.data;
            getSimilarityDistance(temp_similarData.fiber, marketData.fiber);
          } else if (sectorName === "전기제품") {
            temp_similarData.elctricproduct = res.data;
            getSimilarityDistance(temp_similarData.elctricproduct, marketData.elctricproduct);
          } else if (sectorName === "인터넷과카탈로그소매") {
            temp_similarData.internetretail = res.data;
            getSimilarityDistance(temp_similarData.internetretail, marketData.internetretail);
          } else if (sectorName === "핸드셋") {
            temp_similarData.handset = res.data;
            getSimilarityDistance(temp_similarData.handset, marketData.handset);
          } else if (sectorName === "포장재") {
            temp_similarData.packing = res.data;
            getSimilarityDistance(temp_similarData.packing, marketData.packing);
          } else if (sectorName === "건강관리장비와용품") {
            temp_similarData.healthcaredevice = res.data;
            getSimilarityDistance(temp_similarData.healthcaredevice, marketData.healthcaredevice);
          } else if (sectorName === "기계") {
            temp_similarData.machine = res.data;
            getSimilarityDistance(temp_similarData.machine, marketData.machine);
          } else if (sectorName === "종이와목재") {
            temp_similarData.paper = res.data;
            getSimilarityDistance(temp_similarData.paper, marketData.paper);
          } else if (sectorName === "자동차") {
            temp_similarData.car = res.data;
            getSimilarityDistance(temp_similarData.bicheol, marketData.bicheol);
          } else if (sectorName === "광고") {
            temp_similarData.advertisement = res.data;
            getSimilarityDistance(temp_similarData.bicheol, marketData.bicheol);
          } else if (sectorName === "생명과학도구및서비스") {
            temp_similarData.biologytool = res.data;
            getSimilarityDistance(temp_similarData.bicheol, marketData.bicheol);
          } else if (sectorName === "제약") {
            temp_similarData.pharmacy = res.data;
            getSimilarityDistance(temp_similarData.bicheol, marketData.bicheol);
          } else if (sectorName === "복합기업") {
            temp_similarData.mixed = res.data;
            getSimilarityDistance(temp_similarData.bicheol, marketData.bicheol);
          } else if (sectorName === "음료") {
            temp_similarData.drink = res.data;
            getSimilarityDistance(temp_similarData.bicheol, marketData.bicheol);
          } else if (sectorName === "카드") {
            temp_similarData.card = res.data;
            getSimilarityDistance(temp_similarData.bicheol, marketData.bicheol);
          } else if (sectorName === "건축자재") {
            temp_similarData.buildingmaterial = res.data;
            getSimilarityDistance(temp_similarData.bicheol, marketData.bicheol);
          } else if (sectorName === "컴퓨터와주변기기") {
            temp_similarData.computer = res.data;
            getSimilarityDistance(temp_similarData.bicheol, marketData.bicheol);
          } else if (sectorName === "레저용장비와제품") {
            temp_similarData.leisure = res.data;
            getSimilarityDistance(temp_similarData.bicheol, marketData.bicheol);
          } else if (sectorName === "자동차부품") {
            temp_similarData.carpart = res.data;
            getSimilarityDistance(temp_similarData.bicheol, marketData.bicheol);
          } else if (sectorName === "전기장비") {
            temp_similarData.electricequipment = res.data;
            getSimilarityDistance(temp_similarData.bicheol, marketData.bicheol);
          } else if (sectorName === "철강") {
            temp_similarData.steel = res.data;
            getSimilarityDistance(temp_similarData.bicheol, marketData.bicheol);
          } else if (sectorName === "판매업체") {
            temp_similarData.sales = res.data;
            getSimilarityDistance(temp_similarData.bicheol, marketData.bicheol);
          } else if (sectorName === "건축제품") {
            temp_similarData.buildingproduct = res.data;
            getSimilarityDistance(temp_similarData.bicheol, marketData.bicheol);
          } else if (sectorName === "사무용전자제품") {
            temp_similarData.office = res.data;
            getSimilarityDistance(temp_similarData.bicheol, marketData.bicheol);
          } else if (sectorName === "백화점과일반상점") {
            temp_similarData.departmentstore = res.data;
            getSimilarityDistance(temp_similarData.bicheol, marketData.bicheol);
          } else if (sectorName === "가정용품") {
            temp_similarData.homethings = res.data;
            getSimilarityDistance(temp_similarData.bicheol, marketData.bicheol);
          } else if (sectorName === "상업서비스와공급품") {
            temp_similarData.commercialservice = res.data;
            getSimilarityDistance(temp_similarData.bicheol, marketData.bicheol);
          } else if (sectorName === "교육서비스") {
            temp_similarData.educationservice = res.data;
            getSimilarityDistance(temp_similarData.bicheol, marketData.bicheol);
          } else if (sectorName === "항공화물운송과물류") {
            temp_similarData.aircargo = res.data;
            getSimilarityDistance(temp_similarData.bicheol, marketData.bicheol);
          } else if (sectorName === "무선통신서비스") {
            temp_similarData.radiocommunication = res.data;
            getSimilarityDistance(temp_similarData.bicheol, marketData.bicheol);
          } else if (sectorName === "손해보험") {
            temp_similarData.damageinsurance = res.data;
            getSimilarityDistance(temp_similarData.bicheol, marketData.bicheol);
          } else if (sectorName === "식품과기본식료품소매") {
            temp_similarData.grooceries = res.data;
            getSimilarityDistance(temp_similarData.bicheol, marketData.bicheol);
          } else if (sectorName === "가스유틸리티") {
            temp_similarData.gasutility = res.data;
            getSimilarityDistance(temp_similarData.bicheol, marketData.bicheol);
          } else if (sectorName === "생명보험") {
            temp_similarData.biologyinsurance = res.data;
            getSimilarityDistance(temp_similarData.bicheol, marketData.bicheol);
          } else if (sectorName === "다각화된통신서비스") {
            temp_similarData.mixedcommunication = res.data;
            getSimilarityDistance(temp_similarData.bicheol, marketData.bicheol);
          } else if (sectorName === "기타금융") {
            temp_similarData.finance = res.data;
            getSimilarityDistance(temp_similarData.bicheol, marketData.bicheol);
          } else if (sectorName === "식품") {
            temp_similarData.food = res.data;
            getSimilarityDistance(temp_similarData.bicheol, marketData.bicheol);
          } else if (sectorName === "무역회사와판매업체") {
            temp_similarData.trade = res.data;
            getSimilarityDistance(temp_similarData.bicheol, marketData.bicheol);
          } else if (sectorName === "담배") {
            temp_similarData.tobacco = res.data;
            getSimilarityDistance(temp_similarData.bicheol, marketData.bicheol);
          }
          setSimilarDateData(temp_similarData);
        }
        
      });
    }

    const getSimilarityDistance = async(period1, period2) => {
      await axios.post('/api/data-management/model/distance', 
      {
        period1: period1,
        period2: period2,
      }
      ).then(res => {
        console.log("distance result is ", res);
        setSimilarityDistance(res);
      });
    }

    const getSimilarDates = async() => {
      console.log("new similar dates for ", props.edaName);
      // 현재 시점으로 가정하고 유사 시점 가져옴
      let modeltype = (props.edaType==="sector"?"sector/"+props.edaCode:"market")

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
        
        while (newsLen<15){
          if(!res.data[tempday]){
            console.error("news date error", tempday, res.data[tempday]);
            break;
          }
          for(let i = 0; i<res.data[tempday].length; i++){
            let tempnews = res.data[tempday][i];
            if(tempnews[0]!=="" && tempnews[1]!==""){
            todaynews.push([(tempnews[0]+" "+tempnews[1]), tempday, tempnews[2]]);
              newsLen += 1;
            }
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
      getSimilarDates();
      if(props.edaType === "sector"){
        let startDate = marketData.currentDate.split("~")[0];
        let endDate = marketData.currentDate.split("~")[1];
        getSector(props.edaName, startDate, endDate, true);
      }
    }, [props.edaName])

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

      // getSector("비철금속", startDate, endDate, true);
      // getSector("은행", startDate, endDate, true);
      // getSector("석유와가스", startDate, endDate, true);
      // getSector("화장품", startDate, endDate, true);
      // getSector("부동산", startDate, endDate, true);
      // getSector("우주항공과국방", startDate, endDate, true);
      // getSector("양방향미디어와서비스", startDate, endDate, true);
      // getSector("게임엔터테인먼트", startDate, endDate, true);
      // getSector("IT서비스", startDate, endDate, true);
      // getSector("디스플레이패널", startDate, endDate, true);
      // getSector("항공사", startDate, endDate, true);
      // getSector("전자장비와기기", startDate, endDate, true);
      // getSector("에너지장비및서비스", startDate, endDate, true);
      // getSector("조선", startDate, endDate, true);
      // getSector("건강관리업체및서비스", startDate, endDate, true);
      // getSector("출판", startDate, endDate, true);
      // getSector("반도체와반도체장비", startDate, endDate, true);
      // getSector("방송과엔터테인먼트", startDate, endDate, true);
      // getSector("전기유틸리티", startDate, endDate, true);
      // getSector("문구류", startDate, endDate, true);
      // getSector("통신장비", startDate, endDate, true);
      // getSector("도로와철도운송", startDate, endDate, true);
      // getSector("생물공학", startDate, endDate, true);
      // getSector("해운사", startDate, endDate, true);
      // getSector("소프트웨어", startDate, endDate, true);
      // getSector("건설", startDate, endDate, true);
      // getSector("복합유틸리티", startDate, endDate, true);
      // getSector("디스플레이장비및부품", startDate, endDate, true);
      // getSector("전자제품", startDate, endDate, true);
      // getSector("전문소매", startDate, endDate, true);
      // getSector("화학", startDate, endDate, true);
      // getSector("창업투자", startDate, endDate, true);
      // getSector("가구", startDate, endDate, true);
      // getSector("가정용기기와용품", startDate, endDate, true);
      // getSector("증권", startDate, endDate, true);
      // getSector("운송인프라", startDate, endDate, true);
      // getSector("건강관리기술", startDate, endDate, true);
      // getSector("호텔,레스토랑,레저", startDate, endDate, true);
      // getSector("다각화된소비자서비스", startDate, endDate, true);
      // getSector("섬유,의류,신발,호화품", startDate, endDate, true);
      // getSector("전기제품", startDate, endDate, true);
      // getSector("인터넷과카탈로그소매", startDate, endDate, true);
      // getSector("핸드셋", startDate, endDate, true);
      // getSector("포장재", startDate, endDate, true);
      // getSector("건강관리장비와용품", startDate, endDate, true);
      // getSector("기계", startDate, endDate, true);
      // getSector("종이와목재", startDate, endDate, true);
      // getSector("자동차", startDate, endDate, true);
      // getSector("광고", startDate, endDate, true);
      // getSector("생명과학도구및서비스", startDate, endDate, true);
      // getSector("제약", startDate, endDate, true);
      // getSector("복합기업", startDate, endDate, true);
      // getSector("음료", startDate, endDate, true);
      // getSector("카드", startDate, endDate, true);
      // getSector("건축자재", startDate, endDate, true);
      // getSector("컴퓨터와주변기기", startDate, endDate, true);
      // getSector("레저용장비와제품", startDate, endDate, true);
      // getSector("자동차부품", startDate, endDate, true);
      // getSector("전기장비", startDate, endDate, true);
      // getSector("철강", startDate, endDate, true);
      // getSector("판매업체", startDate, endDate, true);
      // getSector("건축제품", startDate, endDate, true);
      // getSector("사무용전자제품", startDate, endDate, true);
      // getSector("백화점과일반상점", startDate, endDate, true);
      // getSector("가정용품", startDate, endDate, true);
      // getSector("상업서비스와공급품", startDate, endDate, true);
      // getSector("교육서비스", startDate, endDate, true);
      // getSector("항공화물운송과물류", startDate, endDate, true);
      // getSector("무선통신서비스", startDate, endDate, true);
      // getSector("손해보험", startDate, endDate, true);
      // getSector("식품과기본식료품소매", startDate, endDate, true);
      // getSector("가스유틸리티", startDate, endDate, true);
      // getSector("생명보험", startDate, endDate, true);
      // getSector("다각화된통신서비스", startDate, endDate, true);
      // getSector("기타금융", startDate, endDate, true);
      // getSector("식품", startDate, endDate, true);
      // getSector("무역회사와판매업체", startDate, endDate, true);
      // getSector("담배", startDate, endDate, true);

      // kospi 가져오기
      getIndex("KS11", startDate, endDate, true);
      // kosdaq 가져오기
      getIndex("KQ11", startDate, endDate, true);
      // USD/KRW 가져오기
      getIndex("USD/KRW", startDate, endDate, true);
      // 브랜트유 가져오기
      getCommodity("CL", startDate, endDate, true);
      // 구리 선물 가져오기
      // getCommodity("HG", startDate, endDate, true);
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

        // kospi 가져오기
        getIndex("KS11", currentSimilarDate_start, currentSimilarDate_end, false);
        // kosdaq 가져오기
        getIndex("KQ11", currentSimilarDate_start, currentSimilarDate_end, false);
        // USD/KRW 가져오기
        getIndex("USD/KRW", currentSimilarDate_start, currentSimilarDate_end, false);
        // 브랜트유 가져오기
        getCommodity("CL", currentSimilarDate_start, currentSimilarDate_end, false);
        // 구리 선물 가져오기
        // getCommodity("HG", currentSimilarDate_start, currentSimilarDate_end, false);

        getNews(currentSimilarDate_end, false);
        if(props.edaName==="전체 시장"){
          console.log("similar date clicked when market");
        }
        else{
          console.log("current props.edaName is ", props.edaName);
          setGetDistance("loading...");
          getSector(props.edaName, currentSimilarDate_start, currentSimilarDate_end, false);
          
          // getSector("비철금속", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("은행", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("석유와가스", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("화장품", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("부동산", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("우주항공과국방", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("양방향미디어와서비스", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("게임엔터테인먼트", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("IT서비스", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("디스플레이패널", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("항공사", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("전자장비와기기", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("에너지장비및서비스", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("조선", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("건강관리업체및서비스", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("출판", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("반도체와반도체장비", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("방송과엔터테인먼트", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("전기유틸리티", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("문구류", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("통신장비", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("도로와철도운송", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("생물공학", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("해운사", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("소프트웨어", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("건설", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("복합유틸리티", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("디스플레이장비및부품", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("전자제품", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("전문소매", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("화학", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("창업투자", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("가구", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("가정용기기와용품", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("증권", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("운송인프라", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("건강관리기술", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("호텔,레스토랑,레저", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("다각화된소비자서비스", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("섬유,의류,신발,호화품", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("전기제품", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("인터넷과카탈로그소매", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("핸드셋", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("포장재", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("건강관리장비와용품", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("기계", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("종이와목재", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("자동차", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("광고", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("생명과학도구및서비스", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("제약", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("복합기업", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("음료", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("카드", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("건축자재", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("컴퓨터와주변기기", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("레저용장비와제품", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("자동차부품", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("전기장비", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("철강", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("판매업체", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("건축제품", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("사무용전자제품", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("백화점과일반상점", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("가정용품", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("상업서비스와공급품", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("교육서비스", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("항공화물운송과물류", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("무선통신서비스", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("손해보험", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("식품과기본식료품소매", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("가스유틸리티", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("생명보험", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("다각화된통신서비스", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("기타금융", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("식품", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("무역회사와판매업체", currentSimilarDate_start, currentSimilarDate_end, false);
          // getSector("담배", currentSimilarDate_start, currentSimilarDate_end, false);
        }

        if(similarSelectedFeature === 'none')
          setSimilarSelectedFeature("KOSPI");
      }
    }, [currentSimilarDateEnd])

    
    // const featureSelection1 = ["KOSDAQ", "BRENT", "USD/KRW", "COPPER"];
    const featureSelection1 = ["KOSDAQ", "BRENT", "USD/KRW"];
    // const featureSelection2 = ["KOSPI", "KOSDAQ", "BRENT", "USD/KRW", "COPPER"];
    const featureSelection2 = ["KOSPI", "KOSDAQ", "BRENT", "USD/KRW"];

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
    const similarPointButtonClick = (e) => {
      setSimilarPointButton(e.target.id);
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
                      (props.edaName==="전문소매")?(marketData.retail):
                      (props.edaName==="화학")?(marketData.chemistry):
                      (props.edaName==="창업투자")?(marketData.vc):
                      (props.edaName==="가구")?(marketData.furniture):
                      (props.edaName==="가정용기기와용품")?(marketData.homeutility):
                      (props.edaName==="증권")?(marketData.stock):
                      (props.edaName==="운송인프라")?(marketData.transportation):
                      (props.edaName==="건강관리기술")?(marketData.healthtechnology):
                      (props.edaName==="호텔,레스토랑,레저")?(marketData.hotel):
                      (props.edaName==="다각화된소비자서비스")?(marketData.consumerservice):
                      (props.edaName==="섬유,의류,신발,호화품")?(marketData.fiber):
                      (props.edaName==="전기제품")?(marketData.elctricproduct):
                      (props.edaName==="인터넷과카탈로그소매")?(marketData.internetretail):
                      (props.edaName==="핸드셋")?(marketData.handset):
                      (props.edaName==="포장재")?(marketData.packing):
                      (props.edaName==="건강관리장비와용품")?(marketData.healthcaredevice):
                      (props.edaName==="기계")?(marketData.machine):
                      (props.edaName==="종이와목재")?(marketData.paper):
                      (props.edaName==="자동차")?(marketData.car):
                      (props.edaName==="광고")?(marketData.advertisement):
                      (props.edaName==="생명과학도구및서비스")?(marketData.biologytool):
                      (props.edaName==="제약")?(marketData.pharmacy):
                      (props.edaName==="복합기업")?(marketData.mixed):
                      (props.edaName==="음료")?(marketData.drink):
                      (props.edaName==="카드")?(marketData.card):
                      (props.edaName==="건축자재")?(marketData.buildingmaterial):
                      (props.edaName==="컴퓨터와주변기기")?(marketData.computer):
                      (props.edaName==="레저용장비와제품")?(marketData.leisure):
                      (props.edaName==="자동차부품")?(marketData.carpart):
                      (props.edaName==="전기장비")?(marketData.electricequipment):
                      (props.edaName==="철강")?(marketData.steel):
                      (props.edaName==="판매업체")?(marketData.sales):
                      (props.edaName==="건축제품")?(marketData.buildingproduct):
                      (props.edaName==="사무용전자제품")?(marketData.office):
                      (props.edaName==="백화점과일반상점")?(marketData.departmentstore):
                      (props.edaName==="가정용품")?(marketData.homethings):
                      (props.edaName==="상업서비스와공급품")?(marketData.commercialservice):
                      (props.edaName==="교육서비스")?(marketData.educationservice):
                      (props.edaName==="항공화물운송과물류")?(marketData.aircargo):
                      (props.edaName==="무선통신서비스")?(marketData.radiocommunication):
                      (props.edaName==="손해보험")?(marketData.damageinsurance):
                      (props.edaName==="식품과기본식료품소매")?(marketData.grooceries):
                      (props.edaName==="가스유틸리티")?(marketData.gasutility):
                      (props.edaName==="생명보험")?(marketData.biologyinsurance):
                      (props.edaName==="다각화된통신서비스")?(marketData.mixedcommunication):
                      (props.edaName==="기타금융")?(marketData.finance):
                      (props.edaName==="식품")?(marketData.food):
                      (props.edaName==="무역회사와판매업체")?(marketData.trade):(marketData.tobacco) //담배
                      ))} place={"left"}/>
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
                        {/* {currentSelectedFeature==="COPPER" && <ShortSingleLine title={"COPPER"} data={marketData.copper} />} */}
                      </Box>
                      
                      <Box key={"1239"}>
                        <Grid container key={"1240"} align="center" justifyContent="center" alignItems="center" sx={{ maxWidth: 500, textAlign: 'center', mx:'auto'}}>
                          <Grid item key={"1241"} sm={4} sx={{ px:1, pt:1 }}><NewsButton key={"1242"} style={{backgroundColor:'black', color:'white'}}>
                            최근 주요 뉴스 키워드
                          </NewsButton></Grid>
                          {marketData.newsKeywords.map((value) => (
                            <>
                              <Grid item key={value[0]} sx={{ px:1, pt:1 }}><Tooltip key={"1234123"+value[0]} title={value[1]+"\n"+value[2]} arrow><NewsButton key={"1234532"+value[0]}>
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
                <Divider key={"22225"} variant="middle" sx={{mt:"20px", mb:"10px", fontSize:"larger"}}> 유사 시점 </Divider>
                {/* 유사 시점 파트 */}
                <Box key={"002020"} sx={{ width: '100%', mb:'80px' }}>
                  <Grid container key={"1234754"} style={{textAlign: "center"}}>
                    <Grid item key={"341234"} xs={6}> {/* 왼쪽 파트 */}
                      <Chip key={"512342"} color="default" label={"유사 시점 탐색 결과"} sx={{ fontSize: 20, width: 500, mt: 5, bgcolor: mainColor, color:'white', borderRadius:1 }}/>
                      <Paper key={"612342"} style={{minHeight: 100, maxHeight: 350, maxWidth: 500, overflow: 'auto'}} sx={{ mx:'auto', mb: 2 }}>

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

                    </Grid>
                    <Grid item key={"6112344"} xs={6} sx={{textAlign: 'center', paddingTop:'5px'}}> {/* 오른쪽 파트 */}
                    {/* {similarDateEDAReady===false?( */}
                    <div style={{display:"flex", height:"20px", margin:"auto", marginTop:"-15px", marginBottom:"5px"}}>
                      <div style={{display:"flex", margin:"auto", fontWeight:"bolder"}}>
                        <Button id="button1" style={{backgroundColor:(similarPointButton==="button1"?"midnightblue":"white"), color:(similarPointButton==="button1"?"white":"black"), width:"160px"}} onClick={(e) => similarPointButtonClick(e)}>
                          {(props.edaName==="전체 시장"?("KOSPI"):(props.edaName))}
                        </Button>
                        <Button id="button2" style={{backgroundColor:(similarPointButton==="button2"?"midnightblue":"white"), color:(similarPointButton==="button2"?"white":"black"), width:"160px"}} onClick={(e) => similarPointButtonClick(e)}>
                          주요 지수
                        </Button>
                      </div>
                    </div>
                    {similarSelectedFeature==="none"?(
                      <>
                      <Typography gutterBottom key={"777777"} variant="h6" component="div" sx={{my:15}}>
                        유사시점을 선택해주세요
                      </Typography>
                      </>
                    ):(
                      <>
                      {similarPointButton==="button1"?
                      <>
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
                          (props.edaName==="전문소매")?(similarDateData.retail):
                          (props.edaName==="화학")?(similarDateData.chemistry):
                          (props.edaName==="창업투자")?(similarDateData.vc):
                          (props.edaName==="가구")?(similarDateData.furniture):
                          (props.edaName==="가정용기기와용품")?(similarDateData.homeutility):
                          (props.edaName==="증권")?(similarDateData.stock):
                          (props.edaName==="운송인프라")?(similarDateData.transportation):
                          (props.edaName==="건강관리기술")?(similarDateData.healthtechnology):
                          (props.edaName==="호텔,레스토랑,레저")?(similarDateData.hotel):
                          (props.edaName==="다각화된소비자서비스")?(similarDateData.consumerservice):
                          (props.edaName==="섬유,의류,신발,호화품")?(similarDateData.fiber):
                          (props.edaName==="전기제품")?(similarDateData.elctricproduct):
                          (props.edaName==="인터넷과카탈로그소매")?(similarDateData.internetretail):
                          (props.edaName==="핸드셋")?(similarDateData.handset):
                          (props.edaName==="포장재")?(similarDateData.packing):
                          (props.edaName==="건강관리장비와용품")?(similarDateData.healthcaredevice):
                          (props.edaName==="기계")?(similarDateData.machine):
                          (props.edaName==="종이와목재")?(similarDateData.paper):
                          (props.edaName==="자동차")?(similarDateData.car):
                          (props.edaName==="광고")?(similarDateData.advertisement):
                          (props.edaName==="생명과학도구및서비스")?(similarDateData.biologytool):
                          (props.edaName==="제약")?(similarDateData.pharmacy):
                          (props.edaName==="복합기업")?(similarDateData.mixed):
                          (props.edaName==="음료")?(similarDateData.drink):
                          (props.edaName==="카드")?(similarDateData.card):
                          (props.edaName==="건축자재")?(similarDateData.buildingmaterial):
                          (props.edaName==="컴퓨터와주변기기")?(similarDateData.computer):
                          (props.edaName==="레저용장비와제품")?(similarDateData.leisure):
                          (props.edaName==="자동차부품")?(similarDateData.carpart):
                          (props.edaName==="전기장비")?(similarDateData.electricequipment):
                          (props.edaName==="철강")?(similarDateData.steel):
                          (props.edaName==="판매업체")?(similarDateData.sales):
                          (props.edaName==="건축제품")?(similarDateData.buildingproduct):
                          (props.edaName==="사무용전자제품")?(similarDateData.office):
                          (props.edaName==="백화점과일반상점")?(similarDateData.departmentstore):
                          (props.edaName==="가정용품")?(similarDateData.homethings):
                          (props.edaName==="상업서비스와공급품")?(similarDateData.commercialservice):
                          (props.edaName==="교육서비스")?(similarDateData.educationservice):
                          (props.edaName==="항공화물운송과물류")?(similarDateData.aircargo):
                          (props.edaName==="무선통신서비스")?(similarDateData.radiocommunication):
                          (props.edaName==="손해보험")?(similarDateData.damageinsurance):
                          (props.edaName==="식품과기본식료품소매")?(similarDateData.grooceries):
                          (props.edaName==="가스유틸리티")?(similarDateData.gasutility):
                          (props.edaName==="생명보험")?(similarDateData.biologyinsurance):
                          (props.edaName==="다각화된통신서비스")?(similarDateData.mixedcommunication):
                          (props.edaName==="기타금융")?(similarDateData.finance):
                          (props.edaName==="식품")?(similarDateData.food):
                          (props.edaName==="무역회사와판매업체")?(similarDateData.trade):(similarDateData.tobacco) //담배
                          ))} 
                          place={"left"}
                          getDistance={getDistance}
                          setGetDistance={setGetDistance}
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
                            (props.edaName==="전문소매")?(marketData.retail):
                            (props.edaName==="화학")?(marketData.chemistry):
                            (props.edaName==="창업투자")?(marketData.vc):
                            (props.edaName==="가구")?(marketData.furniture):
                            (props.edaName==="가정용기기와용품")?(marketData.homeutility):
                            (props.edaName==="증권")?(marketData.stock):
                            (props.edaName==="운송인프라")?(marketData.transportation):
                            (props.edaName==="건강관리기술")?(marketData.healthtechnology):
                            (props.edaName==="호텔,레스토랑,레저")?(marketData.hotel):
                            (props.edaName==="다각화된소비자서비스")?(marketData.consumerservice):
                            (props.edaName==="섬유,의류,신발,호화품")?(marketData.fiber):
                            (props.edaName==="전기제품")?(marketData.elctricproduct):
                            (props.edaName==="인터넷과카탈로그소매")?(marketData.internetretail):
                            (props.edaName==="핸드셋")?(marketData.handset):
                            (props.edaName==="포장재")?(marketData.packing):
                            (props.edaName==="건강관리장비와용품")?(marketData.healthcaredevice):
                            (props.edaName==="기계")?(marketData.machine):
                            (props.edaName==="종이와목재")?(marketData.paper):
                            (props.edaName==="자동차")?(marketData.car):
                            (props.edaName==="광고")?(marketData.advertisement):
                            (props.edaName==="생명과학도구및서비스")?(marketData.biologytool):
                            (props.edaName==="제약")?(marketData.pharmacy):
                            (props.edaName==="복합기업")?(marketData.mixed):
                            (props.edaName==="음료")?(marketData.drink):
                            (props.edaName==="카드")?(marketData.card):
                            (props.edaName==="건축자재")?(marketData.buildingmaterial):
                            (props.edaName==="컴퓨터와주변기기")?(marketData.computer):
                            (props.edaName==="레저용장비와제품")?(marketData.leisure):
                            (props.edaName==="자동차부품")?(marketData.carpart):
                            (props.edaName==="전기장비")?(marketData.electricequipment):
                            (props.edaName==="철강")?(marketData.steel):
                            (props.edaName==="판매업체")?(marketData.sales):
                            (props.edaName==="건축제품")?(marketData.buildingproduct):
                            (props.edaName==="사무용전자제품")?(marketData.office):
                            (props.edaName==="백화점과일반상점")?(marketData.departmentstore):
                            (props.edaName==="가정용품")?(marketData.homethings):
                            (props.edaName==="상업서비스와공급품")?(marketData.commercialservice):
                            (props.edaName==="교육서비스")?(marketData.educationservice):
                            (props.edaName==="항공화물운송과물류")?(marketData.aircargo):
                            (props.edaName==="무선통신서비스")?(marketData.radiocommunication):
                            (props.edaName==="손해보험")?(marketData.damageinsurance):
                            (props.edaName==="식품과기본식료품소매")?(marketData.grooceries):
                            (props.edaName==="가스유틸리티")?(marketData.gasutility):
                            (props.edaName==="생명보험")?(marketData.biologyinsurance):
                            (props.edaName==="다각화된통신서비스")?(marketData.mixedcommunication):
                            (props.edaName==="기타금융")?(marketData.finance):
                            (props.edaName==="식품")?(marketData.food):
                            (props.edaName==="무역회사와판매업체")?(marketData.trade):(marketData.tobacco) //담배
                          ))}/>
                      </>
                      :
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
                          {/* {similarSelectedFeature==="COPPER" && <ShortSingleLine title={"COPPER"} data={similarDateData.copper} />} */}
                        </Box>
                      </>
                      }
                      <Box key={"6134444"}>
                        <Grid container key={"86565464"} align="center" justifyContent="center" alignItems="center" sx={{ maxWidth: 500, textAlign: 'center', mx:'auto'}}>
                          <Grid item key={"grid000"} sm={4} sx={{ px:1, pt:1 }}><NewsButton key={"6123424"} style={{backgroundColor:'black', color:'white'}}>
                            시점 주요 뉴스 키워드
                          </NewsButton></Grid>
                          {similarDateData.newsKeywords.map((value) => (
                            <>
                              <Grid item key={value[0]} sx={{ px:1, pt:1 }}><Tooltip key={"1010250"+value[0]} title={value[1]+"\n"+value[2]} arrow ><NewsButton>
                                {value[0]}
                              </NewsButton></Tooltip></Grid>
                            </>
                          ))}
                        </Grid>
                      </Box>
                      <div>Distance score is {similarityDistance}</div>
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
