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
import styled from 'styled-components'
import "../css/EdaInfo.css"
import { Container } from "@mui/material";

const NewsButton = styled.button`
  background-color: midnightblue;
  color: white;
  border: 0;
  width: 100%;
  height: 32px;
  border-radius: 12px;
`;

function EdaInfo(props) {
    const mainColor = "#5b5b69"
    const sidebarClass = props.isOpen ? "eda-info open" : "eda-info";
    const [edaType, setEdaType] = useState("none"); // none, market, sector, stock
    const [edaName, setEdaName] = useState("none"); // none, (name)
    const [edaCode, setEdaCode] = useState("none"); // none, (code)
    const [edaFlag, setEdaFlag] = useState(false);

    const [currentSimilarDate, setCurrentSimilarDate] = useState("none");
    const [currentSelectedFeature, setCurrentSelectedFeature] = useState("KOSPI");
    const [similarSelectedFeature, setSimilarSelectedFeature] = useState("KOSPI");

    const [marketData, setmarketData] = useState({
      currentDate: '2022-06-08~2022-07-08',
      similarDates: ['2021-05-21~2020-06-19','2021-05-28~2021-06-26','2020-10-08~2020-11-06','2019-03-02~2019-03-31','2019-01-21~2019-02-19','2019-01-13~2019-02-11','2017-06-08~2017-07-07'],
      newsKeywords: [["아베 피습", "2022-07-08"], ["코스피 상승", "2022-07-07"], ["바이던 음주", "2022-07-06"], ["옥수수 수염차", "2022-07-05"], ["일석 이조", "2022-07-04"]],
      kospi: [],
      brent: [],
      krwusd: [],
      copper: [],
    });

    const [similarDateData, setSimilarDateData] = useState({
      newsKeywords: [["아베 피습", "2022-07-08"], ["코스피 상승", "2022-07-07"], ["바이던 음주", "2022-07-06"], ["옥수수 수염차", "2022-07-05"], ["일석 이조", "2022-07-04"]],
      kospi: [],
      brent: [],
      krwusd: [],
      copper: [],
    });


    useEffect(() => {
      // getMarketData
      // 백엔드에서 현재 시점 기본 marketData를 setMarketData에 저장 (similarDates, newsKeywords)
    }, [])

    useEffect(() => {
      // getSimilarDateData
      // 백엔드에서 currentSimilarDate 날짜의 (뉴스 키워드 5개)와 주요 지수(kospi, brent유, KRW/USD, copper선물) 정보 가져와서 setSimilarDateData 에 저장
    }, [currentSimilarDate])


    const featureSelection = ["KOSPI", "BRENT", "KRW/USD", "COPPER"];

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
                <Box sx={{ width: '100%' }}>
                  <Grid container style={{textAlign: "center"}}>
                    <Grid item xs={6}> {/* 왼쪽 파트 */}
                      <Chip label={"기준 시점 : "+marketData.currentDate}  sx={{ fontSize: 15, width: 500, mt: 2, mb: 1, bgcolor: mainColor, color:'white' }}/>
                      <Typography gutterBottom variant="h4" component="div" sx={{my:4}}>
                        Chart Here
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sx={{textAlign: 'center', paddingTop:'16px'}}> {/* 오른쪽 파트 */}
                      <Grid container align="center" justifyContent="center" alignItems="center" sx={{ maxWidth: 500, textAlign: 'center', mx:'auto'}}>
                        {featureSelection.map((value) => (
                          <>
                          {(currentSelectedFeature===value)?
                            <Grid item key={value} sm={2}><Button onClick={(e) => featureClick(e)} sx={{ border:0, width:'100%', height:'100%', bgcolor:'black', color:'white', borderColor:'black', borderRadius:0}}>
                              {value}
                            </Button></Grid>
                          :
                            <Grid item key={value} sm={2}><Button onClick={(e) => featureClick(e)} sx={{ border:0, width:'100%', height:'100%',  bgcolor:'white', color:'black', borderRadius:0}}>
                              {value}
                            </Button></Grid>
                          }
                          </>
                        ))}
                      </Grid>
                      <Typography gutterBottom variant="h5" component="div" sx={{my:4}}>
                        {currentSelectedFeature} Chart {marketData.currentDate}
                      </Typography>
                      <Box sx={{my:3}}>
                        <Grid container align="center" justifyContent="center" alignItems="center" sx={{ maxWidth: 500, textAlign: 'center', mx:'auto'}}>
                          <Grid item sm={4.5} sx={{ px:1, pt:1 }}><NewsButton style={{backgroundColor:'black', color:'white'}}>
                            최근 주요 뉴스 키워드
                          </NewsButton></Grid>
                          {marketData.newsKeywords.map((value) => (
                            <>
                              <Grid item key={value[0]} sm={3} sx={{ px:1, pt:1 }}><Tooltip title={value[1]} arrow><NewsButton>
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
                <Divider variant="middle"> 유사 시점 </Divider>
                {/* 유사 시점 파트 */}
                <Box sx={{ width: '100%' }}>
                  <Grid container style={{textAlign: "center"}}>
                    <Grid item xs={6}> {/* 왼쪽 파트 */}
                      <Chip color="default" label={"유사 시점 탐색 결과"}  sx={{ fontSize: 15, width: 500, mt: 2, bgcolor: mainColor, color:'white', borderRadius:1 }}/>
                      <Paper style={{minHeight: 100, maxHeight: 250, maxWidth: 500, overflow: 'auto'}} sx={{ mx:'auto', mb: 2 }}>

                        <List>
                          {marketData.similarDates.map((value) => (
                            <ListItem key={value} sx={{py:0.5}} >
                              {(currentSimilarDate===value)?
                                <ListItemButton onClick={(e) => similarDateClick(e)} sx={{bgcolor:'midnightblue', borderRadius: 3, color:'white', buttonSX}}>
                                  <ListItemText primary={`${value}`} />
                                </ListItemButton>
                                :
                                <ListItemButton onClick={(e) => similarDateClick(e)} sx={{bgcolor: 'lightgrey', borderRadius: 3, color:'black'}}>
                                  <ListItemText primary={`${value}`} />
                                </ListItemButton>
                              }
                              
                            </ListItem>
                          ))}
                        </List>

                      </Paper>
                    </Grid>
                    <Grid item xs={6}> {/* 오른쪽 파트 */}
                    {currentSimilarDate==="none"?(
                      <>
                      <Typography gutterBottom variant="h6" component="div" sx={{my:15}}>
                        유사시점을 선택해주세요
                      </Typography>
                      </>
                    ):(
                      <>
                      <Chip label={currentSimilarDate}  sx={{ borderRadius: 3, fontSize: 15, width: 400, mt: 2, mb: 1, bgcolor: "midnightblue", color:'white' }}/>
                      <Grid container align="center" justifyContent="center" alignItems="center" sx={{ maxWidth: 500, textAlign: 'center', mx:'auto'}}>
                        {featureSelection.map((value) => (
                          <>
                          {(similarSelectedFeature===value)?
                            <Grid item key={value} sm={2}><Button onClick={(e) => featureClick2(e)} sx={{ border:0, width:'100%', height:'100%', bgcolor:'black', color:'white', borderColor:'black', borderRadius:0}}>
                              {value}
                            </Button></Grid>
                          :
                            <Grid item key={value} sm={2}><Button onClick={(e) => featureClick2(e)} sx={{ border:0, width:'100%', height:'100%',  bgcolor:'white', color:'black', borderRadius:0}}>
                              {value}
                            </Button></Grid>
                          }
                          </>
                        ))}
                      </Grid>
                      <Typography gutterBottom variant="h5" component="div" sx={{my:4}}>
                        {similarSelectedFeature} Chart {currentSimilarDate}
                      </Typography>
                      <Box sx={{my:3}}>
                        <Grid container align="center" justifyContent="center" alignItems="center" sx={{ maxWidth: 500, textAlign: 'center', mx:'auto'}}>
                          <Grid item sm={4.5} sx={{ px:1, pt:1 }}><NewsButton style={{backgroundColor:'black', color:'white'}}>
                            최근 주요 뉴스 키워드
                          </NewsButton></Grid>
                          {similarDateData.newsKeywords.map((value) => (
                            <>
                              <Grid item key={value[0]} sm={3} sx={{ px:1, pt:1 }}><Tooltip title={value[1]} arrow><NewsButton>
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