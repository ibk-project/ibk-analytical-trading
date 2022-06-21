import { VictoryChart, VictoryCandlestick } from 'victory';

function Candle(props) {
  return(
    <div
      style={{"minWidth":"400px", "minHeight":"30vh"}}
    >
      <VictoryChart
        height= {250}
        width= {300}
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
    </div>
  );
}

export default Candle;