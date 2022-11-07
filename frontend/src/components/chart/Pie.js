import { Fragment, useState, useEffect } from 'react';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import Accessibility from "highcharts/modules/accessibility";

function Pie(props) {
  Accessibility(Highcharts);
  const initialOptions = {
    chart : { type : "pie", height: "200px"},
    credits: { enabled: false },
    legend: { 
      align: 'right',
      verticalAlign: 'top' 
    },
    plotOptions: {
    	pie: {
        allowPointSelect: true,//차트 데이터 선택 유무 옵션.
        dataLabels: {
          enabled: false
        },
        showInLegend: true,
        size: '100%',
     }
    },
    series : [{
      name: 'weight',
      data: props.data
    }]
  }
  const [ options, setOptions ] = useState(initialOptions)

  useEffect(()=>{
    setOptions({
      ...initialOptions,
      title: { text : '' },
      series : [{
        data: props.data
      }]
    })
  },[props.data])

  return (
    <Fragment>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </Fragment>
  )
}
export default Pie;