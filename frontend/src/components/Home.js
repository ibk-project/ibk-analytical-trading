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
      <h4>Preprocessing</h4>
      <p>
        지수, 주가, 원자재 등에서 추출된 feature들은 모델에 바로 사용하기에는 적절하지 않습니다.<br />
        주식 시장은 호황기에는 예상보다 높은 상승을 침체기에는 큰 낙폭을 보입니다.<br />
        이러한 이상치 데이터를 사용하면 유의미한 학습이 어렵습니다.<br />
        이 문제를 해결하기 위해 일반화와 정규화를 하여 데이터를 의미있는 형태로 변환합니다.<br />
      </p>
      <img alt="Preprocessing" style={{"width": "900px", "height":"190px"}} src="/Preprocessing.png"></img>
      <p>
        원본 데이터에서는 2020년 3월에 있었던 코로나에 VIX(변동성지수)가 크게 반응하여 최극값 외의 다른 날들사이의 비교가 어려웠습니다.<br />
        sigmoid 정규화를 마친 뒤에는 모든 극값이 더 크게 스케일링되어 의미있는 영향력을 미칩니다.<br />
        이 외에도 단기 금리가 장기 금리를 추월하여 두 지표가 크로스되는 지점을 부각하는 등의 전처리를 통해 feature의 의미를 부각합니다.<br />
      </p>
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
        각 섹터 그룹 별로 다른 양상을 보일 수 있기에, 섹터의 성향과 기업 정보를 반영해 각 섹터의 과거 유사 시점을 찾아내는 것이 중요하다고 생각해,<br />
        Kensho의 머신러닝 재무분석 모델과 유사한 알고리즘으로 각 섹터 별 유사시점을 탐색할 수 있도록 제작하였습니다.
      </p>
      <img alt="Sector Clustering Features" style={{"width": "700px", "height":"400px"}} src="/SectorClusteringFeatures.png"></img>
      <img alt="Sector Clustering Model" style={{"width": "700px", "height":"350px"}} src="/SectorClusteringModel.png"></img>
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
        최근 주요지수들의 추세나 모멘텀에 대한 요약을 확인할 수 있습니다.<br />
      </p>
      <h4>Sector</h4>
      <p>
        각 섹터에 포함된 주식들의 목록과 해당 주식들을 주요지수(KOSPI, Sector Index)와 비교하여 특정 기간동안 해당 주식의 수익률을 분석할 수 있습니다.<br />
      </p>
      <h3>EDA</h3>
      <p>

      </p>
      <h3>Portfolio</h3>
      <p>
        사용자의 입력을 받아 조건에 부합하는 포트폴리오를 생성해줍니다.<br />
        몇 개의 포트폴리오를 추천해주며 포트폴리오의 예상 수익률, 리스크 등을 비교할 수 있습니다.<br />
        포트폴리오를 선택하면 포트폴리오의 비중, 백테스팅 결과(수익률, 최대낙폭 등)의 분석 결과를 보여줍니다.<br />
      </p>
    </div>
  );
}

export default Home;