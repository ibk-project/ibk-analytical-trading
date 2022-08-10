import React, { useState, useEffect } from "react";
import './css/MarketSector.css';
import SingleLine from './chart/SingleLine';
import CandleVolume from './chart/CandleVolume';

import axios from 'axios';

function MarketSector(props) {
  const [sectorNameList, setSectorNameList] = useState(undefined);
  const [sectorList, setSectorList] = useState([]);
  const [currSector, setCurrSector] = useState([0, '반도체와반도체장비']);
  const [currSectorStockList, setCurrSectorStockList] = useState([]);
  const [sectorStockData, setSectorStockData] = useState(undefined);
  const [sectorIndex, setSectorIndex] = useState([]);
  const [currStock, setCurrStock] = useState(undefined);
  const [stockCandleData, setStockCandleData] = useState([]);

  const makeSectorList = (data) => {
    if(data == undefined) return;
    let _sectorList = [];
    for(let i = 0; i < data.length; i++){
      _sectorList.push(
        <li
          key={i}
          className="market-sector-item"
          onClick={() => {setCurrSector([i, data[i].sector_name]); setCurrStock(undefined);}}
          style={currSector[1] === data[i].sector_name ? {background: 'rgba(0,0,0,0.2)'} : {}}
        >
          {data[i].sector_name}
        </li>
      )
    }
    setSectorList(_sectorList);
  }
    
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

  useEffect(() => {
    const getSectorList = async() => {
      await axios.get('/api/data-management/stock/sector-list')
      .then(res => {
        setSectorNameList(res.data.data);
        makeSectorList(res.data.data);
        makeCurrSectorStockList(res.data.data);
      })
    }
    getSectorList();
  }, [])

  useEffect(() => {
    const makeSectorIndex = (data) => {
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
      let _sectorIndex = [];
      for(let [key, value] of Object.entries(dict)){
        _sectorIndex.push({
          Date: key, 
          Close: value.sum / value.cnt
        });
      }
      setSectorIndex(_sectorIndex);
    }
    const getSector = async() => {
      await axios.get('/api/data-management/stock/sector-stock', {
        params: {
          "sector_name": currSector[1],
          "start_date": "2020-01-01",
          "end_date": "2022-08-09"
        }
      }).then(res => {setSectorStockData(res.data.data); makeSectorIndex(res.data.data);})
    }
    getSector();
    makeSectorList(sectorNameList);
    makeCurrSectorStockList(sectorNameList);
    if(sectorNameList !== undefined){
      setCurrStock([0, sectorNameList[currSector[0]].sector_stocks[0].name]);
    }
  }, [currSector])

  useEffect(() => {
    if(sectorNameList === undefined || currSector === undefined) return;
    setCurrStock([0, sectorNameList[currSector[0]].sector_stocks[0].name]);
  }, [sectorNameList])

  useEffect(() => {
    makeCurrSectorStockList(sectorNameList);
  }, [currStock])

  useEffect(() => {
    if(sectorStockData == undefined || currStock === undefined) return;
    setStockCandleData(sectorStockData[currStock[0]].stock_data);
  }, [sectorStockData, currStock])

  return(
    <div className="market-sector-container">
      <div className="market-title">Sector</div>
      <ul className="market-sector-list">
        {sectorList}
      </ul>
      <div className="market-title2">{currSector[1]}</div>
      <SingleLine title={currSector[1] + "지수"} data={sectorIndex}></SingleLine>
      <div className="market-stock-chart">
        <div style={{width: '100%', height: '100%'}}>
          {currStock !== undefined ? <CandleVolume title={currStock[1]} data={stockCandleData} /> : ''}
        </div>
        <ul>
          {currSectorStockList}
        </ul>
      </div>
    </div>
  );
}

export default MarketSector;