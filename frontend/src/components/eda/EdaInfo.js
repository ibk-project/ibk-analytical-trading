import React, {useState, useEffect} from "react";
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import Tooltip from '@mui/material/Tooltip';
import { Container } from "@mui/material";
import styled from 'styled-components'

import ShortSingleLine from '../chart/ShortSingleLine';
import axios from 'axios';
import "../css/EdaInfo.css"

const NewsButton = styled.button`
  background-color: midnightblue;
  color: white;
  border: 0;
  /* width: 100%; */
  width: max-content;
  height: 25px;
  border-radius: 12px;
`;

function EdaInfo(props) {
    const mainColor = "#3d3d3d"
    const sidebarClass = props.isOpen ? "eda-info open" : "eda-info";
    const [edaType, setEdaType] = useState("none"); // none, market, sector, stock
    const [edaName, setEdaName] = useState("none"); // none, (name)
    const [edaCode, setEdaCode] = useState("none"); // none, (code)
    const [edaFlag, setEdaFlag] = useState(false);

    const [currentSimilarDateEnd, setCurrentSimilarDateEnd] = useState("none");
    const [currentSimilarDateStart, setCurrentSimlilarDateStart] = useState("none");
    const [currentSelectedFeature, setCurrentSelectedFeature] = useState("KOSDAQ");
    const [similarSelectedFeature, setSimilarSelectedFeature] = useState("none");
    const [newsData, setNewsData] = useState();
    // const [similarDateEDAReady, setSimilarDateEDAReady] = useState(false);

    const [marketData, setMarketData] = useState({
      currentDate: '2022-06-08~2022-07-08',
      // similarDates: ['2021-05-21~2021-06-19','2021-05-28~2021-06-26','2020-10-08~2020-11-06','2019-03-02~2019-03-31','2019-01-21~2019-02-19','2019-01-13~2019-02-11','2017-06-08~2017-07-07'],
      similarDates: ['2021-06-19','2021-06-26','2020-11-06','2019-03-31','2019-02-19','2019-02-11','2017-07-07'],
      newsKeywords: [["아베 피습", "2022-07-08"], ["코스피 상승", "2022-07-07"], ["바이던 음주", "2022-07-06"], ["옥수수 수염차", "2022-07-05"], ["일석 이조", "2022-07-04"]],
      kospi: [],
      kosdaq: [],
      brent: [],
      usdkrw: [],
      copper: [],
      bicheol: [],
      bank: [],
      oil: [],
      cosmetics: [],
      realestate: [],
      space: [],
    });

    const [similarDateData, setSimilarDateData] = useState({
      newsKeywords: [["아베 피습", "2022-07-08"], ["코스피 상승", "2022-07-07"], ["바이던 음주", "2022-07-06"], ["옥수수 수염차", "2022-07-05"], ["일석 이조", "2022-07-04"]],
      kospi: [],
      kosdaq: [],
      brent: [],
      usdkrw: [],
      copper: [],
      bicheol: [],
      bank: [],
      oil: [],
      cosmetics: [],
      realestate: [],
      space: [],
    });

    const getIndex = async(tempcode, startDate, endDate, today) => {
      await axios.get('/api/data-management/index/get', {
        params: {
          "code": tempcode,
          "date": startDate,
          "e_date": endDate,
          "type": "line"
        }
      }).then(res => {
        if(today===true){
          let temp_marketData = marketData;
          if(tempcode==="KQ11")
            temp_marketData.kosdaq = res.data.data;
          else if(tempcode==="KS11")
            temp_marketData.kospi = res.data.data;
          else if(tempcode==="USD/KRW")
            temp_marketData.usdkrw = res.data.data;
          setMarketData(temp_marketData);
        } else {
          let temp_similarData = similarDateData;
          if(tempcode==="KQ11")
            temp_similarData.kosdaq = res.data.data;
          else if(tempcode==="KS11")
            temp_similarData.kospi = res.data.data;
          else if(tempcode==="USD/KRW")
            temp_similarData.usdkrw = res.data.data;
          setSimilarDateData(temp_similarData);
        }
        
        // setIndexData(res.data.data);
        // makeIndexAnalysis(res.data.data);
      });
    }
    const getCommodity = async(tempcode, startDate, endDate, today) => {
      await axios.get('/api/data-management/commodity/one-data', {
        params: {
          "code": tempcode,
          "date": startDate,
          "e_date": endDate
        }
      }).then(res => {

        if(today===true){
          let temp_marketData = marketData;
          if(tempcode==="CL")
            temp_marketData.brent = res.data.data;
          else if(tempcode==="HG")
            temp_marketData.copper = res.data.data; 
          setMarketData(temp_marketData);
        } else {
          let temp_similarData = similarDateData;
          if(tempcode==="CL")
            temp_similarData.brent = res.data.data;
          else if(tempcode==="HG")
            temp_similarData.copper = res.data.data; 
          setSimilarDateData(temp_similarData);
        }
      });
    }

    const getSector = async(sectorName, startDate, endDate, today) => {
      await axios.get('/api/data-management/stock/sector-avg', {
        params: {
          "start_date": startDate,
          "end_date": endDate,
          "sector_name": sectorName
        }
      }).then(res => {
        res.data = res.data.data;
        if(today===true) {
          let temp_marketData = marketData;
          if(sectorName === "비철금속") {
            temp_marketData.bicheol = res.data;
          } else if(sectorName === "은행") {
            temp_marketData.bank = res.data;
          } else if(sectorName === "석유와가스") {
            temp_marketData.oil = res.data;
          } else if(sectorName === "화장품") {
            temp_marketData.cosmetics = res.data;
          } else if(sectorName === "부동산") {
            temp_marketData.realestate = res.data;
          } else if(sectorName === "우주항공과국방") {
            temp_marketData.space = res.data;
          }
          setMarketData(temp_marketData);
        } else {
          let temp_similarData = similarDateData;
          if(sectorName === "비철금속") {
            temp_similarData.bicheol = res.data;
          } else if(sectorName === "은행") {
            temp_similarData.bank = res.data;
          } else if(sectorName === "석유와가스") {
            temp_similarData.oil = res.data;
          } else if(sectorName === "화장품") {
            temp_similarData.cosmetics = res.data;
          } else if(sectorName === "부동산") {
            temp_similarData.realestate = res.data;
          } else if(sectorName === "우주항공과국방") {
            temp_similarData.space = res.data;
          }
          setSimilarDateData(temp_similarData);
        }
        
      });
    }

    const getSimilarDates = async() => {
      console.log("new similar dates for ", props.edaName);
      // 현재 시점으로 가정하고 유사 시점 가져옴
      let modeltype = (props.edaType==="sector"?"sector/"+props.edaCode:"market")
      // await axios.get('https://node02.spccluster.skku.edu:10638/market/model/'+props.edaCode)
      // .then(res => {
      //   console.log("axios res similarpoint is", res);
      //   let temp_marketData = marketData;
      //   temp_marketData.similarDates = res.points;
      //   setMarketData(temp_marketData);
      // });
      await axios.get(`/api/data-management/model/${modeltype}`).then(res => {
        console.log("model similar points res is ", res.data);
        let temp_marketData = marketData;

        if(modeltype==="market") {
          temp_marketData.similarDates = res.data.Result.points;
          console.log("temp_marketData similar dates is ", temp_marketData.similarDates);
        }
        else {
          let temp_array = res.data[0]['Similar Dates'].slice(1,-1).split(', ');
          temp_array = temp_array.map(x => x.split("~")[1]);
          console.log("temp_array is ", temp_array);
          //temp_marketData.similarDates = temp_array;
          temp_marketData.similarDates = temp_array.map(x => x.slice(0,-1));
          // temp_marketData.similarDates = temp_array.map(x => x.splice(0,-1));
        }
        setMarketData(temp_marketData);
      });
      // 100:market clustering, 322:비철금속, 301:은행, 313:석유와가스, 266:화장품, 280:부동산, 284:우주항공과국방
    }

    const getNews = async(date, isToday) => {
      await axios.get('/api/data-management/model/news').then(res => {
        setNewsData(res.data);
        let todaynews = [];
        let newsLen = 0;
        let tempday = date;
        // if(date.length>12){
        //   tempday = date.split("~")[1];
        // } else {
        //   tempday = date;
        // }
        
        while (newsLen<5){
          if(!res.data[tempday]){
            console.error("news date error", tempday, res.data[tempday]);
            break;
          }
          let tempnews = res.data[tempday];
          if(tempnews[0]!="" && tempnews[1]!=""){
            todaynews.push([(tempnews[0]+" "+tempnews[1]), tempday]);
            newsLen += 1;
          }
          let split_dates = tempday.split("-"); // 기존 형식 yyyy-mm-dd
          let day_dates = parseInt(split_dates[2]);
          let month_dates = parseInt(split_dates[1]);
          if(day_dates === 1){
            split_dates[2] = "28";
            if(month_dates === 1){
              split_dates[1] = "12";
              split_dates[0] -= 1;
            } else{
              split_dates[1] -= 1;
            }
          } else {
            split_dates[2] -= 1;
          }
          split_dates[1] = ('0'+split_dates[1]).slice(-2);
          split_dates[2] = ('0'+split_dates[2]).slice(-2);
          tempday = split_dates.join('-');
        }
        if(isToday === true){
          let temp_marketData = marketData;
          temp_marketData.newsKeywords = todaynews;
          setMarketData(temp_marketData);
        } else {
          let temp_similarData = similarDateData;
          temp_similarData.newsKeywords = todaynews;
          setSimilarDateData(temp_similarData);
        }
      })
    }

    useEffect(() => {
      console.log("eda code changed");
      getSimilarDates();
      if(props.edaType === "sector"){
        let startDate = marketData.currentDate.split("~")[0];
        let endDate = marketData.currentDate.split("~")[1];
        getSector(props.edaName, startDate, endDate, true);
      }
    }, [props.edaCode])

    useEffect(() => {
      if (props.edaType === "none") {
        setEdaFlag(false);
        setEdaType("none");
        setEdaName("none");
        setEdaCode("none");
      }
      else {
        setEdaFlag(true);
        setEdaType(props.edaType);
        setEdaName(props.edaName);
        setEdaCode(props.edaCode);
      }

      let startDate = marketData.currentDate.split("~")[0];
      let endDate = marketData.currentDate.split("~")[1];

      getSector("비철금속", startDate, endDate, true);
      getSector("은행", startDate, endDate, true);
      getSector("석유와가스", startDate, endDate, true);
      getSector("화장품", startDate, endDate, true);
      getSector("부동산", startDate, endDate, true);
      getSector("우주항공과국방", startDate, endDate, true);

      // kospi 가져오기
      getIndex("KS11", startDate, endDate, true);
      // kosdaq 가져오기
      getIndex("KQ11", startDate, endDate, true);
      // USD/KRW 가져오기
      getIndex("USD/KRW", startDate, endDate, true);
      // 브랜트유 가져오기
      getCommodity("CL", startDate, endDate, true);
      // 구리 선물 가져오기
      getCommodity("HG", startDate, endDate, true);
      // 유사 시점 목록 가져오기
      
      
      getSimilarDates();

      getNews(endDate, true);
      // 백엔드에서 현재 시점 기본 marketData를 setMarketData에 저장 (similarDates, newsKeywords)
    }, [])

    useEffect(() => {
      if (currentSimilarDateEnd !== "none") {
        // 한 달 이전으로 빼기
        let currentSimilarDate_end = currentSimilarDateEnd;
        let split_dates = currentSimilarDateEnd.split("-"); // 기존 형식 yyyy-mm-dd
        let month_dates = parseInt(split_dates[1]);
        if(month_dates === 1){
          split_dates[0] -= 1;
          split_dates[1] = "12";
        } else {
          split_dates[1] -= 1;
        }
        
        split_dates[1] = ('0'+split_dates[1]).slice(-2);
        // split_dates[2] = ('0'+split_dates[2]).slice(-2);
        let currentSimilarDate_start = split_dates.join('-');
        setCurrentSimlilarDateStart(currentSimilarDate_start);

        // getSimilarDateData
        // 백엔드에서 currentSimilarDateEnd 날짜의 (뉴스 키워드 5개)와 주요 지수(kospi, brent유, KRW/USD, copper선물) 정보 가져와서 setSimilarDateData 에 저장

        getSector("비철금속", currentSimilarDate_start, currentSimilarDate_end, false);
        getSector("은행", currentSimilarDate_start, currentSimilarDate_end, false);
        getSector("석유와가스", currentSimilarDate_start, currentSimilarDate_end, false);
        getSector("화장품", currentSimilarDate_start, currentSimilarDate_end, false);
        getSector("부동산", currentSimilarDate_start, currentSimilarDate_end, false);
        getSector("우주항공과국방", currentSimilarDate_start, currentSimilarDate_end, false);

        // kospi 가져오기
        getIndex("KS11", currentSimilarDate_start, currentSimilarDate_end, false);
        // kosdaq 가져오기
        getIndex("KQ11", currentSimilarDate_start, currentSimilarDate_end, false);
        // USD/KRW 가져오기
        getIndex("USD/KRW", currentSimilarDate_start, currentSimilarDate_end, false);
        // 브랜트유 가져오기
        getCommodity("CL", currentSimilarDate_start, currentSimilarDate_end, false);
        // 구리 선물 가져오기
        getCommodity("HG", currentSimilarDate_start, currentSimilarDate_end, false);


        getNews(currentSimilarDate_end, false);

        if(similarSelectedFeature === 'none')
          setSimilarSelectedFeature("KOSPI");
      }
    }, [currentSimilarDateEnd])

    
    const featureSelection1 = ["KOSDAQ", "BRENT", "USD/KRW", "COPPER"];
    const featureSelection2 = ["KOSPI", "KOSDAQ", "BRENT", "USD/KRW", "COPPER"];

    const buttonSX = {
      "&:hover": {
        borderColor:'blue'
      },
    };

    const similarDateClick = (e) => {
      setCurrentSimilarDateEnd(e.target.outerText);
      // ex. '2021-05-21~2020-06-19'
    };
    const featureClick = (e) => {
      setCurrentSelectedFeature(e.target.outerText);
    }
    const featureClick2 = (e) => {
      setSimilarSelectedFeature(e.target.outerText);
    }

  
    return (
        <div className={sidebarClass}>
            <div id="eda-info-container">
                {edaFlag ?
                <>
                <Divider key={"22224"} variant="middle" sx={{mb:"5px", fontSize:"larger"}}> 기준 시점 </Divider>
                {/* 기준 시점 파트 */}
                <Box key={"556554"} sx={{ width: '100%' }}>
                  <Grid container key={"0020534"} style={{textAlign: "center"}}>
                    <Grid item key={"grid100"} xs={6}> {/* 왼쪽 파트 */}
                      <Chip key={"1234"} label={(props.edaName==="전체 시장"?("KOSPI"):(props.edaName)) + "  " + marketData.currentDate}  sx={{ fontSize: 20, width: 500, mt: 2, mb: 1, bgcolor: mainColor, color:'white' }}/>
                      {/* <Typography key={"1235"} gutterBottom variant="h4" component="div" sx={{my:4}}>
                        Chart Here
                      </Typography> */}
                      <ShortSingleLine 
                      title={(props.edaName==="전체 시장"?("KOSPI"):
                      (props.edaName+(props.edaType==="sector"?" 섹터":"")))} 
                      data={((props.edaType==="market")?(marketData.kospi):(
                      (props.edaName==="비철금속")?(marketData.bicheol):
                      (props.edaName==="은행")?(marketData.bank):
                      (props.edaName==="화장품")?(marketData.cosmetics):
                      (props.edaName==="석유와가스")?(marketData.oil):
                      (props.edaName==="부동산")?(marketData.realestate):(marketData.space)))} 
                      place={"left"}/>
                    </Grid>
                    <Grid item key={"grid101"} xs={6} sx={{textAlign: 'center', pb:'7px'}}> {/* 오른쪽 파트 */}
                      <Chip key={"1236"} label={marketData.currentDate} sx={{ borderRadius: 3, fontSize: 20, width: 400, mt: 2, mb: 1, bgcolor: "midnightblue", color:'white' }}/>
                      <Grid key={"1237"} container align="center" justifyContent="center" alignItems="center" sx={{ maxWidth: 500, textAlign: 'center', mx:'auto'}}>
                        <Grid item key={"99192"} sm={2} sx={{ border:0, width:'100%', height:'100%', bgcolor:'white', color:'black', borderRadius:0}}>
                              주요 지수:
                        </Grid>
                        {(props.edaName==="전체 시장"?featureSelection1:featureSelection2).map((value) => (
                          <>
                          {(currentSelectedFeature===value)?
                            <Grid item key={value} sm={2}><Button key={"1238"+{value}} onClick={(e) => featureClick(e)} sx={{ border:0, width:'100%', height:'100%', bgcolor:'black', color:'white', borderColor:'black', borderRadius:0}}>
                              {value}
                            </Button></Grid>
                          :
                            <Grid item key={value} sm={2}><Button key={"1234"+{value}} onClick={(e) => featureClick(e)} sx={{ border:0, width:'100%', height:'100%',  bgcolor:'white', color:'black', borderRadius:0}}>
                              {value}
                            </Button></Grid>
                          }
                          </>
                        ))}
                      </Grid>
                      <Box >
                        {props.edaName==="전체 시장"?
                          <></>
                          :
                          (currentSelectedFeature==="KOSPI" && <ShortSingleLine title={"KOSPI"} data={marketData.kospi} />)
                        }
                        {currentSelectedFeature==="KOSDAQ" && <ShortSingleLine title={"KOSDAQ"} data={marketData.kosdaq} />}
                        {currentSelectedFeature==="BRENT" && <ShortSingleLine title={"BRENT"} data={marketData.brent} />}
                        {currentSelectedFeature==="USD/KRW" && <ShortSingleLine title={"USD/KRW"} data={marketData.usdkrw} />}
                        {currentSelectedFeature==="COPPER" && <ShortSingleLine title={"COPPER"} data={marketData.copper} />}
                      </Box>
                      
                      <Box key={"1239"}>
                        <Grid container key={"1240"} align="center" justifyContent="center" alignItems="center" sx={{ maxWidth: 500, textAlign: 'center', mx:'auto'}}>
                          <Grid item key={"1241"} sm={4} sx={{ px:1, pt:1 }}><NewsButton key={"1242"} style={{backgroundColor:'black', color:'white'}}>
                            최근 주요 뉴스 키워드
                          </NewsButton></Grid>
                          {marketData.newsKeywords.map((value) => (
                            <>
                              <Grid item key={value[0]} sx={{ px:1, pt:1 }}><Tooltip key={"1234123"+value[0]} title={value[1]} arrow><NewsButton key={"1234532"+value[0]}>
                                {value[0]}
                              </NewsButton></Tooltip></Grid>
                            </>
                          ))}
                        </Grid>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
                {/* 중간 분리선 */}
                <Divider key={"22225"} variant="middle" sx={{mt:"20px", mb:"5px", fontSize:"larger"}}> 유사 시점 </Divider>
                {/* 유사 시점 파트 */}
                <Box key={"002020"} sx={{ width: '100%', mb:'80px' }}>
                  <Grid container key={"1234754"} style={{textAlign: "center"}}>
                    <Grid item key={"341234"} xs={6}> {/* 왼쪽 파트 */}
                      <Chip key={"512342"} color="default" label={"유사 시점 탐색 결과"} sx={{ fontSize: 20, width: 500, mt: 5, bgcolor: mainColor, color:'white', borderRadius:1 }}/>
                      <Paper key={"612342"} style={{minHeight: 100, maxHeight: 250, maxWidth: 500, overflow: 'auto'}} sx={{ mx:'auto', mb: 2 }}>

                        <List key="929294">
                          {marketData.similarDates.map((value) => (
                            <ListItem key={value} sx={{py:0.5}} >
                              {(currentSimilarDateEnd===value)?
                                <ListItemButton key={"button1"+{value}} onClick={(e) => similarDateClick(e)} sx={{bgcolor:'midnightblue', borderRadius: 3, color:'white', buttonSX}}>
                                  <ListItemText key={"text1"+value} primary={`${value}`} />
                                </ListItemButton>
                                :
                                <ListItemButton key={"button1"+value} onClick={(e) => similarDateClick(e)} sx={{bgcolor: 'lightgrey', borderRadius: 3, color:'black'}}>
                                  <ListItemText key={"text1"+value} primary={`${value}`} />
                                </ListItemButton>
                              }
                              
                            </ListItem>
                          ))}
                        </List>
                      </Paper>

                      {currentSimilarDateEnd==='none'?(
                        <>
                        </>
                      ):(<>
                        <Chip key={"1237"} label={(props.edaName==="전체 시장"?("KOSPI"):(props.edaName)) + "  " + currentSimilarDateStart+"~"+currentSimilarDateEnd}  sx={{ fontSize: 20, width: 500, mt: 2, mb: 1, bgcolor: mainColor, color:'white' }}/>
                        <ShortSingleLine 
                          title={(props.edaName==="전체 시장"?("KOSPI"):
                          (props.edaName+(props.edaType==="sector"?" 섹터":"")))} 
                          data={((props.edaType==="market")?(similarDateData.kospi):(
                          (props.edaName==="비철금속")?(similarDateData.bicheol):
                          (props.edaName==="은행")?(similarDateData.bank):
                          (props.edaName==="화장품")?(similarDateData.cosmetics):
                          (props.edaName==="석유와가스")?(similarDateData.oil):
                          (props.edaName==="부동산")?(similarDateData.realestate):(similarDateData.space)))} 
                          place={"left"}/>
                        </>
                      )}
                      
                    </Grid>
                    <Grid item key={"6112344"} xs={6} sx={{textAlign: 'center', paddingTop:'5px'}}> {/* 오른쪽 파트 */}
                    {/* {similarDateEDAReady===false?( */}
                    {similarSelectedFeature==="none"?(
                      <>
                      <Typography gutterBottom key={"777777"} variant="h6" component="div" sx={{my:15}}>
                        유사시점을 선택해주세요
                      </Typography>
                      </>
                    ):(
                      <>
                      <Chip label={currentSimilarDateStart+"~"+currentSimilarDateEnd} key={"8765864"} sx={{ borderRadius: 3, fontSize: 20, width: 400, mt: 2, mb: 1, bgcolor: "midnightblue", color:'white' }}/>
                      <Grid container key={"3214294"} align="center" justifyContent="center" alignItems="center" sx={{ maxWidth: 500, textAlign: 'center', mx:'auto'}}>
                        <Grid item key={"99192"} sm={2} sx={{ border:0, width:'100%', height:'100%', bgcolor:'white', color:'black', borderRadius:0}}>
                              주요 지수:
                        </Grid>
                        {featureSelection2.map((value) => (
                          <>
                          {(similarSelectedFeature===value)?
                            <Grid item key={value} sm={2}><Button key={"button2"+{value}} onClick={(e) => featureClick2(e)} sx={{ border:0, width:'100%', height:'100%', bgcolor:'black', color:'white', borderColor:'black', borderRadius:0}}>
                              {value}
                            </Button></Grid>
                          :
                            <Grid item key={value} sm={2}><Button key={"button2"+{value}} onClick={(e) => featureClick2(e)} sx={{ border:0, width:'100%', height:'100%',  bgcolor:'white', color:'black', borderRadius:0}}>
                              {value}
                            </Button></Grid>
                          }
                          </>
                        ))}
                      </Grid>
                      
                      <Box >
                        {similarSelectedFeature==="KOSPI" && <ShortSingleLine title={"KOSPI"} data={similarDateData.kospi} />}
                        {similarSelectedFeature==="KOSDAQ" && <ShortSingleLine title={"KOSDAQ"} data={similarDateData.kosdaq} />}
                        {similarSelectedFeature==="BRENT" && <ShortSingleLine title={"BRENT"} data={similarDateData.brent} />}
                        {similarSelectedFeature==="USD/KRW" && <ShortSingleLine title={"USD/KRW"} data={similarDateData.usdkrw} />}
                        {similarSelectedFeature==="COPPER" && <ShortSingleLine title={"COPPER"} data={similarDateData.copper} />}
                      </Box>

                      <Box key={"6134444"}>
                        <Grid container key={"86565464"} align="center" justifyContent="center" alignItems="center" sx={{ maxWidth: 500, textAlign: 'center', mx:'auto'}}>
                          <Grid item key={"grid000"} sm={4} sx={{ px:1, pt:1 }}><NewsButton key={"6123424"} style={{backgroundColor:'black', color:'white'}}>
                            최근 주요 뉴스 키워드
                          </NewsButton></Grid>
                          {similarDateData.newsKeywords.map((value) => (
                            <>
                              <Grid item key={value[0]} sx={{ px:1, pt:1 }}><Tooltip key={"1010250"+value[0]} title={value[1]} arrow ><NewsButton>
                                {value[0]}
                              </NewsButton></Tooltip></Grid>
                            </>
                          ))}
                        </Grid>
                      </Box>
                      </>
                    )}
                    </Grid>
                  </Grid>
                </Box>

                </>
                :
                null}
            </div>
        </div>
    )
}

export default EdaInfo;
