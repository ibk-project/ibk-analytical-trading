import { VictoryChart, VictoryCandlestick } from 'victory';

function Candle(props) {
  return(
    <VictoryChart
      domainPadding={{ x: 25 }}  
      minDomain={{ y: 0 }}
      scale={{ x: "time" }}
    >
      <VictoryCandlestick
        candleRatio={0.5}
        candleColors={{ positive: "#5f5c5b", negative: "#c43a31" }}
        data={props.data}
      />  
    </VictoryChart>
    
  );
}

export default Candle;