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
import DevicePicker from '../../components/video/devicePicker';
import { dark } from '../../styles/theme';
//import * as Session from '../../api/session';

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
  const [cameraId, setCameraId] = useState(null);
  const [micId, setMicId] = useState(null);
  //const [join, setJoin] = useState(false);
  const join = false;
  const [loader, setLoader] = useState(true);

  /*const init = async function(classId) {

    if (!currentUser.id) return;

    let data;
    try {
      data = await Course.getSessionInfo(classId);
    } catch (err) {
      //TODO: redirect to class page with error message or display error here
      log.error("OPENTOK:: session join", err);
      history.push(path.courses + "/" + classId);
      return;
    }

    let courseData;
    try {
      courseData = await Course.get(classId);
    } catch(err) {
      log.error("OPENTOK:: get class info", err);
      history.push(path.courses + "/" + classId);
      return;
    }

    let sessionData;
    try {
      sessionData = await Session.update(courseData.id, data.sessionId);
    } catch (err) {
      log.error("OPENTOK:: create class session ", err);
    }

    if (sessionData) {
      store.dispatch(actions.milestone.addSession(sessionData));
    }    

    setAuthData({
      sessionId: data.sessionId,
      token: data.token,
      apiKey: data.apiKey,      
    });
    //setCourse(courseData);
    setLoader(false);
  }*/

  const deviceInit = async function (classId) {
    if (!currentUser.id) return;

    let data;
    try {
      data = await Course.getPrivateSessionInfo(classId);
    } catch (err) {
      //TODO: redirect to class page with error message or display error here
      log.error("OPENTOK:: session join", err);
      history.push(path.courses + "/" + classId);
      return;
    }

    let courseData;
    try {
      courseData = await Course.get(classId);
    } catch(err) {
      log.error("OPENTOK:: get class info", err);
      history.push(path.courses + "/" + classId);
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
    if (course.instructor && currentUser.id !== course.instructor.id) {
      store.dispatch(actions.feedback.setCourse(course));
      store.dispatch(actions.feedback.setShow(true));
      store.dispatch(actions.feedback.setSessionId(authData.sessionId));
    }
  }, [course, currentUser, authData])

  useEffect(() => {
    if (params.id && currentUser.id) {
      deviceInit(params.id)
    }
    //init(params.id);
  }, [params.id, currentUser]);

  function onDeviceChange(evt) {
    setCameraId(evt.camera);
    setMicId(evt.mic);
  }

  let content = (
    <LinearProgress color="primary" />
  );

  if (!loader) {

    if (join) {
      content = (
        <Grid container direction="row" justify="flex-start" alignItems="flex-start" className={classes.root}>
          <Video credentials={authData} course={course} user={currentUser} cameraId={cameraId} micId={micId} />
        </Grid>
      );
    } else {
      content = (
        <Grid container direction="row" justify="flex-start" alignItems="flex-start" className={classes.root}>
          <DevicePicker credentials={authData} course={course} user={currentUser} onChange={onDeviceChange} />
        </Grid>
      )
    }
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