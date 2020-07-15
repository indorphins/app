import React, { useState, useEffect }  from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Grid, LinearProgress } from '@material-ui/core';
import { makeStyles, ThemeProvider } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import * as Course from '../../api/course';
import path from '../../routes/path';
import log from '../../log';
import Opentok from '../../components/videoConference';
import { dark } from '../../styles/theme';

const useStyles = makeStyles((theme) => ({
  '@global': {
    '#root': {
      height: '100%',
    }
  },
  root: {
    height: '100%',
    overflow: 'hidden',
    backgroundColor: dark.palette.background.default,
  },
  contentCol: {
    padding: 0,
    height: "100%",
  }
}));

const getUserSelector = createSelector([state => state.user.data], (user) => {
  return user;
});

export default function() {

  const currentUser = useSelector(state => getUserSelector(state));
  const classes = useStyles();
  const history = useHistory();
  const params = useParams();
  const [course, setCourse] = useState({});
  const [authData, setAuthData] = useState({});
  const [loader, setLoader] = useState(true);

  const init = async function(classId) {

    if (!currentUser.id) return;

    let data;
    try {
      data = await Course.getSessionInfo(classId);
    } catch(err) {
      //TODO: redirect to class page with error message or display error here
      console.error(err);
      log.error("OPENTOK:: session join", err);
      history.push(path.courses + classId);
      return;
    }

    let courseData;
    try {
      courseData = await Course.get(classId);
    } catch(err) {
      console.error(err);
      log.error("OPENTOK:: get class info", err);
      history.push(path.courses + classId);
      return;
    }
    
    setAuthData({
      sessionId: data.sessionId,
      token: data.token,
      apiKey: data.apiKey,      
    });
    setCourse(courseData);
    setLoader(false);
  }

  useEffect(() => {
    init(params.id);
  }, [params.id, currentUser]);

  let chatContent = (
    <Grid container direction="row" justify="flex-start" alignItems="flex-start" className={classes.root}>
      <Opentok credentials={authData} course={course} user={currentUser}></Opentok>
    </Grid>
  );

  let content = (
    <LinearProgress color="secondary" />
  );

  if (!loader) {
    content = chatContent;
  }

  return (
    <ThemeProvider theme={dark}>
      <Grid className={classes.root}>
        <Grid className={classes.contentCol}>
          {content}
        </Grid>
      </Grid>
    </ThemeProvider>
  );
};