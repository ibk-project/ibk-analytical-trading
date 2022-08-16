import React, { Fragment, useState, useEffect } from "react";
import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import Accessibility from "highcharts/modules/accessibility";
import Exporting from "highcharts/modules/exporting";

function ShortSingleLine(props) {
  Accessibility(Highcharts);
  Exporting(Highcharts);
  const [options, setOptions] = useState({
    rangeSelector: {
      selected: 1,
      buttons: [{
        type: 'day',
        count: 7,
        text: '1w',
        events: {
            click: function () {
            }
        }
      }, {
          type: 'day',
          count: 14,
          text: '2w'
      }, {
          type: 'month',
          count: 1,
          text: '1m'
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

export default ShortSingleLine;