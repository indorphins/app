import React, { useState, useEffect }  from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Grid, LinearProgress } from '@material-ui/core';
import { makeStyles, ThemeProvider } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { SnackbarProvider } from 'notistack';

import * as Course from '../../api/course';
import path from '../../routes/path';
import log from '../../log';
import Video from '../../components/video';
import { dark } from '../../styles/theme';
import * as Session from '../../api/session';

const useStyles = makeStyles((theme) => ({
  '@global': {
    '#root': {
      height: '100%',
    },
    '.MuiSnackbarContent-root': {
      minWidth: 0,
      '@media (min-width: 600px)': {
        minWidth: 0,
      },
    },
    '.MuiSnackbarContent-message': {
      fontSize: "2.5rem",
    },
  },
  root: {
    height: '100%',
    overflow: 'hidden',
    backgroundColor: dark.palette.background.default,
  },
  contentCol: {
    padding: 0,
    height: "100%",
  },
  emote: {
    opacity: 0.7,
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
    } catch (err) {
      //TODO: redirect to class page with error message or display error here
      log.error("OPENTOK:: session join", err);
      history.push(path.courses + classId);
      return;
    }

    let courseData;
    try {
      courseData = await Course.get(classId);
    } catch(err) {
      log.error("OPENTOK:: get class info", err);
      history.push(path.courses + classId);
      return;
    }

    let session = null;

    try {
      session = await Session.update(courseData.id, data.sessionId);
    } catch (err) {
      log.error("OPENTOK:: create class session ", err);
      // TODO do we want to fail or continue here
    }

    if (session && session.instructor_id !== currentUser.id && session.users_joined.indexOf(currentUser.id) < 0) {
      session.users_joined.push(currentUser.id);

      try {
        session = await Session.update(courseData.id, data.sessionId, session);
      } catch (err) {
        log.error("OPENTOK:: updating class session ", err);
        // TODO error handling
      }
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
      <Video credentials={authData} course={course} user={currentUser} />
    </Grid>
  );

  let content = (
    <LinearProgress color="secondary" />
  );

  if (!loader) {
    content = chatContent;
  }

  return (
    <SnackbarProvider classes={{root: classes.emote}} maxSnack={10}>
      <ThemeProvider theme={dark}>
        <Grid className={classes.root}>
          <Grid className={classes.contentCol}>
            {content}
          </Grid>
        </Grid>
      </ThemeProvider>
    </SnackbarProvider>
  );
}