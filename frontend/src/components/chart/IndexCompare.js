import React, { Fragment, useState, useEffect } from "react";
import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import Accessibility from "highcharts/modules/accessibility";
import Exporting from "highcharts/modules/exporting";

function IndexCompare(props) {
  
  Accessibility(Highcharts);
  Exporting(Highcharts);
  const [options, setOptions] = useState({
    rangeSelector: {
      selected: 1,
    },
    legend: {
      enabled: true,
    },
    navigator : {
      enabled : false
    },
    plotOptions: {
      series: {
          compare: 'percent',
          showInNavigator: true
      }
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
      let _data = [];
      for(let j = 0; j < props.data[i].length; j++){
        _data.push([Date.parse(props.data[i][j]['Date']), props.data[i][j]['Close']]);
      }
      data.push(_data);
    }
    setOptions({
      title: {
        text: props.title
      },
      series: [{
        data: data[0],
        name: props.name[0],
      }, {
        data: data[1],
        name: props.name[1],
      }
      ]
    });
  }, [props.title, props.data])
  
  return(
    <Fragment>
      <HighchartsReact highcharts={Highcharts} constructorType={"stockChart"} options={options} />
    </Fragment>
  );
}

export default IndexCompare;