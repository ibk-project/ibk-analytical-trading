import { VictoryChart, VictoryAxis, VictoryCandlestick, VictoryBar } from 'victory';

function LineVolume(props) {
  let volumes = [];
  for(let i = 0; i < props.data.length; i++)
    volumes.push({x: i, y: props.data[i].volume});
  console.log(volumes)
  return(
    <div>
      <VictoryChart domainPadding={{ x: 30 }} width={400} height={300}>
        <VictoryAxis standalone={false} />
        <VictoryCandlestick
          candleRatio={0.8}
          candleColors={{ positive: "#5f5c5b", negative: "#c43a31" }}
          data={props.data}
        />
        <VictoryAxis
          dependentAxis
          domain={[0, 6]}
          offsetX={0}
          orientation="left"
          standalone={false}
        />
        <VictoryAxis
          dependentAxis
          offsetX={0}
          domain={[0, 6]}
          orientation="right"
          standalone={false}
        />
        
        <VictoryBar
          style={{
            data: { fill: "#c43a31" }
          }}
          data={volumes}
        />
      </VictoryChart>
    </div>
  );
}

export default LineVolume;