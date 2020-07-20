import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Button, Container, Grid, Typography, Card, useMediaQuery } from '@material-ui/core';
import { Photo, ShoppingCartOutlined, GroupAdd, People, RecordVoiceOver } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { format, isTomorrow, isToday } from 'date-fns';

import CreateMessage from '../../components/form/createMessage'
import * as Course from '../../api/course';
import log from '../../log';
import path from '../../routes/path';
import { getNextSession } from '../../utils';

const useStyles = makeStyles((theme) => ({
  title: {
    paddingBottom: theme.spacing(2),
  },
  cost: {
    fontWeight: "bold",
    display: "inline-block",
    width: "100%",
  },
  spotsContainer: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    cursor: "default",
    backgroundColor: theme.palette.grey[200],
  },
  participantContainer: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    cursor: "default",
    backgroundColor: theme.palette.grey[200],
  },
  instructorContainer: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    cursor: "default",
    backgroundColor: theme.palette.grey[200],
  },
  photo: {
    width: "100%",
    objectFit: "cover",
    borderRadius: "4px",
    minHeight: 300,
    maxHeight: 500,
  },
  nophoto: {
    width: "100%",
    background: "#e4e4e4;",
    minHeight: 300,
    maxHeight: 500,
  },
  courseTime: {
    marginBottom: theme.spacing(2),
  },
  '@global': {
    html: {
      overflow: 'hidden',
      height: '100%',
    },
    body: {
      overflow: 'auto',
      height: '100%',
    },
    '#wysiwygContent > h2': {
      color: theme.palette.text.secondary, 
      fontSize: "1.5rem"
    },
    '#wysiwygContent > p': {
      fontSize: "1.1rem",
      color: theme.palette.text.secondary,
    },
    '#wysiwygContent > ol': {
      fontSize: "1.1rem",
      color: theme.palette.text.secondary,
    },
    '#wysiwygContent > ul': {
      fontSize: "1.1rem",
      color: theme.palette.text.secondary,
    },
    '#wysiwygContent > blockquote': {
      borderLeft: "3px solid grey",
      paddingLeft: "2em",
      fontStyle: "italic",
      fontWeight: "bold",
      color: theme.palette.text.secondary,
    }
  }
}));

const getUserSelector = createSelector([state => state.user.data], (user) => {
  return user;
});

