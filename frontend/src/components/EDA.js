import React, { useState } from "react";
import {Link} from 'react-router-dom';
import './css/EDA.css';
import EdaInfo from "./eda/EdaInfo";


function EDA() {
  const marketData = [
    {"name": "전체 시장", "code": "000001"},
  ];
  const sectorData = [
    {"name": "비철금속", "code": "322"},
    {"name": "은행", "code": "301"},
    {"name": "석유와가스", "code": "313"},
    {"name": "화장품", "code": "266"},
    {"name": "부동산", "code": "280"},
    {"name": "우주항공과국방", "code": "284"},
  ];
  const stockData = [
    {"name": "시가총액 상위 100개", "code": "000100"},
    {"name": "시가총액 상위 200개", "code": "000200"},
    {"name": "시가총액 상위 300개", "code": "000300"}
  ];
  const [edaType, setEdaType] = useState("market"); // none, market, sector, stock
  const [edaName, setEdaName] = useState("전체 시장"); // none, (name)
  const [edaCode, setEdaCode] = useState("000001"); // none, (code)
  const onEdaClick = (e) => {
    let code = e.target.href.split("/")[4];
    setEdaName(e.target.innerHTML)
    setEdaCode(code)
    if (marketData.find(o => o.code === code)) {
        setEdaType("market");
    } else if (sectorData.find(o => o.code === code)) {
      setEdaType("sector");
    } else if (stockData.find(o => o.code === code)) {
        setEdaType("stock");
    } 
  }
  const makeList = (data) => {
    let retList = [];
      for(let i = 0; i < data.length; i++) {
        retList.push(<li key={i}><Link to={"/eda/" + data[i].code} onClick={onEdaClick}>{data[i].name}</Link></li>);
      }
    return retList;
  };
  const marketList = makeList(marketData);
  const sectorList = makeList(sectorData);
  const stockList = makeList(stockData);
  
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
          <div onClick={click1}>시장</div>
          <ul style={{display: showList1}}>
            {data.marketList}
          </ul>
          <div onClick={click2}>섹터</div>
          <ul style={{display: showList2}}>
            {data.sectorList}
          </ul>
          <div onClick={click3}>주요 주식</div>
          <ul style={{display: showList3}}>
            {data.stockList}
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
      <SideBar isOpen={sidebarOpen} toggleSidebar={handleViewSidebar} marketList={marketList} stockList={stockList} sectorList={sectorList} />
      <EdaInfo
        isOpen={sidebarOpen}
        edaName = {edaName}
        edaType = {edaType}
        edaCode = {edaCode}
      />

    </div>
  );
}

export default EDA;