import './css/Market.css';
import SingleLine from './chart/SingleLine';
import CandleVolume from './chart/CandleVolume';

function Market() {
  return (
    <div>
      <SingleLine></SingleLine>
      <CandleVolume></CandleVolume>
    </div>
  );
}

export default Market;