import { VictoryChart, VictoryLine, VictoryTheme } from 'victory';

function Line(props) {
  return(
    <div>
      <VictoryChart
        theme={VictoryTheme.material}
        style={{
          parent: {
            height: 500,
            width: 500,
            border: "1px solid",
          },
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