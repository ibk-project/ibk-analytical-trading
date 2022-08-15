import './css/Home.css';

function Home() {
  return(
    <div className="home-container">
      <h1>IBKAT</h1>
      <img alt="IBKAT" style={{"width": "400px", "height":"300px"}} src="/IBKAT.png"></img>
      <span>얘는 IBCAT</span>
      <h2>Introduction</h2>
      <p>
        IBKAT은 IBK Analytical Trading의 약자로 주식 시장에 영향을 미치는 데이터를 수집하고 분석하여 수익을 창출하는 분석 트레이딩 시스템입니다.<br />
        IBKAT은 2008 금융위기와 2020 코로나에서 비슷한 주식 시장의 움직임이 있었다는 것에서 아이디어를 얻었습니다.<br />
        비슷한 주식 시장 상황에서 비슷한 주가 변화가 나타날 것이라는 가정하에 현재와 가장 비슷한 과거 유사시점을 찾아 미래의 주가를 예측하는 "시장 유사성 기반 최적 투자전략 발굴 모델"을 개발하였습니다 <br />
      </p>
      <h2>Model</h2>
      <p>
        IBKAT의 시장 유사성 분석 시스템은 크게 두 개의 모델로 이루어져있습니다.<br />
        하나는 Market Clustering Model, 다른 하나는 Sector Clustering Model입니다.<br />
      </p>
      <h3>Market Clustering</h3>
      <p>
        주식의 가격은 기업의 가치와 성장 가능성에 따라 움직입니다.<br />
        하지만 기업만을 분석하는 모델은 유동성이 높고 이슈가 넘치는 시장에서는 살아남기 어렵습니다.<br />
        높은 가치와 발전을 보이는 기업들도 전쟁이나 대공황과 같은 상황에서는 시장의 상황에 따라 움직이기 때문입니다.<br />
        코로나를 겪었기에 우리는 우선적으로 시장 상황을 주목하였습니다.<br />
      </p>
      <h4>Used Data</h4>
      <div className="home-model-market-list">
        <div>
          <span>Index</span>
          <ul>
            <li>KOSPI</li>
            <li>KOSDAQ</li>
            <li>Dow Jones</li>
            <li>NASDAQ</li>
            <li>NIKKEI225</li>
            <li>HANGSENG</li>
            <li>CSI 300</li>
            <li>DAX</li>
            <li>TWII</li>
          </ul>
        </div>
        <div>
          <span>Commodity</span>
          <ul>
            <li>Brent Crude Oil</li>
            <li>Gold</li>
            <li>Copper</li>
          </ul>
        </div>
        <div>
          <span>BondYield</span>
          <ul>
            <li>US 3Month</li>
            <li>US 2Year</li>
            <li>US 10Year</li>
          </ul>
        </div>
        <div>
          <span>Others</span>
          <ul>
            <li>US headline CPI</li>
            <li>Dollar Index</li>
            <li>Korea VIX</li>
            <li>US VIX</li>
          </ul>
        </div>
      </div>
      <h4>Features</h4>
      <div className="home-model-market-list">
        <div>
          <span>Index, Commodity</span>
          <ul>
            <li>Full MA</li>
            <li>Quarter MA</li>
            <li>Volatility</li>
            <li>Volume</li>
          </ul>
        </div>
        <div>
          <span>BondYield</span>
          <ul>
            <li>2Y-3M Interest Rate Difference</li>
            <li>10Y-3M Interest Rate Difference</li>
          </ul>
        </div>
        <div>
          <span>Others</span>
          <ul>
            <li>US headline CPI MA</li>
            <li>Dollar Index EMA</li>
            <li>Korea VIX - MA</li>
            <li>US VIX - MA</li>
          </ul>
        </div>
      </div>
      <h4>Description</h4>
      <img alt="MarketClusteringModel" style={{"width": "900px", "height":"300px"}} src="/MarketClusteringModel.png"></img>
      <p>
        앞에서 구한 feature를 사용하여 KOSPI, KOSDAQ 등의 주요 지수를 예측하는 모델을 사용합니다.<br />
        그 과정에서 압축된 10차원의 시점 벡터를 사용하여 유사시점을 구할 수 있습니다.<br />
      </p>
      <img alt="SimilarPoint" style={{"width": "350px", "height":"300px"}} src="/SimilarPoint.png"></img>
      <p>
        현재 시점 벡터과 과거의 시점 벡터의 거리를 구하여 가까운 K개의 시점 벡터를 유사시점이라 정의합니다.<br />
        과거의 유사시점에서의 지수 변화값을 사용하여 미래를 예측할 수 있습니다.<br />
        여기서 구한 유사시점과 모델의 예측 데이터는 EDA와 포트폴리오 결정에 사용됩니다.<br />
      </p>
      <h3>Sector Clustering</h3>
      <p>
        Market Clustering에서 구한 유사시점을 바탕으로 Sector Clustering을 진행합니다.<br />
        비슷한 거시 경제의 상황에서는 섹터의 이슈와 같은 미시 경제의 변화가 주가의 방향을 결정합니다.<br />
        각 섹터의 주가 변화와 
      </p>
      <h3>Portfolio</h3>
      <p>
        앞의 두 유사시점 클러스터링 결과와 사용자의 의견(고위험 고수익, 제무재표 안정성 등)을 고려하여 사용자에게 적합한 포트폴리오를 제공해줍니다.<br /> 
      </p>
      <h2>Web Service</h2>
      <p>
        IBKAT의 웹서비스는 사용자가 시장의 전반적인 흐름을 파악하고 분석하여 트레이딩 아이디어를 제공하고 있습니다.<br />
      </p>
      <h3>Market</h3>
      <p>
        주식 시장에 대한 넓은 시야를 제공해줍니다.<br />
      </p>
      <h4>Index</h4>
      <p>
        최근 주요지수들의 추세나 모멘텀에 대한 분석과 시가를 확인할 수 있습니다.<br />
      </p>
      <h4>Sector</h4>
      <p>
        각 섹터에 포함된 주식들의 목록과 해당 주식들을 주요지수(KOSPI, Sector Index)와 비교하여 특정 기간동안 해당 주식의 퍼포먼스를 분석할 수 있습니다.<br />
      </p>
      <h3>EDA</h3>
      <p>

      </p>
      <h3>Portfolio</h3>
      <p>

      </p>
    </div>
  );
}

export default Home;