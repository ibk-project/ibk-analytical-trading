import './css/Home.css';

function Home() {
  return(
    <div className="home-container">
      <img alt="IBKAT" style={{"width": "800px", "height":"600px"}} src="/IBKAT.png"></img>
      <h1 className="home-title">Market</h1>
      <p className="home-description">
        Market은 증시에 대한 간단한 요약을 시각화하여 보여줍니다.
      </p>
      <h1 className="home-title">EDA</h1>  
      <p className="home-description">
        
      </p>
      <h1 className="home-title">Portfolio</h1>
      <p className="home-description">
        
      </p>
    </div>
  );
}

export default Home;