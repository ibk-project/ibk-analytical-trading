import { Fragment, useState, useEffect } from 'react';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import Accessibility from "highcharts/modules/accessibility";

function Pie(props) {
  Accessibility(Highcharts);
  const initialOptions = {
    title : { text : props.title },
    chart : { type : "pie" },
    series : [{
      name: 'weight',
      data: props.data
    }]
  }
  console.log(props.data)
  const [ options, setOptions ] = useState(initialOptions)

  useEffect(()=>{
    setOptions({
      ...initialOptions,
      title: { text : props.title },
      series : [{
        data: props.data
      }]
    })
  },[props.title, props.data])

  return (
    <Fragment>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </Fragment>
  )
}
export default Pie;