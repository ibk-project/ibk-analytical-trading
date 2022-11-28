import { useState, useEffect, useRef } from 'react';
import './css/Portfolio.css';
import Pie from './chart/Pie';
import MultiLine from './chart/multiLine';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { Box } from '@mui/system';
import Checkbox from '@mui/material/Checkbox';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import Tabs from '@mui/material/Tabs';
import TabPanel from '@mui/lab/TabPanel';
import Popover from '@mui/material/Popover';
import { map } from 'highcharts';

function Portfolio() {
  let initUserOption = {
	  option1: '',
    option2: '',
    option3: ''
  }
  const [userOption, setUserOption] = useState(initUserOption)
  // API 부르기
  const [pick, setPick] = useState(['삼성전자', '유한양행', '금호석유', 'Naver', '기아', '효성', 'BNK금융지주', '한온시스템', 'SK이노베이션'])
  const recommend = async () => {
    await axios.get('/api/portfolio/top_pick').then(res => {setPick(res.data.result.top); console.log(res.data.result.top)});
  }
  const getSortedSector = async () => {
    await axios.get('/api/portfolio/top_pick').then(res => {
      const data = res.data.result
      setSector({
        recent: {'KOSPI 100': data.recent[0], 'KOSPI 200': data.recent[1], 'KOSDAQ': data.recent[2]}, 
        up: {'KOSPI 100': data.up[0], 'KOSPI 200': data.up[1], 'KOSDAQ': data.up[2]}, 
        down: {'KOSPI 100': data.down[0], 'KOSPI 200': data.down[1], 'KOSDAQ': data.down[2]}, 
        category: {'KOSPI 100': data.category[0], 'KOSPI 200': data.category[1], 'KOSDAQ': data.category[2]}
      })
    });
  }
  const temp = ["비철금속"
  ,"은행"
  ,"석유와가스"
  ,"화장품"
  ,"부동산"
  ,"우주항공과국방"
  ,"양방향미디어와서비스"
  ,"게임엔터테인먼트"
  ,"IT서비스"
  ,"디스플레이패널"
  ,"항공사"
  ,"전자장비와기기"
  ,"에너지장비및서비스"
  ,"조선"
  ,"건강관리업체및서비스"]
  const [showChart, setShowChart] = useState(false)
  const [portfolio, setPort] = useState({
    stocks: ['솔루스첨단소재', '아모그린텍', '트루윈'],
    similarDate: ['2019-11-07','2019-11-07','2019-11-07'],
    weight: []
  })
  const [stockBond, setStockBond] = useState(60)
  const [totalPeriod, setPeriod] = useState(60)
  const [isLoading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false);
  const [selectedSector, setSector] = useState({
    recent: {'KOSPI 100': [...temp], 'KOSPI 200': [...temp], 'KOSDAQ': [...temp]}, 
    up: {'KOSPI 100': [...temp], 'KOSPI 200': [...temp], 'KOSDAQ': [...temp]}, 
    down: {'KOSPI 100': [...temp], 'KOSPI 200': [...temp], 'KOSDAQ': [...temp]}, 
    category: {'KOSPI 100': [...temp], 'KOSPI 200': [...temp], 'KOSDAQ': [...temp]}
  })
  const [currentMarket, setMarket] = useState('KOSPI 200')
  const [tabValue, setTab] = useState('1')
  const [portTabValue, setPortTab] = useState('1')
  const [portTabDetail, setPortDetail] = useState('15')
  const [anchorEl, setAnchorEl] = useState(null)
  const expect = [0.1, 0.2, 0.3, 0.5, 1]
  const loss = [0.1, 0.2, 0.3, 0.5, 1]
  const tabStyle = { 
    fontFamily: "KoreanTITGD3, Manrope-SemiBold",
  }
  const TabPanelStyle = {
    height: "200px", 
    overflowY: "scroll", 
    padding: "10px", 
    border: "1px solid lightgray"
  }
  const initIsSelected = {
    'KOSPI 100': false,
    'KOSPI 200': false,
    'KOSDAQ': false
  }
  const KOSPI = [
  '반도체와반도체장비',
  '제약',
  '화학',
  '양방향미디어와서비스',
  '자동차',
  '복합기업',
  '은행',
  '자동차부품',
  '석유와가스']
  const KOSDAQ = [
    '제약',
    '게임엔터테인먼트',
    '생물공학',
    '화학',
    '방송과엔터테인먼트',
    '반도체와반도체장비',
    '생명과학도구및서비스',
    '디스플레이장비및부품',
    '건강관리장비와용품',
    '건축자재']
  // const scrollTheme = createTheme({
  //   overrides: { // height: "400px", overflowY: "scroll"
  //     MuiCssBaseline: {
  //       "@global": {
  //         "*::-webkit-scrollbar": {
  //           width: "5px"
  //         },
  //         "*::-webkit-scrollbar-track": {
  //           background: "#E4EFEF"
  //         },
  //         "*::-webkit-scrollbar-thumb": {
  //           background: "#1D388F61",
  //           borderRadius: "2px"
  //         }
  //       }
  //     }
  //   }
  // });
  const portName = ['최대분산P','샤프P','위험균형P', 'testP']
  const markets = ['KOSPI 100','KOSPI 200','KOSDAQ']
  let initBool = new Array(temp.length).fill(false)
  let initSectorClicked = {
    'KOSPI 100': [...initBool],
    'KOSPI 200': [...initBool],
    'KOSDAQ': [...initBool]
  }
  const [isSelected, setSelect] = useState(initIsSelected)
  const [sectorClicked, setSectorClick] = useState(initSectorClicked)
  const [isChecked, setCheck] = useState(false)
  const [sortPort, setSort] = useState([0,1,2])
  const [risk, setRisk] = useState([[0,0,0],[0,0,0],[0,0,0],[0,0,0]])
  const [userClass, setUserClass] = useState(-1)
  const userClassText = ['안정형', ' 안정추구형', '위험중립형', ' 적극투자형', '공격투자형']
  const pieData = {
    data: [[{name: '솔루스첨단소재', y: 0.3}, {name: '아모그린텍', y: 0.3}, {name: '트루윈', y: 0.4}]]//,[{name: 'sm', y: 0.5}, {name: 'yg', y: 0.5}]]
  }
  const lineData = {
    title: 'Backtest Result',
    xAxis: {
      title: 'Days Elapsed',
      categories: [...Array(60).keys()].map( x => x+1 )
    },
    yAxis: {
      title: 'yield'
    },
    data: [{
      name: '',
      data: [99.85,
        96.93,
        96.79,
        97.00,
        101.13,
        101.45,
        102.86,
        108.31,
        109.28,
        106.55,
        106.47,
        110.03,
        108.51,
        109.28,
        109.70,
        108.15,
        107.51,
        111.43,
        111.61,
        110.56,
        110.61,
        110.46,
        110.53,
        110.68,
        110.79,
        110.57,
        111.59,
        110.70,
        110.97,
        108.85,
        112.68,
        110.96,
        111.24,
        116.51,
        121.45,
        121.00,
        121.28,
        122.87]
    },{
      name: '',
      data: [99.85,
        96.93,
        96.79,
        97.00,
        101.13,
        101.45,
        102.86,
        108.31,
        109.28,
        106.55,
        106.47,
        110.03,
        108.51,
        109.28,
        109.70,
        108.15,
        107.51,
        111.43,
        111.61,
        110.56,
        110.61,
        110.46,
        110.53,
        110.68,
        110.79,
        110.57,
        111.59,
        110.70,
        110.97,
        108.85,
        112.68,
        110.96,
        111.24,
        116.51,
        121.45,
        121.00,
        121.28,
        122.87]
    },{
      name: '',
      data: [99.85,
        96.93,
        96.79,
        97.00,
        101.13,
        101.45,
        102.86,
        108.31,
        109.28,
        106.55,
        106.47,
        110.03,
        108.51,
        109.28,
        109.70,
        108.15,
        107.51,
        111.43,
        111.61,
        110.56,
        110.61,
        110.46,
        110.53,
        110.68,
        110.79,
        110.57,
        111.59,
        110.70,
        110.97,
        108.85,
        112.68,
        110.96,
        111.24,
        116.51,
        121.45,
        121.00,
        121.28,
        122.87]
    },{
      name: '',
      data: [99.85,
        96.93,
        96.79,
        97.00,
        101.13,
        101.45,
        102.86,
        108.31,
        109.28,
        106.55,
        106.47,
        110.03,
        108.51,
        109.28,
        109.70,
        108.15,
        107.51,
        111.43,
        111.61,
        110.56,
        110.61,
        110.46,
        110.53,
        110.68,
        110.79,
        110.57,
        111.59,
        110.70,
        110.97,
        108.85,
        112.68,
        110.96,
        111.24,
        116.51,
        121.45,
        121.00,
        121.28,
        122.87]
    }]
  }
  const mddData = {
    title: 'DD',
    xAxis: {
      title: 'Days Elapsed',
      categories: [...Array(60).keys()].map( x => x+1 )
    },
    yAxis: {
      title: ''
    },
    data: [{
      name: '',
      data: //[2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
      [0.0,
        -2.91,
        -3.06,
        -2.85,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        -2.49,
        -2.57,
        0.0,
        -1.37,
        -0.67,
        -0.29,
        -1.70,
        -2.29,
        0.0,
        0.0,
        -0.94,
        -0.89,
        -1.02,
        -0.96,
        -0.83,
        -0.72,
        -0.93,
        -0.01,
        -0.81,
        -0.57,
        -2.47,
        0.0,
        -1.53,
        -1.28,
        0.0,
        0.0,
        -0.36,
        -0.13,
        0.0]
    },{
      name: '',
      data: //[2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
      [0.0,
        -2.91,
        -3.06,
        -2.85,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        -2.49,
        -2.57,
        0.0,
        -1.37,
        -0.67,
        -0.29,
        -1.70,
        -2.29,
        0.0,
        0.0,
        -0.94,
        -0.89,
        -1.02,
        -0.96,
        -0.83,
        -0.72,
        -0.93,
        -0.01,
        -0.81,
        -0.57,
        -2.47,
        0.0,
        -1.53,
        -1.28,
        0.0,
        0.0,
        -0.36,
        -0.13,
        0.0]
    },{
      name: '',
      data: //[2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
      [0.0,
        -2.91,
        -3.06,
        -2.85,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        -2.49,
        -2.57,
        0.0,
        -1.37,
        -0.67,
        -0.29,
        -1.70,
        -2.29,
        0.0,
        0.0,
        -0.94,
        -0.89,
        -1.02,
        -0.96,
        -0.83,
        -0.72,
        -0.93,
        -0.01,
        -0.81,
        -0.57,
        -2.47,
        0.0,
        -1.53,
        -1.28,
        0.0,
        0.0,
        -0.36,
        -0.13,
        0.0]
    },{
      name: '',
      data: //[2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
      [0.0,
        -2.91,
        -3.06,
        -2.85,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        -2.49,
        -2.57,
        0.0,
        -1.37,
        -0.67,
        -0.29,
        -1.70,
        -2.29,
        0.0,
        0.0,
        -0.94,
        -0.89,
        -1.02,
        -0.96,
        -0.83,
        -0.72,
        -0.93,
        -0.01,
        -0.81,
        -0.57,
        -2.47,
        0.0,
        -1.53,
        -1.28,
        0.0,
        0.0,
        -0.36,
        -0.13,
        0.0]
    }]
  }
  const varData = {
    title: 'VaR',
    xAxis: {
      title: 'Days Elapsed',
      categories: [...Array(60).keys()].map( x => x+1 )
    },
    yAxis: {
      title: ''
    },
    data: [{
      name: '',
      data: //[3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
      [0.0,
        -2.91,
        -3.06,
        -2.85,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        -2.49,
        -2.57,
        0.0,
        -1.37,
        -0.67,
        -0.29,
        -1.70,
        -2.29,
        0.0,
        0.0,
        -0.94,
        -0.89,
        -1.02,
        -0.96,
        -0.83,
        -0.72,
        -0.93,
        -0.01,
        -0.81,
        -0.57,
        -2.47,
        0.0,
        -1.53,
        -1.28,
        0.0,
        0.0,
        -0.36,
        -0.13,
        0.0]
    },{
      name: '',
      data: //[3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
      [0.0,
        -2.91,
        -3.06,
        -2.85,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        -2.49,
        -2.57,
        0.0,
        -1.37,
        -0.67,
        -0.29,
        -1.70,
        -2.29,
        0.0,
        0.0,
        -0.94,
        -0.89,
        -1.02,
        -0.96,
        -0.83,
        -0.72,
        -0.93,
        -0.01,
        -0.81,
        -0.57,
        -2.47,
        0.0,
        -1.53,
        -1.28,
        0.0,
        0.0,
        -0.36,
        -0.13,
        0.0]
    },{
      name: '',
      data: //[3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
      [0.0,
        -2.91,
        -3.06,
        -2.85,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        -2.49,
        -2.57,
        0.0,
        -1.37,
        -0.67,
        -0.29,
        -1.70,
        -2.29,
        0.0,
        0.0,
        -0.94,
        -0.89,
        -1.02,
        -0.96,
        -0.83,
        -0.72,
        -0.93,
        -0.01,
        -0.81,
        -0.57,
        -2.47,
        0.0,
        -1.53,
        -1.28,
        0.0,
        0.0,
        -0.36,
        -0.13,
        0.0]
    },{
      name: '',
      data: //[3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
      [0.0,
        -2.91,
        -3.06,
        -2.85,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        -2.49,
        -2.57,
        0.0,
        -1.37,
        -0.67,
        -0.29,
        -1.70,
        -2.29,
        0.0,
        0.0,
        -0.94,
        -0.89,
        -1.02,
        -0.96,
        -0.83,
        -0.72,
        -0.93,
        -0.01,
        -0.81,
        -0.57,
        -2.47,
        0.0,
        -1.53,
        -1.28,
        0.0,
        0.0,
        -0.36,
        -0.13,
        0.0]
    }]
  }
  const [chartData, setChartOption] = useState({
    pie: pieData,
    line: lineData,
    mdd: mddData,
    var: varData
  })
  const isMounted = useRef(false);

  const getPortfolio = async() => {
    setLoaded(false)
    setLoading(true)

    let m, ms = '', mar = ''
    if(currentMarket.includes('KOSPI')) {
      m = KOSPI
    } else {
      m = KOSDAQ
    }
    
    sectorClicked[currentMarket].forEach((s, index) => {
      if(s === true){
        ms += ','
        ms += m[index]
      }
    })
    ms = ms.slice(1,ms.length)
    if(currentMarket === 'KOSPI 100') { mar = 'KOSPI100'}
    else if(currentMarket === 'KOSPI 200') { mar = 'KOSPI200'}
    else { mar = 'KOSDAQ'}
    console.log({
      "market": mar,
      "sector": ms,
      "s_ratio": stockBond/100,
      "holding_date": totalPeriod
    })
    await axios.get('/api/portfolio/result', {
      params: {
        "market": mar,
        "sector": ms,
        "s_ratio": stockBond/100,
        "holding_date": totalPeriod
      }
    }).then(res => {console.log(res.data.result); makeChartData(res.data.result);});
  }

  const makeChartData = (r) => {
    setRisk([r['샤프P'].risk, r['위험균형P'].risk, r['최대분산P'].risk, r['testP'].risk])
    setPort({
      stocks: r.result.stocks,
      similarDate: r.result.similar_date,
      weight: r.result.weight
    })
    let w = [];
    let ww = []
    for(let j=0; j<r.result.weight.length; j++){
      w = []
      for(let i=0; i<r.result.stocks.length; i++){
        w.push({
          name: r.result.stocks[i],
          y: r.result.weight[j][i],
        })
      }
      ww.push(w)
    }

    setChartOption({
      pie: {
        title: 'stocks weight',
        data: ww
      },
      line: {
        title: 'predicted yield',
        xAxis: {
          title: 'Days Elapsed',
          categories: [...Array(totalPeriod).keys()].map( x => x+1 )
        },
        yAxis: {
          title: 'yield'
        },
        data: 
          portName.map( p => {
            console.log(p, r[p])
            return ({
              name: p,
              data: r[p].data.map(d => parseFloat(d.price).toFixed(2)).map(Number)
            })
          })
      },
      mdd: {
        title: 'DD',
        xAxis: {
          title: 'Days Elapsed',
          categories: [...Array(totalPeriod).keys()].map( x => x+1 )
        },
        yAxis: {
          title: ''
        },
        data: 
          portName.map( p => {
            return ({
              name: p+' DD',
              data: r[p].dd.map(i => parseFloat(i).toFixed(2)).map(Number) // dd 안되면 여기 보기!!
            })
          })
      },
      var: {
        title: 'VaR',
        xAxis: {
          title: 'Days Elapsed',
          categories: [...Array(totalPeriod).keys()].map( x => x+1 )
        },
        yAxis: {
          title: ''
        },
        data:
          portName.map( p => {
            return ({
              name: p+' VaR 99%',
              data: r[p].data.map(d => parseFloat(d.VaR1).toFixed(2)).map(Number)
            },{
              name: p+' VaR 95%',
              data: r[p].data.map(d => parseFloat(d.VaR2).toFixed(2)).map(Number)
            })
          })
      }
    })
  }
  let sectors = []
  const getSectors = (market) => {
    const mk = [market]
    setMarket(...mk)
    if (market.includes('KOSPI')) {
      //sectors.push(KOSPI)
      sectors.push([...temp])
    } else {
      //sectors.push(KOSDAQ)
      sectors.push([...temp])
    }
    setSector({
      recent: {'KOSPI 100': [...temp], 'KOSPI 200': [...temp], 'KOSDAQ': [...temp]}, 
      up: {'KOSPI 100': [...temp], 'KOSPI 200': [...temp], 'KOSDAQ': [...temp]}, 
      down: {'KOSPI 100': [...temp], 'KOSPI 200': [...temp], 'KOSDAQ': [...temp]}, 
      category: {'KOSPI 100': [...temp], 'KOSPI 200': [...temp], 'KOSDAQ': [...temp]}
    })
  }
  const selectMarket = (e) => {
    setMarket(e.target.value)
    setSelect({
      ...initIsSelected,
      [e.target.value]: true
    })
    //getSectors(e.target.value)
  }
  const selectSector = (e) => {
    const n = e.target.value  
    let sss = sectorClicked[currentMarket]
    sss[n] = !sss[n]
    setSectorClick((prev)=>({
      ...prev,
      [currentMarket]: sss
    }))
  }
  const check = () => {
    setCheck(!isChecked)
  }
  const onClick = () => {
    initUserOption = userOption
    //getPortfolio()
    setShowChart(!showChart)
  }
  const valueLabelFormat = (value) => {
    return `주식: ${value}% 채권: ${100-value}%`;
  }
  const valueLabelFormatPeriod = (value) => {
    return `${value}일`;
  }
  const mouseEnter = (e) => {
    setAnchorEl(e.currentTarget)
  }
  const mouseLeave = () => {
    setAnchorEl(null)
  }
  useEffect(() => {
    setTimeout(() => {
      isMounted.current = true;
    });
  }, [])
  useEffect(()=>{
    if(!isMounted.current) return;
    getPortfolio()
  },[showChart])
  useEffect(()=>{
    if(!isMounted.current) return;
    setLoaded(true);
    setLoading(false);
    let sort = chartData.line.data.map((d, i) => [(d.data[d.data.length-1]-100).toFixed(2),i]).sort().reverse().map(d => d[1])
    //console.log(chartData)
    setSort(()=>[...sort])
  },[chartData])
  useEffect(()=>{
    recommend()
    //getSortedSector()
  },[])

  return(
    <div className="container">
      <div className="option">
        <div className="title">Select Options</div>
        <div className="options">
          <span style={{fontSize: 'large'}} key={stockBond}>주식 - 채권 비중 : {stockBond} - {100-stockBond}</span>
          <div style={{width:'400px', verticalAlign: 'middle', color: ''}}>
            <Slider
              aria-label="주식 채권 비중"
              defaultValue={60}
              valueLabelFormat={valueLabelFormat}
              onChange={(e, v) => setStockBond(v)}
              valueLabelDisplay="auto"
              min={0}
              max={100}
              style={{width:'400px', verticalAlign: 'middle', color: 'black'}}
            />
          </div>
        </div>

        <div className="options">
          <span style={{fontSize: 'large', marginTop: '20px'}} key={totalPeriod}>전체 보유기간 : {totalPeriod}일</span>
          <div style={{width: '400px', verticalAlign: 'middle'}}>
            <Slider
              aria-label="주식 보유 기간"
              defaultValue={60}
              valueLabelFormat={valueLabelFormatPeriod}
              onChange={(e, v) => setPeriod(v)}
              valueLabelDisplay="auto"
              step={30}
              min={30}
              max={750}
              style={{width:'400px', verticalAlign: 'middle', color: 'black'}}
            />
          </div>
        </div>

        <div className="options">
          <div style={{display:'flex', flexDirection: 'row', fontSize: 'large'}} key={stockBond}>투자 성향</div>
          {[0,1,2,3,4].map((i, index) =>
            <Button 
              sx={{fontSize: 'middle', margin: '10px 10px 0 0', border: "solid 1px black", borderRadius: "10px", color: "black", padding: "3px" }} 
              value={index}
              onClick={(e)=>{setUserClass(()=>parseInt(e.target.value))}}
              onMouseEnter={(e) => mouseEnter(e)}
              onMouseLeave={() => mouseLeave()}
              aria-haspopup="true"
              aria-owns={Boolean(anchorEl) ? 'mouse-over-popover' : undefined}
              style={{backgroundColor: (userClass === index) ? 'lightgray':null}}
              key={i}
            >
              {userClassText[index]}
            </Button>
          )}
          <Popover
            id="mouse-over-popover"
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={() => mouseLeave()}
            sx={{ pointerEvents: 'none', margin: "10px 0 0 0" }}
            style={{paper:{minWidth: "10rem"}}}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            disableRestoreFocus
          >
            기대 수익률: {anchorEl && expect[parseInt(anchorEl.value)] * 100}%
            <br></br>위험 감수: {anchorEl && loss[parseInt(anchorEl.value)] * 100}%
          </Popover>
        </div>
      </div>

      <div>
        <div className="sector-market">
          <span style={{fontSize: 'large'}}>마켓/섹터 고르기</span>
          <Checkbox size="small" color="default" value={isChecked} onClick={check} /><span style={{fontSize: 'small'}}>추천 종목</span>
          {!isChecked && <div key={isChecked}>
            <div className="market">
              <div>Market</div>
                <ButtonGroup style={{height: '1.5rem', marginTop: '10px'}} color='inherit' key={currentMarket}>
                  {markets.map(m =>
                    <Button key={m} value={m} onClick={selectMarket} style={{backgroundColor: isSelected[m] ? 'lightgray':null}}>{m}</Button>
                  )}
                </ButtonGroup>
            </div>
            <div className="sector"> 
              <div style={{marginTop: '15px'}}>Sector</div>
              <Box sx={{ width: '360px'}}>
                <TabContext value={tabValue}>
                  <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                    <TabList onChange={(e, value) => setTab(value)}>
                      <Tab label="최근 수익률" value="1" style={tabStyle} />
                      <Tab label="상승" value="2" style={tabStyle} />
                      <Tab label="하락" value="3" style={tabStyle} />
                      <Tab label="업종" value="4" style={tabStyle} />
                    </TabList>
                  </Box>
                  {
                    currentMarket && 
                    <div key={currentMarket}>
                      <TabPanel value="1" style={TabPanelStyle}>
                        <Box sx={{fontSize: 'middle'}} style={{height: '1.5em', width: '312px'}} key={sectorClicked}>
                          {
                          selectedSector.recent[currentMarket].map((s, value) => 
                            <div style={{height: '2rem', display: 'flex', alignItems: 'center'}}>
                              <Checkbox
                                key={value}
                                value={value}
                                onClick={selectSector} 
                                style={{color: "black", padding: 0, width: '50px', backgroundColor: sectorClicked[currentMarket][value] ? 'lightgray':null}}
                              />
                              <div style={{minWidth: '162px'}}>{s}</div>
                              <div style={{width: '100px'}}>여기는 숫자</div>
                            </div>
                            )
                          }
                        </Box>
                      </TabPanel>

                      <TabPanel value="2" style={TabPanelStyle}>
                        <Box sx={{fontSize: 'middle'}} style={{display: 'flex', flexWrap: "wrap", gap: "4%", height: '1.5em', width: '312px'}} key={sectorClicked}>
                          {
                            selectedSector.recent[currentMarket].map((s, value) => 
                            <div style={{height: '2rem', display: 'flex'}}>
                              <Checkbox 
                                key={value}
                                value={value}
                                onClick={selectSector} 
                                style={{color: "black", padding: 0, width: '50px', backgroundColor: sectorClicked[currentMarket][value] ? 'lightgray':null}}
                              />
                              <div style={{minWidth: '162px'}}>{s}</div>
                              <div style={{width: '100px'}}>여기는 숫자</div>
                            </div>
                            )
                          }
                        </Box>
                      </TabPanel>

                      <TabPanel value="3" style={TabPanelStyle}>
                        <Box sx={{fontSize: 'middle'}} style={{display: 'flex', flexWrap: "wrap", gap: "4%", height: '1.5em', width: '312px'}} key={sectorClicked}>
                          {
                            selectedSector.recent[currentMarket].map((s, value) => 
                            <div style={{height: '2rem', display: 'flex'}}>
                              <Checkbox 
                                key={value}
                                value={value}
                                onClick={selectSector} 
                                style={{color: "black", padding: 0, width: '50px', backgroundColor: sectorClicked[currentMarket][value] ? 'lightgray':null}}
                              />
                              <div style={{minWidth: '162px'}}>{s}</div>
                              <div style={{width: '100px'}}>여기는 숫자</div>
                            </div>
                            )
                          }
                        </Box>
                      </TabPanel> 
                      
                      <TabPanel value="4" style={TabPanelStyle}>
                        <Box sx={{fontSize: 'middle'}} style={{display: 'flex', flexWrap: "wrap", gap: "4%", height: '1.5em', width: '312px'}} key={sectorClicked}>
                          {
                            selectedSector.recent[currentMarket].map((s, value) => 
                            <div style={{height: '2rem', display: 'flex'}}>
                              <Checkbox 
                                key={value}
                                value={value}
                                onClick={selectSector} 
                                style={{color: "black", padding: 0, width: '50px', backgroundColor: sectorClicked[currentMarket][value] ? 'lightgray':null}}
                              />
                              <div style={{minWidth: '162px'}}>{s}</div>
                              <div style={{width: '100px'}}>여기는 숫자</div>
                            </div>
                            )
                          }
                        </Box>
                      </TabPanel>
                    </div>}
                </TabContext>
              </Box>
            </div>
          </div>}
          {isChecked && 
            <div>
              <Box sx={{display:'flex', flexDirection: 'column', fontSize: 'middle'}} key={sectorClicked}>
                {/* <ButtonGroup style={{height: '1.5rem', width: '1200px', marginBottom: '10px'}} color='inherit'>
                  {pick.slice(0,5).map((ss, value) =>
                    <Button key={value} value={value} onClick={selectSector} style={{backgroundColor: sectorClicked[currentMarket][value] ? 'lightgray':null}}>{ss}</Button>)
                  }
                  {pick.slice(5,10).map((ss, value) =>
                    <Button key={value+6} value={value+6} onClick={selectSector} style={{backgroundColor: sectorClicked[currentMarket][value+6] ? 'lightgray':null}}>{ss}</Button>)
                  }
                </ButtonGroup> */}
                <div style={{display: 'flex', flexWrap: 'wrap'}}>
                  <ButtonGroup style={{height: '1.5rem', width: '1200px', marginBottom: '10px'}} color='inherit'>
                    {pick.slice(0,5).map((ss, value) =>
                      <Button 
                        key={value}   
                        value={value} 
                        onClick={selectSector} 
                        style={{backgroundColor: sectorClicked['KOSPI 200'][value] ? 'lightgray':null}}
                      >{ss}</Button>
                    )}
                  </ButtonGroup>
                  <ButtonGroup style={{height: '1.5rem', width: '1200px', marginBottom: '10px'}} color='inherit'>
                    {pick.slice(5,pick.length).map((ss, value) =>
                      <Button 
                        key={value} 
                        value={value}
                        onClick={selectSector} 
                        style={{backgroundColor: sectorClicked['KOSPI 200'][value] ? 'lightgray':null}}
                      >{ss}</Button>
                    )}
                  </ButtonGroup>
                </div>
              </Box>
            </div>}
        </div>
        <div style={{width: "360px"}}>
          <button onClick={onClick} style={{width: "5rem", height: "2rem", margin: "20px 0 10px 0"}}>save</button>
        </div>
      </div>

      <div className="portfolio">
        <div className="title">Portfolio Information</div>
        {/* loaded ? */}
        <li key="1">종목:  { portfolio.stocks.map(i => i + ' ') }</li>
        <li key="2">유사 시점:  { portfolio.similarDate.map(i => i + ' ') }</li>

        {
          //loaded 
          isMounted && sortPort.map((n, index) => {
            return(
            <Accordion style={{marginTop:'15px', width: "900px"}} key={n}>
              <AccordionSummary aria-controls="panel3d-content" id="panel3d-header">
                <span>{portName[n]}</span>
                {/* <span style={{marginLeft: '20px'}}>예상 수익: {loaded ? (chartData.line.data[n].data[chartData.line.data[n].data.length-1]-100).toFixed(2) : ''}%</span> */}
                <span style={{marginLeft: '20px'}}>{loaded ? '예상 수익: ' : '' }{loaded ? (chartData.line.data[n].data[chartData.line.data[n].data.length-1]-100).toFixed(2) : ''}{loaded ? '%' : ''}</span>
              </AccordionSummary>
              <AccordionDetails key={chartData.line.data}>
                <div className="stock-risk" style={{display: 'flex'}}>
                  <div style={{minWidth: '400px', verticalAlign: 'top'}} key={chartData}>
                    <div className="title1" style={{marginBottom: '15px'}}>Stocks Weight</div>
                    <Pie title={chartData.pie.title} data={chartData.pie.data[n]} style={{verticalAlign: 'top'}}/>
                  </div>
                </div>

                <div className="backtest">
                  <div className="chart" style={{width: '850px'}}>
                    <div className="title1">Backtest</div>
                    <span style={{width: '400px', verticalAlign: 'top'}}>
                      <MultiLine props={chartData.line} num={n} period={totalPeriod} />
                    </span>
                  </div>
                </div>

                <div className="risk" style={{minWidth: '900px', verticalAlign: 'top'}} key={chartData}>
                  <div className="title1">Risk</div>
                  <span style={{display: 'flex', verticalAlign: 'top', gap: '20px'}}>
                    <div>sharpe: {risk[n][0].toFixed(2)} </div>
                    <div>trainer: {risk[n][1].toFixed(2)} </div>
                    <div>zensen: {risk[n][2].toFixed(2)} </div> 
                  </span>
                  <span style={{width: '430px', display:'inline-block', verticalAlign: 'top'}}>
                    <MultiLine props={chartData.mdd} num={n} period={totalPeriod} />
                  </span>
                  <span style={{width: '430px', display:'inline-block', verticalAlign: 'top'}}>
                    <MultiLine props={chartData.var} num={n} period={totalPeriod} />
                  </span>
                </div>
              </AccordionDetails>
            </Accordion>)
          })
        }
        {/* isMounted && portTabValue && 
          <Box sx={{ width: '900px', display: 'grid', flexGrow: 1, gridTemplateColumns: '150px 700px', gridTemplateRows: '50px auto' }}>
            <TabContext value={portTabValue}>
              <Box sx={{borderBottom: 1, borderRight: 1, borderColor: 'divider'}}>
                <Tabs value={portTabValue} orientation="vertical" onChange={(e, value) => setPortTab(value)}>
                  <Tab label={portName[0]} value="1" style={tabStyle} />
                  <Tab label={portName[1]} value="2" style={tabStyle} />
                  <Tab label={portName[2]} value="3" style={tabStyle} />
                  <Tab label={portName[3]} value="4" style={tabStyle} />
                </Tabs>
              </Box>
              
              {
                <TabPanel value={portTabValue} index={portTabValue.toString()} style={{padding: 0, width: "900px"}} key={portTabValue}>    
                  <Box sx={{width: '900px'}}>
                    <div className="stock-risk" style={{display: 'flex'}}>
                      <div style={{minWidth: '400px', verticalAlign: 'top'}} key={chartData}>
                        <div className="title1" style={{marginBottom: '15px'}}>Stocks Weight</div>
                        <Pie title={chartData.pie.title} data={chartData.pie.data[portTabValue-1]} style={{verticalAlign: 'top'}}/>
                      </div>
                    </div>
                    <div className="backtest">
                      <div className="chart" style={{width: '850px'}}>
                        <div className="title1">Backtest</div>
                        <span style={{width: '400px', verticalAlign: 'top'}}>
                          <MultiLine props={chartData.line} num={portTabValue-1} period={totalPeriod} />
                        </span>
                      </div>
                    </div>
                    <div className="risk" style={{minWidth: '900px', verticalAlign: 'top'}} key={chartData}>
                      <div className="title1">Risk</div>
                      <span style={{display: 'flex', verticalAlign: 'top', gap: '20px'}}>
                        <div>sharpe: {risk[portTabValue-1][0].toFixed(2)} </div>
                        <div>trainer: {risk[portTabValue-1][1].toFixed(2)} </div>
                        <div>zensen: {risk[portTabValue-1][2].toFixed(2)} </div> 
                      </span>
                      <span style={{width: '430px', display:'inline-block', verticalAlign: 'top'}}>
                        <MultiLine props={chartData.mdd} num={portTabValue-1} period={totalPeriod} />
                      </span>
                      <span style={{width: '430px', display:'inline-block', verticalAlign: 'top'}}>
                        <MultiLine props={chartData.var} num={portTabValue-1} period={totalPeriod} />
                      </span>
                    </div>
                  </Box>
                </TabPanel>
              }              
              {
                //currentMarket === 
                // [1,2,3,4].map((portIndex) => {
                //   console.log(portIndex)
                //   return( 
                  <>

                  </>
                //   )
                // })
              }
            </TabContext>
          </Box>          
        */}
        {
          isLoading && 
          <div style={{textAlign: "center", margin: "30px"}}>
            <CircularProgress color="inherit"/>
          </div> 
        }
      </div>
  	</div>
  );
}

export default Portfolio;

// sector 수익률 30일 표시 + 정렬
// 포트폴리오 탭화
// 형식: 체크 박스 / 섹터 / 수익률, 상승, 하락 (색)
