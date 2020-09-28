import React, { useState, useEffect }  from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Grid, LinearProgress } from '@material-ui/core';
import { makeStyles, ThemeProvider } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { SnackbarProvider } from 'notistack';

import { store, actions } from '../../store';
import * as Course from '../../api/course';
import path from '../../routes/path';
import log from '../../log';
import Video from '../../components/video';

import { dark } from '../../styles/theme';
import * as SessionAPI from '../../api/session';

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
    overflowX: 'hidden',
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

export default function Session() {

  const currentUser = useSelector(state => getUserSelector(state));
  const classes = useStyles();
  const history = useHistory();
  const params = useParams();
  const [course, setCourse] = useState(null);
  const [authData, setAuthData] = useState(null);
  const [loader, setLoader] = useState(true);


  const init = async function(classId) {

    if (!currentUser.id) return;

    let courseData;
    try {
      courseData = await Course.get(classId);
    } catch(err) {
      log.error("OPENTOK:: get class info", err);
      history.push(path.courses + "/" + classId);
      return;
    }

    let data;
    try {
      data = await Course.getSessionInfo(courseData.id);
    } catch (err) {
      //TODO: redirect to class page with error message or display error here
      log.error("OPENTOK:: session join", err);
      history.push(path.courses + "/" + courseData.id);
      return;
    }

    let sessionData;
    try {
      sessionData = await SessionAPI.update(courseData.id, data.sessionId);
    } catch (err) {
      log.error("OPENTOK:: create class session ", err);
    }

    if (sessionData) {
      store.dispatch(actions.milestone.addSession(sessionData));
    }

    setCourse(courseData);
    setAuthData({
      sessionId: data.sessionId,
      token: data.token,
      apiKey: data.apiKey,      
    });
    setLoader(false);
  }

  useEffect(() => {
    if (course && course.instructor && currentUser.id !== course.instructor.id) {
      store.dispatch(actions.feedback.setCourse(course));
      store.dispatch(actions.feedback.setShow(true));
    }

    if (authData && authData.sessionId) {
      store.dispatch(actions.feedback.setSessionId(authData.sessionId));
    }
  }, [course, currentUser, authData]);

  useEffect(() => {
    if (params.id && currentUser.id) {
      init(params.id);
    }
  }, [params.id, currentUser]);


  let content = (
    <LinearProgress color="primary" />
  );

  if (!loader && authData && course) {
    content = (
      <Grid container direction="row" justify="flex-start" alignItems="flex-start" className={classes.root}>
        <Video credentials={authData} course={course} user={currentUser} />
      </Grid>
    );
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