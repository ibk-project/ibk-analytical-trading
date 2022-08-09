import React, { Fragment, useState, useEffect } from "react";
import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import Accessibility from "highcharts/modules/accessibility";

function SingleLine(props) {
  Accessibility(Highcharts);
  const [options, setOptions] = useState({
    
    rangeSelector: {
      selected: 1
    },
    navigator : {
      enabled : false
    },
    series: [{
      name: props.title,
      data: [],
      tooltip: {
        valueDecimals: 2
      },
    }]
  });
  useEffect(() => {
    let data = [];
    for(let i = 0; i < props.data.length; i++) {
        data.push([Date.parse(props.data[i]['Date']), props.data[i]['Close']]);
    }
    setOptions({
      title: {
        text: props.title
      },
      series: [{
        data: data,
      }]
    });
  }, [props.title, props.data])
  
  return(
    <Fragment>
      <HighchartsReact highcharts={Highcharts} constructorType={"stockChart"} options={options} />
    </Fragment>
  );
}

export default SingleLine;