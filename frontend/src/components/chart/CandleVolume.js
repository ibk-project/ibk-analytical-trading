import React, { Fragment, useState, useEffect } from "react";
import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import Accessibility from "highcharts/modules/accessibility";
import Exporting from "highcharts/modules/exporting";

function CandleVolume(props) {
  Accessibility(Highcharts);
  Exporting(Highcharts);
  const [options, setOptions] = useState({
  rangeSelector: {
    selected: 1
  },
  yAxis: [{
    labels: {
      align: 'right',
      x: -3
    },
    title: {
      text: 'OHLC'
    },
    height: '60%',
    lineWidth: 2,
    resize: {
      enabled: true
    }
  }, {
    labels: {
      align: 'right',
      x: -3
    },
    title: {
      text: 'Volume'
    },
    top: '65%',
    height: '35%',
    offset: 0,
    lineWidth: 2
  }],
  tooltip: {
    split: true
  },
  plotOptions: {
    candlestick: {
        color: '#0088FF',
        upColor: '#FF0000'
    }
  },
  series: [{
    type: 'candlestick',
  }, {
    type: 'column',
    name: 'Volume',
    yAxis: 1,
  }]
  });
  useEffect(() => {
    let ohlc = [];
    let volume = [];
    const groupingUnits = [[
      'day',             // unit name
      [1]               // allowed multiples
    ], [
      'month',
      [1, 2, 3, 4, 6]
    ]];
    for (let i = 0; i < props.data.length; i += 1) {
      ohlc.push([
        Date.parse(props.data[i]['Date']), // the date
        props.data[i]['Open'], // open
        props.data[i]['High'], // high
        props.data[i]['Low'], // low
        props.data[i]['Close'] // close
      ]);
      volume.push([
        Date.parse(props.data[i]['Date']), // the date
        props.data[i]['Volume'] // the volume
      ]);
    }
    setOptions({
      chart: {
        height: '50%'
      },
      series: [{
        name: props.title,
        data: ohlc,
        dataGrouping: {
          units: groupingUnits
        }
      }, {
        data: volume,
        yAxis: 1,
        dataGrouping: {
          units: groupingUnits
        }
      }]
    });
  }, [props.title, props.data])

  return(
  <Fragment>
    <HighchartsReact highcharts={Highcharts} constructorType={"stockChart"} options={options} />
  </Fragment>
  );
}

export default CandleVolume;