export default function () {

  const classes = useStyles();
  const history = useHistory();
  const params = useParams();
  const currentUser = useSelector(state => getUserSelector(state));
  const [course, setCourse] = useState('');
  const [signup, setSignup] = useState(null);
  const [notify, setNotify] = useState(null);
  const [makeMessage, setMakeMessage] = useState(false);
  const [joinSession, setJoinSession] = useState(null);

  async function get() {
    let cls;

    try {
      cls = await Course.get(params.id);
    } catch (err) {
      log.error("COURSE INFO:: get course details", err);
      history.push(path.home);
    }

    if (!cls || !cls.id) {
      log.debug("COURSE INFO:: course not found")
      history.push(path.home);
      return;
    }

    log.debug("COURSE INFO:: got course details", cls);
    setCourse(cls);
  }

  useEffect(() => {
    document.querySelector('body').scrollTo(0, 0);
  }, []);

  useEffect(() => {
    get();
  }, [params])

  useEffect(() => {
    if (!course.id) {
      return;
    }

    if (!currentUser.id) {
      setSignup((
        <Button variant="contained" color="secondary" onClick={goToLogin} style={{width:"100%"}}>Login to Book Class</Button>
      ));
      return;
    }

    if (currentUser.id === course.instructor.id || currentUser.type === 'admin') {
      setMakeMessage(true);
    }

    if (currentUser.id === course.instructor.id) {
      setSignup((
        <Button variant="contained" color="secondary" style={{width:"100%"}}>Edit Class</Button>
      ));
      return;
    }

    if (course.participants.length > 0) {
      let enrolled = false;
      for (var i = 0; i < course.participants.length; i++) {
        if (course.participants[i].id === currentUser.id) {
          enrolled = true;
        }
      };

      if (enrolled) {
        setSignup((
          <Button variant="contained" color="secondary" onClick={courseLeaveHandler} style={{width:"100%"}}>Leave Class</Button>
        ));
        return;
      }
    }

    setSignup((
      <Button variant="contained" color="secondary" onClick={courseSignupHandler} style={{width:"100%"}}>Book Class</Button>
    ));

  }, [currentUser, course]);

  useEffect(() => {
    if (!currentUser.id || !course.id) return;

    let authorized = false;

    if (currentUser.id === course.instructor.id) {
      authorized = true;
    }

    course.participants.forEach(function (user) {
      if (user.id === currentUser.id) {
        authorized = true;
      }
    });

    if (!authorized) return;

    let now = new Date();
    let sessionTime = getNextSession(now, course);

    if (sessionTime && now > sessionTime.start && now < sessionTime.end) {
      setJoinSession((
        <Button variant="contained" color="secondary" onClick={joinHandler} style={{width:"100%"}}>Join Session</Button>
      ))
    }

  }, [currentUser, course])

  const createMessageHandler = function () {
    setMakeMessage(true)
    setNotify(null)
  }

  const sendMessageHandler = function () {
    setMakeMessage(false)
    setNotify((
      <Button variant='contained' color='secondary' onClick={createMessageHandler}>Message Sent</Button>
    ))
  }

  const courseSignupHandler = async function () {

    try {
      await Course.addParticipant(params.id);
    } catch (err) {
      return log.error("COURSE INFO: course signup", err);
      // TODO: hookup with new stripe flows
    }

    history.push(path.schedule);
  }

  const goToLogin = async function () {
    history.push(`${path.login}?redirect=${path.courses}/${course.id}`)
  }

  const courseLeaveHandler = async function () {
    try {
      await Course.removeParticipant(params.id);
    } catch (err) {
      return log.error("COURSE INFO: course signup", err);
      // TODO: hookup with new stripe flows
    }

    history.push(path.profile);
  }

  const joinHandler = function () {
    history.push(path.courses + "/" + course.id + path.joinPath);
  }

  let messageContent = null;
  if (makeMessage) {
    messageContent = (
      <Grid>
        <Typography variant="h5">
          Send your class a message
        </Typography>
        <CreateMessage onSend={sendMessageHandler} courseId={course.id} />
      </Grid>
    )
  }

  let costContent = null;

  if (course.cost) {
    costContent = (
      <Card className={classes.spotsContainer} title="Classes can be left up to 24 hours before the class start time">
        <Grid container direction="column" justify="center" alignItems="center">
          <Grid item>
            <ShoppingCartOutlined color="primary" />
          </Grid>
          <Grid item>
            <Typography className={classes.cost} variant="h2" align="center">
              $0
            </Typography>
          </Grid>
        </Grid>
      </Card>
    );
  }

  let spotsCount = course.available_spots;
  if (spotsCount < 0) spotsCount = 0;
  let spotsContent = (
    <Card className={classes.spotsContainer} title="Spaces remaining">
      <Grid container direction="column" justify="center" alignItems="center">
        <Grid item>
          <GroupAdd color="primary" />
        </Grid>
        <Grid item>
          <Typography className={classes.cost} variant="h2" align="center">
            {spotsCount}
          </Typography>
        </Grid>
      </Grid>
    </Card>
  )

  let instructorContent = null;

  if (course.instructor) {
    instructorContent = (
      <Card className={classes.instructorContainer}>
        <Grid container direction="row" justify="flex-start" alignItems="center" alignContent="center" spacing={2}>
          <Grid item>
            <RecordVoiceOver color="primary" />
          </Grid>
          <Grid item>
            <Typography variant="h5">
              Instructor
            </Typography>
          </Grid>
        </Grid>
        <Grid container direction="row" justify="flex-start" alignItems="center" spacing={2}>
          <Grid item>
            <Typography variant="body1">{course.instructor.first_name} {course.instructor.last_name}</Typography>
          </Grid>
          <Grid item>
            <Typography variant="body2">{course.instructor.username}</Typography>
          </Grid>
        </Grid>
        <Typography variant="body1">{course.instructor.email}</Typography>
      </Card>
    )
  }

  let participantsContent = null

  if (course.participants && course.participants.length) {
    participantsContent = (
      <Card className={classes.participantContainer}>
        <Grid container direction="row" justify="flex-start" alignItems="center" alignContent="center" spacing={2}>
          <Grid item>
            <People color="primary" />
          </Grid>
          <Grid item>
            <Typography variant="h5">
              Participants
            </Typography>
          </Grid>
        </Grid>
        <Grid container direction="row" justify="flex-start">
        {course.participants.map(item => (
          <Grid key={item.username} item xs={6}>
            <Typography variant="body1">{item.username}</Typography>
          </Grid>
        ))}
        </Grid>
      </Card>
    )
  }

  let photoContent = (
    <Grid item xs>
      <Grid container direction="row" justify="center" alignContent="center" className={classes.nophoto}>
        <Grid item>
          <Photo className={classes.nophotoIcon} />
        </Grid>
      </Grid>
    </Grid>
  )

  if (course.photo_url) {
    photoContent = (  
      <Grid item xs>
        <img className={classes.photo} alt={course.title} src={course.photo_url} />
      </Grid>
    );
  }

  let descriptionContent = null;

  if (course.description) {
    descriptionContent = (
      <div id="wysiwygContent" className={classes.bio} dangerouslySetInnerHTML={{__html: course.description}}></div>
    );
  }

  let courseTitle = null;

  if (course.title) {
    courseTitle = (
      <Typography variant="h1" className={classes.title}>
        {course.title}
      </Typography>
    );
  }

  let courseTimeContent = null;

  if (course.start_date) {
    let now = new Date();
    let next = getNextSession(now, course);
    let formatted = null;

    if (next) {
      let d = new Date(next.date);
      let dt = format(d, "iiii");
      let time = format(d, "h:mm a");

      if (d.getDate() - now.getDate() >= 7) {
        dt = format(d, "iiii, MMMM do");
      }

      if (isTomorrow(d)) {
        dt = "Tomorrow";
      }

      if (isToday(d)) {
        dt = "Today";
      }

      formatted = dt + " @ " + time;
      if (course.recurring) {
        formatted = formatted + " - weekly";
      }
    } else {
      formatted = "Class over";
    }

    courseTimeContent = (
      <Typography variant="h3" className={classes.courseTime}>{formatted}</Typography>
    );
  }


  const sml = useMediaQuery('(max-width:600px)');
  const med = useMediaQuery('(max-width:900px)');

  let layout = null;
  if (sml) {
    layout = {
      main: "column-reverse",
      courseDetailsDirection: "column",
      courseDetailsJustify: "flex-start",
      courseDetailsSize: 12,
      courseCostSize: 12,
      costSize: 6,
      spotsSize: 6,
      coursePhotoDirection: "column",
      coursePhotoSize: "auto",
      actionBtnDirection: "column",
      actionBtnSize: "auto",
      instructorDetailsDirection: "column",
      instructorDetailsSize: "auto",
    };
  } else if (med) {
    layout = {
      main: "column-reverse",
      courseDetailsDirection: "column",
      courseDetailsJustify: "flex-start",
      courseDetailsSize: 12,
      courseCostSize: 12,
      costSize: 6,
      spotsSize: 6,
      coursePhotoDirection: "row",
      coursePhotoSize: 4,
      actionBtnDirection: "row",
      actionBtnSize: 6,
      instructorDetailsDirection: "row",
      instructorDetailsSize: 6,
    }
  } else {
    layout = {
      main: "column-reverse",
      courseDetailsDirection: "row",
      courseDetailsJustify: "space-between",
      courseDetailsSize: 9,
      courseCostSize: 3,
      costSize: "auto",
      spotsSize: "auto",
      coursePhotoDirection: "row",
      coursePhotoSize: 4,
      actionBtnDirection: "row",
      actionBtnSize: 3,
      instructorDetailsDirection: "column",
      instructorDetailsSize: "auto",
    }
  }

  let notifyBtn = null;
  if (notify) {
    notifyBtn = (
      <Grid item xs={layout.actionBtnSize}>
        {notify}
      </Grid>
    );
  }

  let joinBtn = null;
  if (joinSession) {
    joinBtn = (
      <Grid item xs={layout.actionBtnSize}>
        {joinSession}
      </Grid>
    );
  }

  let signupBtn = null;
  if (signup) {
    signupBtn = (
      <Grid item xs={layout.actionBtnSize}>
        {signup}
      </Grid>
    );
  }

  return (
    <Container style={{paddingTop: "2rem", paddingBottom: "2rem"}}>
      <Grid container direction={layout.main} spacing={2}>
        <Grid item>
          <Grid container direction={layout.actionBtnDirection} justify="flex-end" spacing={2}>
            {notifyBtn}
            {joinBtn}
            {signupBtn}
          </Grid>
        </Grid>
        <Grid item>
          <Grid container direction={layout.courseDetailsDirection} justify={layout.courseDetailsJustify} spacing={2}>
            <Grid item xs={layout.courseDetailsSize}>
              <Grid container direction={layout.coursePhotoDirection} justify="flex-start" spacing={2}>
                <Grid item xs={layout.coursePhotoSize}>
                  {photoContent}
                </Grid>
                <Grid item xs>
                  {courseTitle}
                  {courseTimeContent}
                  {descriptionContent}
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={layout.courseCostSize}>
              <Grid container direction="column" spacing={2}>
                <Grid item>
                  <Grid container direction="row" justify="flex-end" spacing={2}>
                    <Grid item xs={layout.costSize}>
                      {costContent}
                    </Grid>
                    <Grid item xs={layout.spotsSize}>
                      {spotsContent}
                    </Grid>               
                  </Grid>
                </Grid>
                <Grid item>
                  <Grid container direction={layout.instructorDetailsDirection} spacing={2}>
                    <Grid item xs={layout.instructorDetailsSize}>
                      {instructorContent}
                    </Grid>
                    <Grid item xs={layout.instructorDetailsSize}>
                      {participantsContent}
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      {messageContent}
    </Container>
  )
}