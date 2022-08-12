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
import "../css/EdaInfo.css"
import { Container } from "@mui/material";

function EdaInfo(props) {
    const sidebarClass = props.isOpen ? "eda-info open" : "eda-info";
    const [edaType, setEdaType] = useState("none"); // none, market, sector, stock
    const [edaName, setEdaName] = useState("none"); // none, (name)
    const [edaCode, setEdaCode] = useState("none"); // none, (code)
    const [edaFlag, setEdaFlag] = useState(false);

    const [currentSimilarDate, setCurrentSimilarDate] = useState("none");

    const [marketData, setmarketData] = useState({
      currentDate: '2022-06-08~2022-07-08',
      similarDates: ['2021-05-21~2020-06-19','2021-05-28~2021-06-26','2020-10-08~2020-11-06','2019-03-02~2019-03-31','2019-01-21~2019-02-19','2019-01-13~2019-02-11','2017-06-08~2017-07-07'],
      newsKeywords: [["아베 피습", "2022-07-08"], ["코스피 상승", "2022-07-07"]]
    });

    const buttonSX = {
      "&:hover": {
        borderColor:'blue'
      },
    };

    const similarDateClick = (e) => {
      setCurrentSimilarDate(e.target.outerText);
      // ex. '2021-05-21~2020-06-19'
    };

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
        <div class={sidebarClass}>
            <div id="eda-info-container">
                {edaFlag ?
                <>
                {/* 기준 시점 파트 */}
                <Box sx={{ width: '100%', bgcolor: 'red' }}>
                  <Grid container style={{textAlign: "center"}}>
                    <Grid item xs={6}> {/* 왼쪽 파트 */}
                      <Chip label={"기준 시점 : "+marketData.currentDate}  sx={{ fontSize: 15, width: 500, mt: 2, mb: 1, bgcolor: 'darkslategrey', color:'white' }}/>
                      <Typography gutterBottom variant="h4" component="div">
                        Chart Here
                      </Typography>
                    </Grid>
                    <Grid item xs={6}> {/* 오른쪽 파트 */}
                      <Typography gutterBottom variant="h6" component="div">
                        $4.50
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
                {/* 중간 분리선 */}
                <Divider variant="middle"> 분리 </Divider>
                {/* 유사 시점 파트 */}
                <Box sx={{ width: '100%', bgcolor: 'yellow' }}>
                  <Grid container style={{textAlign: "center"}}>
                    <Grid item xs={6}> {/* 왼쪽 파트 */}
                      <Chip color="default" label={"유사 시점 탐색 결과"}  sx={{ fontSize: 15, width: 500, mt: 2, bgcolor: 'darkslategrey', color:'white', borderRadius:1 }}/>
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
                      <Typography gutterBottom variant="h6" component="div">
                        {currentSimilarDate}
                      </Typography>
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

                <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                  <Box sx={{ my: 3, mx: 2 }}>
                    <Grid container alignItems="center">
                      <Grid item xs>
                        <Typography gutterBottom variant="h6" component="div">
                          Hello
                        </Typography>
                      </Grid>
                      <Grid item>
                        <Typography gutterBottom variant="h6" component="div">
                          $4.50
                        </Typography>
                      </Grid>
                    </Grid>
                    <Typography color="text.secondary" variant="body2">
                      Pinstriped cornflower blue cotton blouse takes you on a walk to the park or
                      just down the hall.
                    </Typography>
                  </Box>
                  <Divider variant="middle" />
                  <Box sx={{ m: 2 }}>
                    <Typography gutterBottom variant="body1">
                      Select type
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Chip label="Extra Soft" />
                      <Chip color="primary" label="Soft" />
                      <Chip label="Medium" />
                      <Chip label="Hard" />
                    </Stack>
                  </Box>
                  <Box sx={{ mt: 3, ml: 1, mb: 1 }}>
                    <Button>Add to cart</Button>
                  </Box>
                </Box>
                </>
                :
                null}
            </div>
        </div>
    )
}

export default EdaInfo;