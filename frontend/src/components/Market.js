import React, { useState, useEffect, useRef } from "react";
import './css/Market.css';
import SingleLine from './chart/SingleLine';
import CandleVolume from './chart/CandleVolume';
import axios from 'axios';

function Market() {
  const [indexList, setIndexList] = useState([]);
  const [indexData, setIndexData] = useState([]);
  const [currIndex, setCurrIndex] = useState(['KS11', 'KOSPI']);
  useEffect(() => {
    const handleIndexClick = (indexCode, indexName) => {

      setCurrIndex([indexCode, indexName]);
    }
    const makeIndexList = (data) => {
      const indexCode = data.Index_Code;
      const indexName = data.Index_Name;
      let indexList_ = [];
      console.log(currIndex);
      for(let i = 0; i < indexCode.length; i++){
        indexList_.push(
          <li
            key= {i}
            onClick={() => {handleIndexClick(indexCode[i], indexName[i])}}
            style={{cursor:"pointer"}}>{indexName[i]}
          </li>
        );
      }
      setIndexList(indexList_);
    }
    const getIndexList = async() => {
      await axios.get('/api/data-management/index/name-list')
      .then(res => {makeIndexList(res.data)})
    }
    getIndexList();
  }, [])

  useEffect(() => {
    const getIndex = async() => {
      await axios.get('/api/data-management/index/get', {
        params: {
          "code": currIndex[0],
          "date": "2020-01-06",
          "type": "candle"
        }
      }).then(res => {setIndexData(res.data.data)});
    }
    getIndex();
  }, [currIndex])
  
  return (
    <div>
      <div className="market-container">
        <div>Index</div>
        <div className="market-index-container">
          <div style={{width: '100%'}}>
            <SingleLine title={currIndex[1]} data={indexData} style={{width: '100%'}} />
          </div>
          <ul>
            {indexList}
          </ul>
        </div>
        <div className="market-sector-container">
          <CandleVolume title={currIndex[1]} data={indexData} />
        </div>
      </div>
    </div>
  );
}

export default Market;