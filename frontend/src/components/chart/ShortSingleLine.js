import React, { Fragment, useState, useEffect } from "react";
import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import Accessibility from "highcharts/modules/accessibility";
import Exporting from "highcharts/modules/exporting";
import axios from 'axios';
import { alignProperty } from "@mui/material/styles/cssUtils";

function ShortSingleLine(props) {
  Accessibility(Highcharts);
  Exporting(Highcharts);
  const [adjustedCov, setAdjustedCov] = useState(0);
  const [similarityDistance, setSimilarityDistance] = useState("loading...");
  const [options, setOptions] = useState({
    rangeSelector: {
      selected: 1,
      buttons: [{
          type: 'all',
          text: 'All'
      }]
    },
    navigator : {
      enabled : false
    },
    series: [{
      data: [],
      tooltip: {
        valueDecimals: 2
      },
    }],
    chart: {
      height: (props.place==="left"?(9 / 16 * 100):(9 / 20 * 100)) + '%' // 16:9 ratio
    }
  });

  // const getSimilarityDistance = async(period1, period2) => {
  //   await axios.get('/api/data-management/model/distance', {
  //     params: {
  //       "period1": period1,
  //       "period2": period2,
  //     }
  //   }).then(res => {
  //     console.log("distance result is ", res);
  //     setSimilarityDistance(res);
  //   });
  // }

  const getSimilarityDistance = async(period1, period2) => {
    await axios.post('/api/data-management/model/distance', 
    {
      period1: period1,
      period2: period2,
    }
    ).then(res => {
      console.log("distance result is ", res);
      setSimilarityDistance(res);
    });
  }

  useEffect(() => {
    let data = [];
    // let closeOnly = [];

    if(props.data.length !== undefined){
      for(let i = 0; i < props.data.length; i++) {
        data.push([Date.parse(props.data[i]['Date']), props.data[i]['Close']]);
        // closeOnly.push(props.data[i]['Close']);
      }
    }

    (props.place==="left"?(
      setOptions({
        title: {
          text: props.title
        },
        series: [{
          name: props.title,
          data: data
        }]
      })
    ):(
      setOptions({
        series: [{
          name: props.title,
          data: data
        }]
      })
    ))

    // 과거시점과 현재시점의 유사도 계산, calculating the similarity of past date and now: Correlation-adjusted Distance 방법
    // if(props.currentData !== undefined && props.data !== undefined && props.getDistance === 1) {
    //   console.log("data in graph is ", props.data);
    //   console.log("data length is ", props.data.length, " and current data length is ", props.currentData.length);

    //   getSimilarityDistance(props.data, props.currentData);
    //   props.setGetDistance(0);
    // }
  }, [props.title, props.data])

  
  return(
    <Fragment>
      <HighchartsReact highcharts={Highcharts} constructorType={"stockChart"} options={options} />
      {/* <div>Adjusted Covariance is {adjustedCov}, Distance score is {similarityDistance}</div> */}
      {/* {(props.currentData?(
        <div>Distance score is {similarityDistance}</div>
      ):(
        <></>
      ))} */}
    </Fragment>
  );
}

export default ShortSingleLine;