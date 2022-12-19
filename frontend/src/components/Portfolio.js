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
import TabPanel from '@mui/lab/TabPanel';
import Popover from '@mui/material/Popover';


function Portfolio() {
  const [pick, setPick] = useState(['삼성전자', '유한양행', '금호석유', 'Naver', '기아', '효성', 'BNK금융지주', '한온시스템', 'SK이노베이션'])
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
    recent: {'KOSPI 100': [], 'KOSPI 200': [], 'KOSDAQ': []}, 
    up: {'KOSPI 100': [], 'KOSPI 200': [], 'KOSDAQ': []}, 
    down: {'KOSPI 100': [], 'KOSPI 200': [], 'KOSDAQ': []}
  })
  const [currentMarket, setMarket] = useState('KOSPI 200')
  const [tabValue, setTab] = useState('1')
  const [anchorEl, setAnchorEl] = useState(null)
  const expect = [0.1, 0.2, 0.3, 0.5, 1]
  const loss = [0.1, 0.2, 0.3, 0.5, 1]
  const tabStyle = { 
    fontFamily: "KoreanTITGD3, Manrope-SemiBold",
    width: "33.3%"
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
  const portName = ['최대분산P','샤프P','위험균형P', 'User_P']
  const markets = ['KOSPI 100','KOSPI 200','KOSDAQ']
  let initBool = new Array(20).fill(false)
  let initSectorClicked = {
    'KOSPI 100': [...initBool],
    'KOSPI 200': [...initBool],
    'KOSDAQ': [...initBool]
  }
  const [isSelected, setSelect] = useState(initIsSelected)
  const [sectorClicked, setSectorClick] = useState(initSectorClicked)
  const [sectorName, setSectorName] = useState([])
  const [isChecked, setCheck] = useState(false)
  const [sortPort, setSort] = useState([0,1,2])
  const [pNum, setPNum] = useState(0)
  const [risk, setRisk] = useState([[0,0,0],[0,0,0],[0,0,0],[0,0,0]])
  const [userClass, setUserClass] = useState(-1)
  const userClassText = ['안정형', ' 안정추구형', '위험중립형', ' 적극투자형', '공격투자형']
  const pieData = {
    data: [[{name: '솔루스첨단소재', y: 0.3}, {name: '아모그린텍', y: 0.3}, {name: '트루윈', y: 0.4}]]
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
      data:
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
      data:
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
      data:
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
      data:
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
      data:
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
      data:
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
      data:
      [0.0, -2.91, -3.06, -2.85, 0.0, 0.0, 0.0, 0.0, 0.0, -2.49, -2.57, 0.0, -1.37, -0.67, -0.29, -1.70, -2.29, 0.0, 0.0, -0.94,
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
      data:
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
  
  // 추천 종목 가져오기 
  const recommend = async () => {
    await axios.get('/api/portfolio/top_pick').then(res => {setPick(res.data.result);});
  }

  // 정렬된 섹터 가져오기 
  const getSortedSector = async () => {
    await axios.get('/api/portfolio/sector_updown').then(res => {
      const data = res.data.result
      setSector({
        recent: {'KOSPI 100': data.recent[0], 'KOSPI 200': data.recent[1], 'KOSDAQ': data.recent[2]}, 
        up: {'KOSPI 100': data.up[0], 'KOSPI 200': data.up[1], 'KOSDAQ': data.up[2]}, 
        down: {'KOSPI 100': data.down[0], 'KOSPI 200': data.down[1], 'KOSDAQ': data.down[2]}
      })
    });
  }

  // 포트폴리오, 백테스트 결과 가져오기
  const getPortfolio = async() => { 
    if(userClass === -1){ 
      alert("투자 성향을 선택해주세요!")
      return;
    }
    const isMarektSelected = Object.values(isSelected).some(i => i)
    if(!isMarektSelected && !isChecked){
      alert("마켓을 선택해주세요!")
      return;
    }
    let m, ms = '', mar = ''
    m = sectorName
    sectorClicked[currentMarket].forEach((s, index) => {
      if(s === true){
        ms += '@'
        ms += m[index]
      }
    })
    ms = ms.slice(1,ms.length)
    if(ms.length === 0){
      alert("섹터를 선택해주세요!");
      return;
    }
    setLoaded(false)
    setLoading(true)
    if(currentMarket === 'KOSPI 100') { mar = 'KOSPI100'}
    else if(currentMarket === 'KOSPI 200') { mar = 'KOSPI200'}
    else { mar = 'KOSDAQ'}
    await axios.get('/api/portfolio/result', {
      params: {
        "market": mar,
        "sector": ms,
        "s_ratio": stockBond/100,
        "holding_date": totalPeriod,
        "user_i": userClass
      }
    }).then(res => {makeChartData(res.data.result);});
  }
  
  // chart data 
  const makeChartData = (r) => {
    setPNum(()=>r['샤프P'].p_num);
    setRisk([r['샤프P'].risk, r['위험균형P'].risk, r['최대분산P'].risk, r['User_P'].risk])
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
              data: r[p].dd.map(i => parseFloat(i).toFixed(2)).map(Number)
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
              data: r[p].data.map(d => parseFloat(d.VaR1).toFixed(4)).map(Number)
            },{
              name: p+' VaR 95%',
              data: r[p].data.map(d => parseFloat(d.VaR2).toFixed(4)).map(Number)
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
      sectors.push([...sectorName])
    } else {
      sectors.push([...sectorName])
    }
    setSector({
      recent: {'KOSPI 100': [...sectorName], 'KOSPI 200': [...sectorName], 'KOSDAQ': [...sectorName]}, 
      up: {'KOSPI 100': [...sectorName], 'KOSPI 200': [...sectorName], 'KOSDAQ': [...sectorName]}, 
      down: {'KOSPI 100': [...sectorName], 'KOSPI 200': [...sectorName], 'KOSDAQ': [...sectorName]}, 
      category: {'KOSPI 100': [...sectorName], 'KOSPI 200': [...sectorName], 'KOSDAQ': [...sectorName]}
    })
  }

  // 마켓 선택 시
  const selectMarket = (e) => {
    setMarket(e.target.value)
    setSelect({
      ...initIsSelected,
      [e.target.value]: true
    })
    //getSectors(e.target.value)
  }

  // 섹터 선택 시
  const selectSector = (e) => {
    const n = e.target.value  
    let sss = sectorClicked[currentMarket]
    sss[n] = !sss[n]
    setSectorClick((prev)=>({
      ...prev,
      [currentMarket]: sss
    }))
  }

  // 추천 종목 버튼 클릭
  const check = () => {
    setCheck(!isChecked)
  }

  // save 버튼 클릭
  const onClick = () => {
    setShowChart(!showChart)
  }

  // slider 함수
  const valueLabelFormat = (value) => {
    return `주식: ${value}% 채권: ${100-value}%`;
  }
  const valueLabelFormatPeriod = (value) => {
    return `${value}일`;
  }

  // popover 함수
  const mouseEnter = (e) => {
    setAnchorEl(e.currentTarget)
  }
  const mouseLeave = () => {
    setAnchorEl(null)
  }

  // useEffect
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
    setSort(()=>[...sort])
  },[chartData])

  useEffect(()=>{
    recommend()
    getSortedSector()
  },[])
  
  useEffect(()=>{
    setSectorClick({
      'KOSPI 100': new Array(sectorName.length).fill(false),
      'KOSPI 200': new Array(sectorName.length).fill(false),
      'KOSDAQ': new Array(sectorName.length).fill(false)
    })
  },[selectedSector, chartData])
  
  useEffect(()=>{
    setSectorName(selectedSector.recent['KOSPI 100'].map(i => i.sector))
  },[selectedSector])
  
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
          <Checkbox size="small" color="default" value={isChecked} onClick={check} />
          <span style={{fontSize: 'small'}}>추천 종목</span>
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
                    </TabList>
                  </Box>
                  {
                    currentMarket && 
                    <div key={currentMarket}>
                      <TabPanel value="1" style={TabPanelStyle}>
                        <Box sx={{fontSize: 'middle'}} style={{height: '1.5em', width: '312px'}} key={sectorClicked}>
                          {
                          currentMarket && selectedSector.recent[currentMarket].map((s, value) => 
                            <div style={{height: '2rem', display: 'flex', alignItems: 'center'}}>
                              <Checkbox
                                defaultChecked={sectorClicked[currentMarket][value]}
                                color="default"
                                key={value}
                                value={value}
                                onClick={selectSector} 
                                style={{color: "black", padding: 0, width: '24px', margin: '0 20px 0 20px'}}
                              />
                              <div style={{minWidth: '162px'}}>{s.sector}</div>
                              {(s.data >= 0) && <div style={{width: '100px', color: 'blue'}}>{'+'}{s.data.toFixed(2)}%</div>}
                              {(s.data < 0) && <div style={{width: '100px', color: 'red'}}>{s.data.toFixed(2)}%</div>}
                            </div>
                            )
                          }
                        </Box>
                      </TabPanel>

                      <TabPanel value="2" style={TabPanelStyle}>
                        <Box sx={{fontSize: 'middle'}} style={{display: 'flex', flexWrap: "wrap", gap: "4%", height: '1.5em', width: '312px'}} key={sectorClicked}>
                          {
                          currentMarket && selectedSector.up[currentMarket].map((s, value) => 
                            <div style={{height: '2rem', display: 'flex', alignItems: 'center'}}>
                              <Checkbox 
                                defaultChecked={sectorClicked[currentMarket][value]}
                                key={value}
                                value={value}
                                onClick={selectSector} 
                                style={{color: "black", padding: 0, width: '24px', margin: '0 20px 0 20px'}}
                              />
                              <div style={{minWidth: '162px'}}>{s.sector}</div>
                              {(s.data >= 0) && <div style={{width: '100px', color: 'blue'}}>{'+'}{s.data.toFixed(2)}%</div>}
                              {(s.data < 0) && <div style={{width: '100px', color: 'red'}}>{s.data.toFixed(2)}%</div>}
                            </div>
                            )
                          }
                        </Box>
                      </TabPanel>

                      <TabPanel value="3" style={TabPanelStyle}>
                        <Box sx={{fontSize: 'middle'}} style={{display: 'flex', flexWrap: "wrap", gap: "4%", height: '1.5em', width: '312px'}} key={sectorClicked}>
                          {
                          currentMarket && selectedSector.down[currentMarket].map((s, value) => 
                            <div style={{height: '2rem', display: 'flex', alignItems: 'center'}}>
                              <Checkbox
                                defaultChecked={sectorClicked[currentMarket][sectorName.length - value - 1]}
                                key={sectorName.length - value - 1}
                                value={sectorName.length - value - 1}
                                onClick={selectSector} 
                                style={{color: "black", padding: 0, width: '24px', margin: '0 20px 0 20px'}}
                              />
                              <div style={{minWidth: '162px'}}>{s.sector}</div>
                              {(s.data >= 0) && <div style={{width: '100px', color: 'blue'}}>{'+'}{s.data.toFixed(2)}%</div>}
                              {(s.data < 0) && <div style={{width: '100px', color: 'red'}}>{s.data.toFixed(2)}%</div>}
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
                <div style={{display: 'flex', flexWrap: 'wrap'}}>
                    {
                    pick && 
                    <Box style={{height: "200px", width: "350px", overflowY: "scroll", border: "1px solid lightgray"}}>
                      {pick.map((s, value) => 
                      <div style={{height: '2rem', display: 'flex', alignItems: 'center'}}>
                        <Checkbox
                          defaultChecked={sectorClicked['KOSPI 200'][value]}
                          key={value}
                          value={value}
                          onClick={selectSector} 
                          style={{color: "black", padding: 0, width: '24px', margin: '0 20px 0 20px'}}
                        />
                        <div style={{width: '100px'}}>{s}</div>
                      </div>
                      )}
                    </Box>
                    }
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
        <li key="1" style={{minWidth: 'max-content'}}>종목:  { loaded ? portfolio.stocks.map(i => i + ' ') : '' }</li>
        <li key="2" style={{minWidth: 'max-content'}}>유사 시점:  { loaded ? portfolio.similarDate.map(i => i + ' ') : '' }</li>

        {
          loaded && sortPort.map((n, index) => {
            return(
            <Accordion style={{marginTop:'15px', width: "900px"}} key={n}>
              <AccordionSummary aria-controls="panel3d-content" id="panel3d-header">
                <span>{portName[n]}</span>
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
                      <MultiLine props={chartData.line} num={n} period={pNum} />
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
                    <MultiLine props={chartData.mdd} num={n} period={pNum} />
                  </span>
                  <span style={{width: '430px', display:'inline-block', verticalAlign: 'top'}}>
                    <MultiLine props={chartData.var} num={n} period={pNum} />
                  </span>
                </div>
              </AccordionDetails>
            </Accordion>)
          })
        }
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