import { VictoryChart, VictoryBar, VictoryTheme } from 'victory';

function Bar(props) {
  return(
    <div
      style={{"minWidth":"200px", "minHeight":"30vh"}}
    >
      <VictoryChart
      theme={VictoryTheme.material}
      domainPadding={{ x: 30 }}
      >
        <VictoryBar
          barRatio={0.8}
          style={{
            data: { fill: "#c43a31" }
          }}
          data={props.data}
          animate={{
            duration: 2000,
            onLoad: { duration: 1000 }
          }}
        />
      </VictoryChart>
    </div>
  );
}
  
export default Bar;