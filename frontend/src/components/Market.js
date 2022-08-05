import './css/Market.css';
import SingleLine from './chart/SingleLine';
import CandleVolume from './chart/CandleVolume';
import axios from 'axios';

function Market() {
  const data = axios.get('/api/data-management/index/get', {
    params: {
        "code": "KS11",
        "date": "2020-01-06",
        "type": "candle"   
    }
  });
  console.log(data);
  return (
  <div>
    <div className="market-container">
    <div>Index</div>
    <SingleLine data={data} />
    <CandleVolume />
    </div>
  </div>
  );
}

export default Market;