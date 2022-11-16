import React, { Fragment, useState, useEffect } from "react";
import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import Accessibility from "highcharts/modules/accessibility";
import Exporting from "highcharts/modules/exporting";

function ShortSingleLine(props) {
  Accessibility(Highcharts);
  Exporting(Highcharts);
  const [distance, setDistance] = useState(0);
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

  useEffect(() => {
    let data = [];
    for(let i = 0; i < props.data.length; i++) {
        data.push([Date.parse(props.data[i]['Date']), props.data[i]['Close']]);
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
    if(props.currentData !== undefined) {
      console.log("data in graph is ", props.data);
      if(props.data.length>60 && props.currentData.length>60){ // 현재와 과거 모두 최근 60일 이상 데이터가 있을 경우
        let distance = 0; // 주가 distance
        let pastList = [], currentList = [];
        for(let i=1; i<=60; i++){
          let difference = props.data[0-i]['Close'] - props.currentData[0-i]['Close'];
          difference = difference * difference / 60;
          distance = distance + difference;
          pastList.append(props.data[0-i]['Close']);
          currentList.append(props.currentData[0-i]['Close']);
        }
        distance = Math.sqrt(distance / 60);
        let cov = require( 'compute-covariance' );
        let mat = cov(pastList, currentList);
        console.log("mat is ", mat);

        // mat이 [(cov)] 라고 가정 (ex. [2.5])
        let adjusted_cov = distance + 1-cov;
      }


      setDistance(adjusted_cov);
    }
  }, [props.title, props.data])

  
  return(
    <Fragment>
      <HighchartsReact highcharts={Highcharts} constructorType={"stockChart"} options={options} />
      <div>Adjusted Covariance is {adjusted_cov}</div>
    </Fragment>
  );
}

export default ShortSingleLine;