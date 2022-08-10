import React, { useState, useEffect, useRef } from "react";
import './css/Market.css';
import SingleLine from './chart/SingleLine';
import CandleVolume from './chart/CandleVolume';
import axios from 'axios';

function Market() {
  const [indexNameList, setIndexNameList] = useState([]);
  const [indexList, setIndexList] = useState([]);
  const [indexData, setIndexData] = useState([]);
  const [indexAnalysis, setIndexAnalysis] = useState({});
  const [currIndex, setCurrIndex] = useState(['KS11', 'KOSPI']);
  const [sectorNameList, setSectorNameList] = useState([]);
  const [sectorList, setSectorList] = useState([]);
  const [currSector, setCurrSector] = useState('반도체와반도체장비');
  const [currSectorStockList, setCurrSectorStockList] = useState([]);
  const [sectorData, setSectorData] = useState([]);
  
  const handleIndexClick = (indexCode, indexName) => {
    setCurrIndex([indexCode, indexName]);
  }

  const handleSectorClick = (sectorName) => {
    setCurrSector(sectorName);
  }

  const makeIndexList = (data) => {
    if(data.length == 0) return;
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

  const makeSectorList = (data) => {
    if(data.length == 0) return;
    console.log(data);
    let currSectorIdx;
    let _sectorList = [];
    for(let i = 0; i < data.length; i++){
      if(currSector == data[i].sector_name) currSectorIdx = i;
      _sectorList.push(
        <div
          className="market-sector-item"
          onClick={() => {handleSectorClick(data[i].sector_name)}}
          style={currSector == data[i].sector_name ? {background: 'rgba(0,0,0,0.2)'} : {}}
        >
          {data[i].sector_name}
        </div>
      )
    }
    setSectorList(_sectorList);
    const currSectorStock = data[currSectorIdx].sector_stocks;
    let _currSectorStockList = [];
    for(let i = 0; i < currSectorStock.length; i++){
      _currSectorStockList.push([currSectorStock[i].code, currSectorStock[i].name])
    }
    setCurrSectorStockList(_currSectorStockList);
  }

  useEffect(() => {
    const getIndexList = async() => {
      await axios.get('/api/data-management/index/name-list')
      .then(res => {setIndexNameList(res.data); makeIndexList(res.data);})
    }
    const getSectorList = async() => {
      await axios.get('/api/data-management/stock/sector-list')
      .then(res => {setSectorNameList(res.data.data); makeSectorList(res.data.data);console.log(res.data.data)})
    }
    getIndexList();
    getSectorList();
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
    makeIndexList(indexNameList);
    getIndex();
  }, [currIndex])

  useEffect(() => {
    const getSector = async() => {
      
    }
    getSector();
    makeSectorList(sectorNameList);

  }, [currSector])
  
  return (
    <div>
      <div className="market-container">
        <div className="market-index-container">
          <div className="market-title">Index</div>
          <div className="market-index-chart">
            <div style={{width: '100%'}}>
              <SingleLine title={currIndex[1]} data={indexData} style={{width: '100%'}} />
            </div>
            <ul>
              {indexList}
            </ul>
          </div>
          <div className="market-title2">Analysis</div>
          <div className="market-index-analysis">
            <div>
              <div>Yield</div>
              <ul>
                <li>
                  <span>3days: </span>
                  <span style={indexAnalysis._3daysYield > 0 ? {color:'red'} : {color: 'blue'}}>{indexAnalysis._3daysYield}% </span>
                  <span>{indexAnalysis._3daysDate}~</span>
                </li>
                <li>
                  <span>7days: </span>
                  <span style={indexAnalysis._7daysYield > 0 ? {color:'red'} : {color: 'blue'}}>{indexAnalysis._7daysYield}% </span>
                  <span>{indexAnalysis._7daysDate}~</span>
                </li>
                <li>
                  <span>15days: </span>
                  <span style={indexAnalysis._15daysYield > 0 ? {color:'red'} : {color: 'blue'}}>{indexAnalysis._15daysYield}% </span>
                  <span>{indexAnalysis._15daysDate}~</span>
                </li>
                <li>
                  <span>30days: </span>
                  <span style={indexAnalysis._30daysYield > 0 ? {color:'red'} : {color: 'blue'}}>{indexAnalysis._30daysYield}% </span>
                  <span>{indexAnalysis._30daysDate}~</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="market-sector-container">
          <div className="market-title">Sector</div>
          <div className="market-sector-list">
            {sectorList}
          </div>
          <div className="market-title2">{currSector}</div>
          <div>주식 목록</div>
          <div>
            {currSectorStockList}
          </div>
          <div className="market-sector-chart">
            <CandleVolume title={currIndex[1]} data={indexData} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Market;