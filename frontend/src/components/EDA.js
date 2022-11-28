import React, { useState } from "react";
import {Link} from 'react-router-dom';
import './css/EDA.css';
import EdaInfo from "./eda/EdaInfo";


function EDA() {
  const marketData = [
    {"name": "전체 시장", "code": "100"},
  ];
  // const sectorData = [
  //   {"name": "반도체와반도체장비", "code": "11"},
  //   {"name": "철강", "code": "12"},
  //   {"name": "은행", "code": "13"},
  //   {"name": "석유와가스", "code": "14"},
  //   {"name": "화학", "code": "15"},
  //   {"name": "양방향미디어와서비스", "code": "16"},
  //   {"name": "복합기업", "code": "17"},
  //   {"name": "자동차", "code": "18"},
  //   {"name": "제약", "code": "19"},
  //   {"name": "전자전기제품", "code": "20"}
  // ];
  const sectorData = [
    {'code': '300', 'name': '양방향미디어와서비스'},
    {'code': '263', 'name': '게임엔터테인먼트'},
    {'code': '267', 'name': 'IT서비스'},
    {'code': '327', 'name': '디스플레이패널'},
    {'code': '305', 'name': '항공사'},
    {'code': '282', 'name': '전자장비와기기'},
    {'code': '295', 'name': '에너지장비및서비스'},
    {'code': '291', 'name': '조선'},
    {'code': '266', 'name': '화장품'},
    {'code': '316', 'name': '건강관리업체및서비스'},
    {'code': '314', 'name': '출판'},
    {'code': '278', 'name': '반도체와반도체장비'},
    {'code': '285', 'name': '방송과엔터테인먼트'},
    {'code': '325', 'name': '전기유틸리티'},
    {'code': '332', 'name': '문구류'},
    {'code': '280', 'name': '부동산'},
    {'code': '294', 'name': '통신장비'},
    {'code': '329', 'name': '도로와철도운송'},
    {'code': '286', 'name': '생물공학'},
    {'code': '323', 'name': '해운사'},
    {'code': '287', 'name': '소프트웨어'},
    {'code': '279', 'name': '건설'},
    {'code': '331', 'name': '복합유틸리티'},
    {'code': '269', 'name': '디스플레이장비및부품'},
    {'code': '301', 'name': '은행'},
    {'code': '307', 'name': '전자제품'},
    {'code': '328', 'name': '전문소매'},
    {'code': '272', 'name': '화학'},
    {'code': '277', 'name': '창업투자'},
    {'code': '303', 'name': '가구'},
    {'code': '298', 'name': '가정용기기와용품'},
    {'code': '321', 'name': '증권'},
    {'code': '296', 'name': '운송인프라'},
    {'code': '288', 'name': '건강관리기술'},
    {'code': '317', 'name': '호텔,레스토랑,레저'},
    {'code': '339', 'name': '다각화된소비자서비스'},
    {'code': '274', 'name': '섬유,의류,신발,호화품'},
    {'code': '283', 'name': '전기제품'},
    {'code': '308', 'name': '인터넷과카탈로그소매'},
    {'code': '292', 'name': '핸드셋'},
    {'code': '311', 'name': '포장재'},
    {'code': '281', 'name': '건강관리장비와용품'},
    {'code': '299', 'name': '기계'},
    {'code': '318', 'name': '종이와목재'},
    {'code': '273', 'name': '자동차'},
    {'code': '310', 'name': '광고'},
    {'code': '262', 'name': '생명과학도구및서비스'},
    {'code': '322', 'name': '비철금속'},
    {'code': '261', 'name': '제약'},
    {'code': '276', 'name': '복합기업'},
    {'code': '309', 'name': '음료'},
    {'code': '337', 'name': '카드'},
    {'code': '289', 'name': '건축자재'},
    {'code': '293', 'name': '컴퓨터와주변기기'},
    {'code': '271', 'name': '레저용장비와제품'},
    {'code': '270', 'name': '자동차부품'},
    {'code': '306', 'name': '전기장비'},
    {'code': '304', 'name': '철강'},
    {'code': '265', 'name': '판매업체'},
    {'code': '320', 'name': '건축제품'},
    {'code': '338', 'name': '사무용전자제품'},
    {'code': '264', 'name': '백화점과일반상점'},
    {'code': '297', 'name': '가정용품'},
    {'code': '284', 'name': '우주항공과국방'},
    {'code': '324', 'name': '상업서비스와공급품'},
    {'code': '290', 'name': '교육서비스'},
    {'code': '326', 'name': '항공화물운송과물류'},
    {'code': '333', 'name': '무선통신서비스'},
    {'code': '315', 'name': '손해보험'},
    {'code': '302', 'name': '식품과기본식료품소매'},
    {'code': '313', 'name': '석유와가스'},
    {'code': '312', 'name': '가스유틸리티'},
    {'code': '330', 'name': '생명보험'},
    {'code': '336', 'name': '다각화된통신서비스'},
    {'code': '319', 'name': '기타금융'},
    {'code': '268', 'name': '식품'},
    {'code': '334', 'name': '무역회사와판매업체'},
    {'code': '275', 'name': '담배'}
  ];
  // const stockData = [
  //   {"name": "시가총액 상위 100개", "code": "000101"},
  //   {"name": "시가총액 상위 200개", "code": "000102"},
  //   {"name": "시가총액 상위 300개", "code": "000103"}
  // ];
  const [edaType, setEdaType] = useState("market"); // none, market, sector, stock
  const [edaName, setEdaName] = useState("전체 시장"); // none, (name)
  const [edaCode, setEdaCode] = useState("000001"); // none, (code)
  const onEdaClick = (e) => {
    let code = e.target.href.split("/")[4];
    setEdaName(e.target.innerHTML)
    console.log("eda name changed to ",e.target.innerHTML);
    setEdaCode(code)
    if (marketData.find(o => o.code === code)) {
        setEdaType("market");
    } else if (sectorData.find(o => o.code === code)) {
      setEdaType("sector");
    } 
    // else if (stockData.find(o => o.code === code)) {
    //     setEdaType("stock");
    // } 
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
  // const stockList = makeList(stockData);
  
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
        <div className={sidebarClass} style={{zIndex:10}}>
          <div onClick={click1}>시장</div>
          <ul style={{display: showList1}}>
            {data.marketList}
          </ul>
          <div onClick={click2}>섹터</div>
          <ul style={{display: showList2}}>
            {data.sectorList}
          </ul>
          {/* <div onClick={click3}>주요 주식</div>
          <ul style={{display: showList3}}>
            {data.stockList}
          </ul>  */}
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
      <SideBar isOpen={sidebarOpen} toggleSidebar={handleViewSidebar} marketList={marketList} /*stockList={stockList}*/ sectorList={sectorList} />
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