import React, { Fragment, useState, useEffect } from "react";
import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import Accessibility from "highcharts/modules/accessibility";
import Exporting from "highcharts/modules/exporting";

function SingleLine(props) {
  Accessibility(Highcharts);
  Exporting(Highcharts);
  const [options, setOptions] = useState({
    rangeSelector: {
      selected: 1,
      buttons: [{
        type: 'month',
        count: 1,
        text: '1m',
        events: {
            click: function () {
            }
        }
      }, {
          type: 'month',
          count: 3,
          text: '3m'
      }, {
          type: 'month',
          count: 6,
          text: '6m'
      }, {
          type: 'ytd',
          text: 'YTD'
      }, {
          type: 'year',
          count: 1,
          text: '1y'
      }, {
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
        name: props.title,
        data: data
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