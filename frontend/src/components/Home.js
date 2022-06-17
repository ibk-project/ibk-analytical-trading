import './css/Home.css';
import Line from './chart/Line.js';

function Home() {
  const data = [
    { x: 1, y: 2 },
    { x: 2, y: 3 },
    { x: 3, y: 5 },
    { x: 4, y: 4 },
    { x: 5, y: 7 }
  ]
  const category = ["one", "two", "three", "four", "five"]
  return(
    <div>
      <div className="home-summary">
        Home
        <Line data={data} category={category}/>
      </div>
    </div>
  );
}

export default Home;