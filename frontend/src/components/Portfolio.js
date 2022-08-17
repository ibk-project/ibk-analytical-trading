import { useState, useEffect } from 'react';
import './css/Portfolio.css';
import Pie from './chart/Pie';
import MultiLine from './chart/multiLine';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress'; // 로딩중
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { Box } from '@mui/system';
import Checkbox from '@mui/material/Checkbox';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

function Portfolio() {
  let initUserOption = {
	  option1: '',
    option2: '',
    option3: ''
  }
  const [userOption, setUserOption] = useState(initUserOption)
  // API 부르기
  const [showChart, setShowChart] = useState(false)
  const [portfolio, setPort] = useState({
    stocks: ['SM','YG'],
    similarDate: ['2019-05-06','2019-05-06'],
    weight: [[0.2,0.8],[0.3,0.7]]    
  })
  const [stockBond, setStockBond] = useState(60)
  const [isLoading, setLoading] = useState(false)
  const [selectedSector, setSector] = useState([])
  const [currentMarket, setMarket] = useState('')
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
  '철강',
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
  const portName = ['port1','port2']
  let initSectorClicked = [false, false, false, false, false, false, false, false, false, false, false, false]
  const [isSelected, setSelect] = useState(initIsSelected)
  const [sectorClicked, setSectorClick] = useState(initSectorClicked)
  const [isChecked, setCheck] = useState(false)
  const pieData = {
    title: '',
    data: [{name: 'SM', y: 0.2}, {name: 'JYP', y: 0.1}, {name: '빅히트', y: 0.3}, {name: 'YG', y: 0.4}]
  }
  const lineData = {
    title: '',
    xAxis: {
      title: 'Date',
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    },
    yAxis: {
      title: 'yield'
    },
    data: [{
      name: 'Reggane',
      data: [16.0, 18.2, 23.1, 27.9, 32.2, 36.4, 39.8, 38.4, 35.5, 29.2, 22.0, 17.8]
    }, {
      name: 'Tallinn',
      data: [-2.9, -3.6, -0.6, 4.8, 10.2, 14.5, 17.6, 16.5, 12.0, 6.5, 2.0, -0.9]
    }]
  }
  const mddData = {
    title: 'DD',
    xAxis: {
      title: 'Date',
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    },
    yAxis: {
      title: ''
    },
    data: [{
      name: 'DD',
      data: [0.0, -3.6, -3.0, -2.5, 0, -0.1, -4.1, -3.6, -3.3, -2.8, -1.4, 0.0]
    },]
  }
  const [chartData, setChartOption] = useState({
    pie: pieData,
    line: lineData,
    mdd: mddData
  })

  const getPortfolio = async() => {
    let m, ms = '', mar = ''
    if(currentMarket.includes('KOSPI')) {
      m = KOSPI
    } else {
      m = KOSDAQ
    }
    
    sectorClicked.forEach((s, index) => {
      if(s === true){
        ms += ','
        ms += m[index]
      }
    })
    ms = ms.slice(1,ms.length)
    
    if(currentMarket === 'KOSPI 100') { mar = 'KOSPI100'}
    else if(currentMarket === 'KOSPI 200') { mar = 'KOSPI200'}
    else { mar = 'KOSDAQ'}
    let r, w = []
    await axios.get('/api/portfolio/result', {
      params: {
        "market": mar,
        "sector": ms,
        "s_ratio": stockBond/100
      }
    }).then(res => {console.log(res); r = res.data.result});
    
    setPort({
      stocks: r.result.stocks,
      similarDate: r.result.similar_date,
      weight: r.result.weight
    })
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
    console.log(ww)
    setChartOption({
      ...chartData,
      pie: {
        title: 'stocks weight',
        data: ww
      },
      line: {
        title: 'predicted yield',
        xAxis: {
          title: 'Date',
          categories: r.result.port1.data.map(s => { return s.date })
        },
        yAxis: {
          title: 'yield'
        },
        data: 
          portName.map( p => {
            return ({
              name: p,
              data: r.result.p.data.map(d => { return d.price })
            })
          })
      },
      mdd: {
        title: 'DD',
        xAxis: {
          title: 'Date',
          categories: r.result.port1.data.map(s => { return s.date })
        },
        yAxis: {
          title: ''
        },
        data: 
          portName.map( p => {
            return ({
              name: p+' DD',
              data: r.result.p.dd
            })
          })
      }
    })
    //console.log(chartData.pie.data)
  }
  let sectors = []
  const getSectors = (market) => {
    const mk = [market]
    setMarket(...mk)
    //console.log(currentMarket)
    //선택한 마켓별 섹터 불러오기
    if (market.includes('KOSPI')) {
      sectors.push(KOSPI)
    } else {
      sectors.push(KOSDAQ)
    }
    setSector([...sectors])
  }
  const markets = ['KOSPI 100','KOSPI 200','KOSDAQ']
  const selectMarket = (e) => {
    setMarket(e.target.value)
    setSectorClick([...initSectorClicked])
    setSelect({
      ...initIsSelected,
      [e.target.value]: true
    })
    getSectors(e.target.value)
  }
  const selectSector = (e) => {
    const n = e.target.value
    let sss = sectorClicked
    sss[n] = !sss[n]
    setSectorClick([...sss])
  }
  const check = () => {
    setCheck(!isChecked)
  }
  const onClick = () => {
    // 저장
    initUserOption = userOption
    getPortfolio()
    setShowChart(!showChart)
  }
  const onChange = (e) => {
    initUserOption = {
      ...userOption,
      [e.target.name]: e.target.value
    }
    setUserOption(initUserOption)
  }
  const changeSlider = (e, v) => {
    setStockBond(v)
  }
  const valueLabelFormat = (value) => {
    return `주식: ${value}% 채권: ${100-value}%`;
  }
  const showPort = (e) => {
    console.log(e)
    //setExpand(e)
  }
  useEffect(()=>{
    getPortfolio()
    // setChartOption({
    //   pie: {
    //     ...chartData.pie,
    //     title: userOption.option1,
    //   },
    //   line: {
    //     ...chartData.line,
    //     title: userOption.option2
    //   },
    //   mdd: {
    //     ...chartData.mdd
    //   }
    // })
  },[showChart])
  useEffect(()=>{
  },[currentMarket])
  return(
    <div className="container">
      <div className="option">
        <div className="title">User input</div>
        <span className="options">
          <span style={{fontSize: 'large'}} key={stockBond}>주식 - 채권 비중 : {stockBond} - {100-stockBond}</span>
          <div style={{width:'400px', verticalAlign: 'middle', color: ''}}>
            <Slider
              aria-label="주식 채권 비중"
              defaultValue={60}
              valueLabelFormat={valueLabelFormat}
              onChange={changeSlider}
              valueLabelDisplay="auto"
              min={0}
              max={100}
              style={{width:'400px', verticalAlign: 'middle', color: 'black'}}
            />
          </div>
          {/* <span style={{display:'inline-block'}} key={stockBond}>주식: {stockBond} 채권: {100-stockBond}</span> */}
        </span>
        <div className="options">
          <span style={{fontSize: 'large'}}>마켓/섹터 고르기</span>
          <Checkbox size="small" color="default" value={isChecked} onClick={() => {check()}} /><span style={{fontSize: 'small'}}>추천 종목</span>
          {!isChecked && <div key={isChecked}>
            <div className="market">
              <div>Market</div>
              <span>
                <ButtonGroup style={{height:'1.5rem'}} color='inherit' key={currentMarket}>
                  {markets.map(m =>
                    <Button value={m} onClick={selectMarket} style={{backgroundColor: isSelected[m] ? 'lightgray':null}}>{m}</Button>
                  )}
                </ButtonGroup>
              </span>
            </div>
            <div className="sector">
              <div>Sector</div>
              {/* <span style={{marginTop: '10px', display: 'inline', width:'300px'}}> */}
              {/* <Box sx={{display:'flex', flexDirection: 'column'}}  key={selectedSector}>
                {selectedSector.map(ss => {
                  return (
                    <ButtonGroup style={{height:'1.5rem'}} color='inherit'>
                      {ss.map(s =>
                        <Button value={s} onClick={selectSector} style={{backgroundColor: isSelected[s] ? 'lightgray':null}}>{s}</Button>
                      )}
                    </ButtonGroup>
                  )}
                )}
              </Box> */}
                {/* <div style={{marginTop: '10px', display: 'inline', width:'300px'}}> */}

                <Box sx={{display:'flex', flexDirection: 'column', fontSize: 'middle'}} key={sectorClicked}>
                  <ButtonGroup style={{height:'1.5rem', width: '1200px'}} color='inherit'>
                    {selectedSector.slice(0,5).map(ss =>
                      ss.map((s, value) => <Button value={value} onClick={selectSector} style={{backgroundColor: sectorClicked[value] ? 'lightgray':null}}>{s}</Button>)
                    )}
                  </ButtonGroup>
                  <ButtonGroup style={{height:'1.5rem', width: '1200px'}} color='inherit'>
                    {selectedSector.slice(5,10).map(ss =>
                      ss.map((s, value) => <Button value={value+6} onClick={selectSector} style={{backgroundColor: sectorClicked[value+6] ? 'lightgray':null}}>{s}</Button>)
                    )}
                  </ButtonGroup>
                </Box>
              {/* </span>  */}
            </div>

          </div>}
        </div>
        <div>
          <button onClick={onClick}>save</button>
        </div>
      </div>
      <div className="portfolio">
        <div className="title">Portfolio Information</div>
        <li key="1">종목:  { portfolio.stocks.map(i => { return i + ' ' }) }</li>
        <li key="2">유사 시점:  { portfolio.similarDate.map(i => {return i + ' '}) }</li>
        <Accordion style={{marginTop:'15px'}}>
          <AccordionSummary aria-controls="panel3d-content" id="panel3d-header">
            <span>Portfolio 1</span>
            <span style={{marginLeft: '20px'}}>예상 수익: 12%</span>
          </AccordionSummary>
          <AccordionDetails key={chartData}>
            <div style={{paddingBottom: '10px', width: '170px', display: 'inline-block'}} key={chartData}>
              <div className="title1">Stocks Weight</div>
              <Pie title={chartData.pie.title} data={chartData.pie.data[0]} />
            </div>
            <div className="backtest">
              <div className="title1">Backtest</div>
              <div className="chart" style={{width: '900px', margin: '0 auto'}}>
                <span style={{width: '450px', display:'inline-block'}}>
                  <MultiLine props={chartData.line} num='0'/>
                </span>
                <span style={{width: '450px', display:'inline-block'}}>
                  <MultiLine props={chartData.mdd} num='0'/>
                </span>
              </div>
            </div>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary aria-controls="panel3d-content" id="panel3d-header">
            <span>Portfolio 2</span>
            <span style={{marginLeft: '20px'}}>예상 수익: 10%</span>
          </AccordionSummary>
          <AccordionDetails key={chartData}>
            <div style={{paddingBottom: '10px', width: '170px', display: 'inline-block'}}>
              <div className="title1">Stocks Weight</div>
              <Pie title={chartData.pie.title} data={chartData.pie.data[1]} key={chartData} />
            </div>
            <div className="backtest">
              <div className="title1">Backtest</div>
              <div className="chart" style={{width: '900px', margin: '0 auto'}}>
                <span style={{width: '450px', display:'inline-block'}}>
                  <MultiLine props={chartData.line} num='1'/>
                </span>
                <span style={{width: '450px', display:'inline-block'}}>
                  <MultiLine props={chartData.mdd} num='1'/>
                </span>
              </div>
            </div>
          </AccordionDetails>
        </Accordion>
      </div>

  	</div>
  );
}

export default Portfolio;

/*
pie 차트 색

*/