import { useState, useEffect, useRef } from 'react';
import './css/Portfolio.css';
import Pie from './chart/Pie';
import MultiLine from './chart/multiLine';
import SingleLine from './chart/SingleLine';
//import { chart } from 'highcharts';


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
    stocks: ['SM','JYP','빅히트','YG'],
    similarDate: '2019-05-06',
    weight: [0.2,0.1,0.3,0.4]    
  })
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
    title: 'MDD',
    xAxis: {
      title: 'Date',
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    },
    yAxis: {
      title: ''
    },

    data: [{
      name: 'MDD',
      data: [0.0, -3.6, -3.0, -2.5, 0, -0.1, -4.1, -3.6, -3.3, -2.8, -0.4, 0.0]
    },]
  }
  const [chartData, setChartOption] = useState({
    pie: pieData,
    line: lineData,
    mdd: mddData
  })
  const getPortfolio = () => {
    setPort(portfolio)
  }
  const onClick = (e) => {
    // 저장
    initUserOption = userOption
    setShowChart(!showChart)
    getPortfolio()
  }
  const onChange = (e) => {
    initUserOption = {
      ...userOption,
      [e.target.name]: e.target.value
    }
    setUserOption(initUserOption)
  }
  useEffect(()=>{
    setChartOption({
      pie: {
        ...chartData.pie,
        title: userOption.option1,
      },
      line: {
        ...chartData.line,
        title: userOption.option2
      },
      mdd: {
        ...chartData.mdd
      }
    })
  },[showChart])

  return(
    <div className="container">
      <div style={{gridColumn: '1/3'}}></div>
      <div className="option">
        <div className="title">User input</div>
        <div className="options">
          option
          <input
            type="text"
            name="option1"
            value={userOption.option1}
            onChange={onChange}
          />
        </div>
        <div className="options">
          option
          <input
            type="text"
            name="option2"
            value={userOption.option2}
            onChange={onChange}
          />
        </div>
        <div className="options">
          option
          <input
            type="text"
            name="option3"
            value={userOption.option3}
            onChange={onChange}
          />
        </div>
        <div>
          <button onClick={onClick}>save</button>
        </div>
      </div>
      <div className="backtest">
        <div className="title">Backtest</div>
        <div className='chart' style={{ width: '600px', margin: '0 auto' }}>
          <MultiLine props={chartData.line} />
          <MultiLine props={chartData.mdd} />
        </div>
      </div>
      <div className="portfolio">
        <div className="title">Portfolio Information</div>
        <li>종목:  { portfolio.stocks.map(i => { return i + ' ' }) }</li>
        <li>유사 시점:  { portfolio.similarDate }</li>
        <li>
          비중: 
          <div style={{ width: '400px', margin: '0 auto'}}>
            <Pie title={chartData.pie.title} data={chartData.pie.data} />
          </div>
        </li>
      </div>
  	</div>
  );
}

export default Portfolio;

/*
클러스터 관련 내용
wireframe 만들기
API랑 그런거 회의
*/