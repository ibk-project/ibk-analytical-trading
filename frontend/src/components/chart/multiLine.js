import React, { Fragment, useState, useEffect } from "react";
import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import Accessibility from "highcharts/modules/accessibility";

function MultiLine(props) {
  Accessibility(Highcharts)
  console.log(props)
  const n = props.num
  const prop = props.props
  const initialOptions = {
    chart: {
      type: 'line'
    },
    title: {
      text: prop.title
    },
    // subtitle: {
    //   text: 'Source: ' +
    //     '<a href="https://en.wikipedia.org/wiki/List_of_cities_by_average_temperature" ' +
    //     'target="_blank">Wikipedia.com</a>'
    // },
    credits: { enabled: false },
    xAxis: {
      title: {
        text: prop.xAxis.title
      },
      categories: [...Array(props.props.data[props.num].data.length).keys()].map( x => x+1 ),
      plotLines: [{
        color: 'lightgray', // Red
        width: 2,
        value: 30 // set period
    }]
    },
    yAxis: {
      title: {
        text: prop.yAxis.title
      }
    },
    plotOptions: {
      line: {
        dataLabels: {
          enabled: true
        },
        enableMouseTracking: false
      }
    },
    series: props.props.data[props.num]
  }
  const [options, setOptions] = useState(initialOptions)
  useEffect(()=>{
    setOptions(()=>({
      ...initialOptions,
      title: { text: props.props.title },
      series: props.props.data[props.num]
    }))
  },[props.props.title, props.props.data])

  return (
    <Fragment>
      <HighchartsReact highcharts={Highcharts} onstructorType={"stockChart"} options={options} />
    </Fragment>
  )
}

export default MultiLine;