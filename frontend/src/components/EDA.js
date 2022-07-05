import './css/EDA.css';
import {Link} from 'react-router-dom';

function EDA() {
  const makeList = (data) => {
    let retList = [];
      for(let i = 0; i < data.length; i++) {
        retList.push(<li key={i}><Link to={"/eda/" + data[i].code}>{data[i].name}</Link></li>);
      }
    return retList;
  };
  const indexData = [
    {"name": "KOSPI", "code": "012345"},
    {"name": "KODAQ", "code": "012346"},
    {"name": "NASDAQ", "code": "412451"},
    {"name": "S&P", "code": "573442"}
  ];
  const stockData = [    
    {"name": "NAVER", "code": "126834"},
    {"name": "삼성전자", "code": "825343"},
    {"name": "SK하이닉스", "code": "121097"},
    {"name": "현대차", "code": "126834"},
    {"name": "삼성 SDI", "code": "635434"},
    {"name": "기아", "code": "297587"},
    {"name": "카카오", "code": "017254"},
    {"name": "LG화학", "code": "234886"},
    {"name": "셀트리온", "code": "723593"},
    {"name": "카카오뱅크", "code": "901245"},
    {"name": "크래프톤", "code": "091792"}
  ];
  const materialData = [
    {"name": "금", "code": "124215"},
    {"name": "은", "code": "458657"},
    {"name": "철", "code": "924251"},
    {"name": "옥수수", "code": "128578"},
    {"name": "구리", "code": "973542"},
    {"name": "석유", "code": "875654"},
    {"name": "석탄", "code": "890352"}
  ];
  const indexList = makeList(indexData);
  const stockList = makeList(stockData);
  const materiaList = makeList(materialData);
  return(
    <div className="eda-container">
      <div className="eda-sidebar">
        <div>종합지수</div>
        <ul>
          {indexList}
        </ul>
        <div>주식</div>
        <ul>
          {stockList}
        </ul>
        <div>원자제</div>
        <ul>
          {materiaList}
        </ul>
      </div>
      <div className="eda-content">
        
      </div>
    </div>
  );
}

export default EDA;