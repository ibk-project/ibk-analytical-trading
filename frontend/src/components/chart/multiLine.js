import React, { Fragment, useState, useEffect } from "react";
import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import Accessibility from "highcharts/modules/accessibility";

function MultiLine(props) {
  Accessibility(Highcharts)
  
  const n = props.num
  //console.log(props.props.data[n].data)
  const propsData = props.props.data[n]//.data.map(p => {return parseFloat(parseFloat(p).toFixed(2))})
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
      categories: prop.xAxis.categories
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
    series: propsData
  }
  //console.log(props.props.data)
  const [options, setOptions] = useState(initialOptions)
  useEffect(()=>{
    setOptions({
      ...initialOptions,
      title: { text: props.props.title },
      series: props.props.data[props.num]
    })
  },[props.props.title, props.props.data])

  return (
    <Fragment>
      <HighchartsReact highcharts={Highcharts} onstructorType={"stockChart"} options={options} />
    </Fragment>
  )
}

export default MultiLine;