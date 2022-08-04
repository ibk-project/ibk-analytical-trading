import React, { useState } from "react";
import './css/EDA.css';
import {Link} from 'react-router-dom';

function EDA() {
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
  const makeList = (data) => {
    let retList = [];
      for(let i = 0; i < data.length; i++) {
        retList.push(<li key={i}><Link to={"/eda/" + data[i].code}>{data[i].name}</Link></li>);
      }
    return retList;
  };
  const indexList = makeList(indexData);
  const stockList = makeList(stockData);
  const materialList = makeList(materialData);

  const [sidebarOpen, setSideBarOpen] = useState(false);
  const handleViewSidebar = () => {
    setSideBarOpen(!sidebarOpen);
  };
  const SideBar = (data) => {
    const sidebarClass = data.isOpen ? "eda-sidebar open" : "eda-sidebar";
    const toggleClass = data.isOpen ? "eda-sidebar-toggle open" : "eda-sidebar-toggle";
    const [showList1, setShowList1] = useState("none");
    const [showList2, setShowList2] = useState("none");
    const [showList3, setShowList3] = useState("none");
    const click1 = (e) => {
      showList1==="none"? (
        setShowList1("inline")
      ) : (
        setShowList1("none")
      );
    };
    const click2 = (e) => {
      showList2==="none"? (
        setShowList2("inline")
      ) : (
        setShowList2("none")
      );
    };
    const click3 = (e) => {
      showList3==="none"? (
        setShowList3("inline")
      ) : (
        setShowList3("none")
      );
    };
    
    return (
      <span>
        <div className={sidebarClass}>
          <div onClick={click1}>종합지수</div>
          <ul style={{display: showList1}}>
            {data.indexList}
          </ul>
          <div onClick={click2}>주식</div>
          <ul style={{display: showList2}}>
            {data.stockList}
          </ul>
          <div onClick={click3}>원자재</div>
          <ul style={{display: showList3}}>
            {data.materialList}
          </ul> 
        </div>
        <button onClick={data.toggleSidebar} className={toggleClass}>
          {data.isOpen? (
            <span>&lt;</span>
          ): (
            <span>&gt;</span>
          )}
        </button>
      </span>
      
    );
  };

  return(
    <div className="eda-container">
      <SideBar isOpen={sidebarOpen} toggleSidebar={handleViewSidebar} indexList={indexList} stockList={stockList} materialList={materialList} />
    </div>
  );
}

export default EDA;