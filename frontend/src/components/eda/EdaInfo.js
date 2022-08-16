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

    const [currentSimilarDate, setCurrentSimilarDate] = useState("none");
    const [currentSelectedFeature, setCurrentSelectedFeature] = useState("KOSPI");
    const [similarSelectedFeature, setSimilarSelectedFeature] = useState("KOSPI");

    const [marketData, setMarketData] = useState({
      currentDate: '2022-06-08~2022-07-08',
      similarDates: ['2021-05-21~2020-06-19','2021-05-28~2021-06-26','2020-10-08~2020-11-06','2019-03-02~2019-03-31','2019-01-21~2019-02-19','2019-01-13~2019-02-11','2017-06-08~2017-07-07'],
      newsKeywords: [["아베 피습", "2022-07-08"], ["코스피 상승", "2022-07-07"], ["바이던 음주", "2022-07-06"], ["옥수수 수염차", "2022-07-05"], ["일석 이조", "2022-07-04"]],
      kospi: [],
      brent: [],
      usdkrw: [],
      copper: [],
    });

    const [similarDateData, setSimilarDateData] = useState({
      newsKeywords: [["아베 피습", "2022-07-08"], ["코스피 상승", "2022-07-07"], ["바이던 음주", "2022-07-06"], ["옥수수 수염차", "2022-07-05"], ["일석 이조", "2022-07-04"]],
      kospi: [],
      brent: [],
      usdkrw: [],
      copper: [],
    });

    const getIndex = async(tempcode, startDate) => {
      await axios.get('/api/data-management/index/get', {
        params: {
          "code": tempcode,
          "date": startDate,
          "type": "line"
        }
      }).then(res => {
        console.log("axios res index is", res);
        let temp_marketData = marketData;
        if(tempcode==="KS11")
          temp_marketData.kospi = res.data.data;
        else if(tempcode==="USD/KRW")
          temp_marketData.usdkrw = res.data.data;

        setMarketData(temp_marketData);
        // setIndexData(res.data.data);
        // makeIndexAnalysis(res.data.data);
      });
    }
    const getCommodity = async(tempcode, startDate) => {
      await axios.get('/api/data-management/commodity/one-data', {
        params: {
          "code": tempcode,
          "date": startDate
        }
      }).then(res => {
        console.log("axios res commodity is", res);
        let temp_marketData = marketData;
        if(tempcode==="CL")
          temp_marketData.brent = res.data.data;
        else if(tempcode==="HG")
          temp_marketData.copper = res.data.data;

        setMarketData(temp_marketData);
      });
    }
    const getSimilarDates = async() => {
      // 현재 시점으로 가정하고 유사 시점 가져옴 market clustering
      await axios.get('https://node01.spccluster.skku.edu:10581/market/model/100').then(res => {
        console.log("axios res similarpoint is", res);
        let temp_marketData = marketData;
        temp_marketData.similarDates = res.points;
        setMarketData(temp_marketData);
      });
    }

    useEffect(() => {
      console.log("current similar date is ", marketData.currentDate);
      let startDate = marketData.currentDate.split("~")[0];
      console.log("startDate is ", startDate);

      // kospi 가져오기
      getIndex("KS11", startDate);
      // USD/KRW 가져오기
      getIndex("USD/KRW", startDate);
      // 브랜트유 가져오기
      getCommodity("CL", startDate);
      // 구리 선물 가져오기
      getCommodity("HG", startDate);
      // 유사 시점 목록 가져오기
      getSimilarDates();

      // getMarketData
      // 백엔드에서 현재 시점 기본 marketData를 setMarketData에 저장 (similarDates, newsKeywords)
    }, [])

    useEffect(() => {
      // getSimilarDateData
      // 백엔드에서 currentSimilarDate 날짜의 (뉴스 키워드 5개)와 주요 지수(kospi, brent유, KRW/USD, copper선물) 정보 가져와서 setSimilarDateData 에 저장
    }, [currentSimilarDate])


    const featureSelection = ["KOSPI", "BRENT", "USD/KRW", "COPPER"];

    const buttonSX = {
      "&:hover": {
        borderColor:'blue'
      },
    };

    const similarDateClick = (e) => {
      setCurrentSimilarDate(e.target.outerText);
      // ex. '2021-05-21~2020-06-19'
    };
    const featureClick = (e) => {
      setCurrentSelectedFeature(e.target.outerText);
    }
    const featureClick2 = (e) => {
      setSimilarSelectedFeature(e.target.outerText);
    }

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
    });

    return (
        <div className={sidebarClass}>
            <div id="eda-info-container">
                {edaFlag ?
                <>
                {/* 기준 시점 파트 */}
                <Box key={"556554"} sx={{ width: '100%' }}>
                  <Grid container key={"0020534"} style={{textAlign: "center"}}>
                    <Grid item key={"grid100"} xs={6}> {/* 왼쪽 파트 */}
                      <Chip key={"1234"} label={(edaName==="전체 시장"?("KOSPI"):(edaName)) + "  " + marketData.currentDate}  sx={{ fontSize: 15, width: 500, mt: 2, mb: 1, bgcolor: mainColor, color:'white' }}/>
                      {/* <Typography key={"1235"} gutterBottom variant="h4" component="div" sx={{my:4}}>
                        Chart Here
                      </Typography> */}
                      <ShortSingleLine title={"KOSPI"} data={marketData.kospi} />
                    </Grid>
                    <Grid item key={"grid101"} xs={6} sx={{textAlign: 'center', paddingTop:'5px'}}> {/* 오른쪽 파트 */}
                      <Chip key={"1236"} label={marketData.currentDate} sx={{ borderRadius: 3, fontSize: 15, width: 400, mt: 2, mb: 1, bgcolor: "midnightblue", color:'white' }}/>
                      <Grid key={"1237"} container align="center" justifyContent="center" alignItems="center" sx={{ maxWidth: 500, textAlign: 'center', mx:'auto'}}>
                        {featureSelection.map((value) => (
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
                      {/* <Typography gutterBottom key={"1238"} variant="h5" component="div" sx={{my:4}}>
                        {currentSelectedFeature} Chart {marketData.currentDate}
                      </Typography> */}
                      <Box sx={{width:"70%"}}>
                        {currentSelectedFeature==="KOSPI" && <ShortSingleLine title={"KOSPI"} data={marketData.kospi} style={{height:"500px"}}/>}
                        {currentSelectedFeature==="BRENT" && <ShortSingleLine title={"BRENT"} data={marketData.kospi} />}
                        {currentSelectedFeature==="USD/KRW" && <ShortSingleLine title={"USD"} data={marketData.kospi} />}
                        {currentSelectedFeature==="COPPER" && <ShortSingleLine title={"COPPER"} data={marketData.kospi} />}
                      </Box>
                      
                      <Box key={"1239"} sx={{my:3}}>
                        <Grid container key={"1240"} align="center" justifyContent="center" alignItems="center" sx={{ maxWidth: 500, textAlign: 'center', mx:'auto'}}>
                          <Grid item key={"1241"} sm={4.5} sx={{ px:1, pt:1 }}><NewsButton key={"1242"} style={{backgroundColor:'black', color:'white'}}>
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
                <Divider key={"22224"} variant="middle" sx={{my:"15px"}}> 유사 시점 </Divider>
                {/* 유사 시점 파트 */}
                <Box key={"002020"} sx={{ width: '100%' }}>
                  <Grid container key={"1234754"} style={{textAlign: "center"}}>
                    <Grid item key={"341234"} xs={6}> {/* 왼쪽 파트 */}
                      <Chip key={"512342"} color="default" label={"유사 시점 탐색 결과"} sx={{ fontSize: 15, width: 500, mt: 2, bgcolor: mainColor, color:'white', borderRadius:1 }}/>
                      <Paper key={"612342"} style={{minHeight: 100, maxHeight: 250, maxWidth: 500, overflow: 'auto'}} sx={{ mx:'auto', mb: 2 }}>

                        <List key="929294">
                          {marketData.similarDates.map((value) => (
                            <ListItem key={value} sx={{py:0.5}} >
                              {(currentSimilarDate===value)?
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
                    </Grid>
                    <Grid item key={"6112344"} xs={6} sx={{textAlign: 'center', paddingTop:'5px'}}> {/* 오른쪽 파트 */}
                    {currentSimilarDate==="none"?(
                      <>
                      <Typography gutterBottom key={"777777"} variant="h6" component="div" sx={{my:15}}>
                        유사시점을 선택해주세요
                      </Typography>
                      </>
                    ):(
                      <>
                      <Chip label={currentSimilarDate} key={"8765864"} sx={{ borderRadius: 3, fontSize: 15, width: 400, mt: 2, mb: 1, bgcolor: "midnightblue", color:'white' }}/>
                      <Grid container key={"3214294"} align="center" justifyContent="center" alignItems="center" sx={{ maxWidth: 500, textAlign: 'center', mx:'auto'}}>
                        {featureSelection.map((value) => (
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
                      <Typography gutterBottom key={"71714"} variant="h5" component="div" sx={{my:4}}>
                        {similarSelectedFeature} Chart {currentSimilarDate}
                      </Typography>
                      <Box key={"6134444"} sx={{my:3}}>
                        <Grid container key={"86565464"} align="center" justifyContent="center" alignItems="center" sx={{ maxWidth: 500, textAlign: 'center', mx:'auto'}}>
                          <Grid item key={"grid000"} sm={4.5} sx={{ px:1, pt:1 }}><NewsButton key={"6123424"} style={{backgroundColor:'black', color:'white'}}>
                            최근 주요 뉴스 키워드
                          </NewsButton></Grid>
                          {similarDateData.newsKeywords.map((value) => (
                            <>
                              <Grid item key={value[0]} sx={{ px:1, pt:1 }}><Tooltip key={"1010250"+value[0]} title={value[1]} arrow><NewsButton>
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

                <div>
                    code is {edaCode}
                </div>
                <div>
                    name is {edaName}
                </div>
                <div>
                    type is {edaType}
                </div>

                </>
                :
                null}
            </div>
        </div>
    )
}

export default EdaInfo;