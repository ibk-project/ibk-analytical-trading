import { Fragment, useState, useEffect } from 'react';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import Accessibility from "highcharts/modules/accessibility";

function Pie({ title, data}) {
  Accessibility(Highcharts);
  const initialOptions = {
    title : { text : title },
    chart : { type : "pie" },
    series : [{
      name: 'weight',
      data: data
    }]
  }

  const [ options, setOptions ] = useState(initialOptions)

  useEffect(()=>{
    setOptions({
      ...initialOptions,
      title: { text : title },
      series : [{
        data: data
      }]
    })
  },[title, data])

  return (
    <Fragment>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </Fragment>
  )
}
export default Pie;