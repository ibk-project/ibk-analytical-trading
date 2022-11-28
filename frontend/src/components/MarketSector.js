import React, { useState, useEffect, useRef } from "react";
import './css/MarketSector.css';
import SingleLine from './chart/SingleLine';
import CandleVolume from './chart/CandleVolume';
import IndexCompare from "./chart/IndexCompare";
import DatePicker from 'react-date-picker';

import axios from 'axios';

function MarketSector(props) {
  const [sectorNameData, setSectorNameData] = useState(undefined);
  const [sectorList, setSectorList] = useState([]);
  const [currSector, setCurrSector] = useState([0, '']);
  const [currSectorStockList, setCurrSectorStockList] = useState([]);
  const [sectorStockData, setSectorStockData] = useState(undefined);
  const [sectorIndex, setSectorIndex] = useState([]);
  const [currStock, setCurrStock] = useState(['', '']);
  const [stockCandleData, setStockCandleData] = useState(undefined);
  const [analysisBenchmark, setAnalysisBenchmark] = useState([]);
  const [analysisStocks, setAnalysisStocks] = useState([]);

  const isMounted = useRef(false);
    
  const makeCurrSectorStockList = (data) => {
    if(data === undefined || currStock === undefined) return;
    const currSectorStock = data[currSector[0]].sector_stocks;
    let _currSectorStockList = [];
    for(let i = 0; i < currSectorStock.length; i++){
      _currSectorStockList.push(
      <li
        key={i}
        onClick={() => {setCurrStock([i, currSectorStock[i].name]);}}
        style={currStock[1] === currSectorStock[i].name ? {background: 'rgba(0,0,0,0.2)'} : {}}
      >
        {currSectorStock[i].name}
      </li>
      );
    }
    setCurrSectorStockList(_currSectorStockList);
  }

  const makeIndex = (data) => {
    let dict = {};
    for(let i = 0; i < data.length; i++){
      const stock_data = data[i].stock_data;
      for(let j = 0; j < stock_data.length; j++){
        if(!(stock_data[j].Date in dict)){
          dict[stock_data[j].Date] = {
            "sum": 0,
            "cnt": 0
          };
        }
        dict[stock_data[j].Date].sum += (stock_data[j].Close / stock_data[0].Close) * 100;
        dict[stock_data[j].Date].cnt += 1;
      }
    }
    let newIndex = [];
    for(let [key, value] of Object.entries(dict)){
      newIndex.push({
        Date: key, 
        Close: value.sum / value.cnt
      });
    }
    return newIndex;
  }

  useEffect(() => {
    const getSectorList = async() => {
      await axios.get('/api/data-management/stock/sector-list')
      .then(res => {
        setSectorNameData(res.data.data);
        setCurrSector([0, res.data.data[0].sector_name]);
      })
    }
    getSectorList();
    setTimeout(() => {
      isMounted.current = true;
    });
  }, [])

  useEffect(() => {
    if(!isMounted.current) return;
    const makeSectorList = (data) => {
      let _sectorList = [];
      for(let i = 0; i < data.length; i++){
        _sectorList.push(
          <li
            key={i}
            className="market-sector-item"
            onClick={() => {setCurrSector([i, data[i].sector_name]);}}
            style={currSector[1] === data[i].sector_name ? {background: 'rgba(0,0,0,0.2)'} : {}}
          >
            {data[i].sector_name}
          </li>
        )
      }
      setSectorList(_sectorList);
    }
    const getSector = async() => {
      await axios.get('/api/data-management/stock/sector-stock', {
        params: {
          "sector_name": currSector[1],
          "start_date": "2020-01-01",
          "end_date": "2022-11-26"
        }
      }).then(res => {
        setSectorStockData(res.data.data);
        setSectorIndex(makeIndex(res.data.data));
      })
    }
    getSector();
    makeSectorList(sectorNameData);
    makeCurrSectorStockList(sectorNameData);
    setCurrStock([0, sectorNameData[currSector[0]].sector_stocks[0].name]);
  }, [currSector])

  useEffect(() => {
    if(!isMounted.current) return;
    setCurrStock([0, sectorNameData[currSector[0]].sector_stocks[0].name]);
  }, [sectorNameData])

  useEffect(() => {
    if(!isMounted.current) return;
    makeCurrSectorStockList(sectorNameData);
  }, [currStock])

  useEffect(() => {
    if(!isMounted.current || !sectorStockData) return;
    const makeStockData = () => {
      let stockName = [];
      let stockData = [];
      for(let i = 0; i < sectorStockData.length; i++){
        stockName.push(sectorStockData[i].name);
        stockData.push(sectorStockData[i].stock_data);
      }
      setAnalysisStocks([stockName, stockData]);
    }
    makeStockData();
  }, [sectorStockData])

  useEffect(() => {
    if(!isMounted.current || !sectorStockData || !currStock) return;
    setStockCandleData(sectorStockData[currStock[0]].stock_data);
  }, [sectorStockData, currStock])

  useEffect(() => {
    if(!isMounted.current) return;
    const getBenchmark = async() => {
      await axios.get('/api/data-management/index/get', {
        params: {
          "code": 'KS11',
          "date": "2020-01-01",
          "end_date": "2022-11-26",
          "type": "candle"
        }
      }).then(res => {
        setAnalysisBenchmark(res.data.data)
      })
    }
    getBenchmark();
  }, [currSector])

  return(
    <div className="market-sector-container">
      <h2>Sector</h2>
      <ul className="market-sector-list">
        {sectorList}
      </ul>
      <span className="market-title2">{currSector[1]}</span>
      <div className="market-stock-comparechart">
        {currSector[1] && sectorIndex && analysisBenchmark && analysisStocks[0] && analysisStocks[1] ?
          <IndexCompare
            name={[currSector[1], 'KOSPI'].concat(analysisStocks[0])}
            data={[sectorIndex, analysisBenchmark].concat(analysisStocks[1])}
          />
          : ''
        }
      </div>
      
      <div className="market-stock-candlechart">
        <div style={{width: '100%', height: '100%'}}>
          {currStock && stockCandleData ? <CandleVolume title={currStock[1]} data={stockCandleData} /> : ''}
        </div>
        <ul>
          {currSectorStockList}
        </ul>
      </div>
    </div>
  );
}

export default MarketSector;