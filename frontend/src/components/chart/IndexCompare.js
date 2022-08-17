import React, { Fragment, useState, useEffect } from "react";
import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import Accessibility from "highcharts/modules/accessibility";
import Exporting from "highcharts/modules/exporting";

function IndexCompare(props) {
  Accessibility(Highcharts);
  Exporting(Highcharts);
  const [options, setOptions] = useState({
    chart: {
      height: 600,
  },
    rangeSelector: {
      selected: 1,
    },
    legend: {
      enabled: true,
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
    const _options = [];
    for(let i = 0; i < data.length; i++) {
      _options.push({
        data: data[i],
        name: props.name[i],
        visible: ((i < 2) ? true : false)
      });
    }
    setOptions({
      title: {
        text: props.title
      },
      series: _options
    });
  }, [props.title, props.data])
  
  return(
    <Fragment>
      <HighchartsReact highcharts={Highcharts} constructorType={"stockChart"} options={options} />
    </Fragment>
  );
}

export default IndexCompare;