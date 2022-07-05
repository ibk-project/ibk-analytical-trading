import { VictoryChart, VictoryLine, VictoryTheme } from 'victory';

function Line(props) {
  return(
    <div style={{"minWidth":"400px", "minHeight":"30vh"}}>
      <VictoryChart
        theme= {VictoryTheme.material}
        style={{
          background: {
            fill: "white"
          }
        }}
      >
        <VictoryLine
          style={{
            data: { stroke: "#c43a31" },
            parent: { border: "1px solid #ccc"}
          }}
          data={ props.data }
          animate={{
            duration: 2000,
            onLoad: { duration: 1000 }
          }}
          size={5}
          categories={{ x: props.category }}
        />
      </VictoryChart>
    </div>
  );
}
  
export default Line;