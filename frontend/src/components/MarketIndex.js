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
    if(data == undefined) return;
    const indexCode = data.Index_Code;
    const indexName = data.Index_Name;
    let _indexList = [];
    for(let i = 0; i < indexCode.length; i++){
      _indexList.push(
        <li
          key= {i}
          onClick={() => {handleIndexClick(indexCode[i], indexName[i])}}
          style={currIndex[1] == indexName[i] ? {background: 'rgba(0,0,0,0.2)'} : {}}
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
      setIndexAnalysis({
        '_3daysYield': ((data[data.length-1]['Close'] - data[data.length-4]['Close']) / data[data.length-4]['Close'] * 100).toFixed(2),
        '_3daysDate': data[data.length-4]['Date'],
        '_7daysYield': ((data[data.length-1]['Close'] - data[data.length-8]['Close']) / data[data.length-8]['Close'] * 100).toFixed(2),
        '_7daysDate': data[data.length-8]['Date'],
        '_15daysYield': ((data[data.length-1]['Close'] - data[data.length-16]['Close']) / data[data.length-16]['Close'] * 100).toFixed(2),
        '_15daysDate': data[data.length-16]['Date'],
        '_30daysYield': ((data[data.length-1]['Close'] - data[data.length-31]['Close']) / data[data.length-31]['Close'] * 100).toFixed(2),
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
  
  return(
    <div className="market-index-container">
      <div className="market-title">Index</div>
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
          test
        </div>
        <div>
          test2
        </div>
        <div>
          <div>Yield</div>
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