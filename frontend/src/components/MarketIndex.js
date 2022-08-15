import React, { useState, useEffect } from "react";
import './css/MarketIndex.css';
import SingleLine from './chart/SingleLine';
import axios from 'axios';

function MarketIndex(props) {
  const [indexNameList, setIndexNameList] = useState(undefined);
  const [indexList, setIndexList] = useState([]);
  const [indexData, setIndexData] = useState([]);
  const [indexAnalysis, setIndexAnalysis] = useState({});
  const [currIndex, setCurrIndex] = useState(['KS11', 'KOSPI']);

  const handleIndexClick = (indexCode, indexName) => {
    setCurrIndex([indexCode, indexName]);
  }

  const makeIndexList = (data) => {
    if(data === undefined) return;
    const indexCode = data.Index_Code;
    const indexName = data.Index_Name;
    let _indexList = [];
    for(let i = 0; i < indexCode.length; i++){
      _indexList.push(
        <li
          key= {i}
          onClick={() => {handleIndexClick(indexCode[i], indexName[i])}}
          style={currIndex[1] === indexName[i] ? {background: 'rgba(0,0,0,0.2)'} : {}}
        >
          {indexName[i]}
        </li>
      );
    }
    setIndexList(_indexList);
  }

  useEffect(() => {
    const getIndexList = async() => {
      await axios.get('/api/data-management/index/name-list')
      .then(res => {setIndexNameList(res.data); makeIndexList(res.data);})
    }
    getIndexList();
  }, [])

  useEffect(() => {
    const makeIndexAnalysis = (data) => {
      let _5MA = 0, _20MA = 0, _60MA = 0, _120MA = 0;
      for(let i = data.length - 120; i < data.length; i++) {
        if(data.length - i <= 5) _5MA += data[i]['Close'];
        if(data.length - i <= 20) _20MA += data[i]['Close'];
        if(data.length - i <= 60) _60MA += data[i]['Close'];
        if(data.length - i <= 120) _120MA += data[i]['Close'];
      }
      _5MA /= 5;
      _20MA /= 20;
      _60MA /= 60;
      _120MA /= 120;
      const currStock = data[data.length-1]['Close'];
      setIndexAnalysis({
        'stock5MADiff': (currStock - _5MA) / _5MA * 100,
        'stock20MADiff': (currStock - _20MA) / _20MA * 100,
        'stock60MADiff': (currStock - _60MA) / _60MA * 100,
        'stock120MADiff': (currStock - _120MA) / _120MA * 100,
        '_3daysYield': ((currStock - data[data.length-4]['Close']) / data[data.length-4]['Close'] * 100).toFixed(2),
        '_3daysDate': data[data.length-4]['Date'],
        '_7daysYield': ((currStock - data[data.length-8]['Close']) / data[data.length-8]['Close'] * 100).toFixed(2),
        '_7daysDate': data[data.length-8]['Date'],
        '_15daysYield': ((currStock - data[data.length-16]['Close']) / data[data.length-16]['Close'] * 100).toFixed(2),
        '_15daysDate': data[data.length-16]['Date'],
        '_30daysYield': ((currStock - data[data.length-31]['Close']) / data[data.length-31]['Close'] * 100).toFixed(2),
        '_30daysDate': data[data.length-31]['Date'],
      });
    }
    const getIndex = async() => {
      await axios.get('/api/data-management/index/get', {
        params: {
          "code": currIndex[0],
          "date": "2020-01-06",
          "type": "candle"
        }
      }).then(res => {setIndexData(res.data.data); makeIndexAnalysis(res.data.data);});
    }
    getIndex();
    makeIndexList(indexNameList);
  }, [currIndex])

  const makeTrend = (data) => {
    if(data > 1) {
      return <span style={{color: 'red'}}>uptrend</span>;
    }else if(data < -1) {
      return <span style={{color: 'blue'}}>downtrend</span>;
    }else {
      return <span style={{color: 'gray'}}>no change</span>;
    }
  }
  
  return(
    <div className="market-index-container">
      <h2>Index</h2>
      <div className="market-index-chart">
        <div style={{width: '100%'}}>
          <SingleLine title={currIndex[1]} data={indexData} />
        </div>
        <ul>
          {indexList}
        </ul>
      </div>
      <div className="market-title2">Analysis</div>
      <div className="market-index-analysis">
        <div>
          <span>Momentum</span>
          <ul>
            <li key='stock-5MA'>
              5MA: {makeTrend(indexAnalysis.stock5MADiff)}
            </li>
            <li key='stock-20MA'>
              20MA: {makeTrend(indexAnalysis.stock20MADiff)}
            </li>
            <li key='stock-60MA'>
              60MA: {makeTrend(indexAnalysis.stock60MADiff)}
            </li>
            <li key='stock-120MA'>
              120MA: {makeTrend(indexAnalysis.stock120MADiff)}
            </li>
          </ul>
        </div>
        <div>
          <span>Yield</span>
          <ul>
            <li key='3days'>
              <span>3days: </span>
              <span style={indexAnalysis._3daysYield > 0 ? {color:'red'} : {color: 'blue'}}>{indexAnalysis._3daysYield}% </span>
              <span>{indexAnalysis._3daysDate}~</span>
            </li>
            <li key='7days'>
              <span>7days: </span>
              <span style={indexAnalysis._7daysYield > 0 ? {color:'red'} : {color: 'blue'}}>{indexAnalysis._7daysYield}% </span>
              <span>{indexAnalysis._7daysDate}~</span>
            </li>
            <li key='15days'>
              <span>15days: </span>
              <span style={indexAnalysis._15daysYield > 0 ? {color:'red'} : {color: 'blue'}}>{indexAnalysis._15daysYield}% </span>
              <span>{indexAnalysis._15daysDate}~</span>
            </li>
            <li key='30days'>
              <span>30days: </span>
              <span style={indexAnalysis._30daysYield > 0 ? {color:'red'} : {color: 'blue'}}>{indexAnalysis._30daysYield}% </span>
              <span>{indexAnalysis._30daysDate}~</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default MarketIndex;