import './css/Market.css';
import Line from './chart/Line';
import Candle from './chart/Candle';
import Bar from './chart/Bar';
import CandleVolume from './chart/CandleVolume';

function Market() {
  const data = [
    { x: 1, y: 2 },
    { x: 2, y: 3 },
    { x: 3, y: 5 },
    { x: 4, y: 4 },
    { x: 5, y: 7 }
  ];
  const category = ["one", "two", "three", "four", "five"];
  const DATA = [
    {x: new Date(2016, 6, 1), open: 5, close: 10, high: 15, low: 0, volume: 100},
    {x: new Date(2016, 6, 2), open: 10, close: 15, high: 20, low: 5, volume: 40},
    {x: new Date(2016, 6, 3), open: 15, close: 20, high: 22, low: 10, volume: 150},
    {x: new Date(2016, 6, 4), open: 20, close: 10, high: 25, low: 7, volume: 210},
    {x: new Date(2016, 6, 5), open: 10, close: 8, high: 15, low: 5, volume: 180}
  ];
  return (
    <div>
      <div className="market-summary">
        <Bar data={data}/>
        <Line data={data} category={category}/>
        <Line data={data} category={category}/>
        <Line data={data} category={category}/>
        <Line data={data} category={category}/>
        <Line data={data} category={category}/>
        <Line data={data} category={category}/>
        <Line data={data} category={category}/>
        <Line data={data} category={category}/>
        <Line data={data} category={category}/>

        <Candle data={DATA} />
        <Candle data={DATA} />
        <Candle data={DATA} />
        <Candle data={DATA} />
        <Candle data={DATA} />
        <Candle data={DATA} />
        <Candle data={DATA} />
        <Candle data={DATA} />
      </div>
      <CandleVolume data={DATA}></CandleVolume>
    </div>
  );
}

export default Market;