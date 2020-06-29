import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Button, Container, Divider, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import UserData from '../../components/userData';
import CourseSchedule from '../../components/courseSchedule';
import * as Course from '../../api/course';
import log from '../../log';
import path from '../../routes/path';
import { getNextDate, getPrevDate } from '../../utils';

const sessionWindow = 15;

const useStyles = makeStyles((theme) => ({
  divider: {
    margin: theme.spacing(2),
  },
  actionBtn: {
    marginLeft: theme.spacing(1),
    marginBottom: theme.spacing(2),
  }
}));

const getUserSelector = createSelector([state => state.user.data], (user) => {
  return user;
});

function getNextSession(now, c) {
  let start = new Date(c.start_date);
  let end = new Date(c.start_date);
  end.setMinutes(end.getMinutes() + c.duration);
  let startWindow = new Date(start.setMinutes(start.getMinutes() - sessionWindow));
  let endWindow = new Date(end.setMinutes(end.getMinutes() + sessionWindow));

  // if it's a recurring class and the first class is in the past
  if (c.recurring && now > endWindow) {

    // get the previous event date for the recurring class in case there is an
    // active session right now
    start = getPrevDate(c.recurring, 1, now);
    end = new Date(start);
    end.setMinutes(end.getMinutes() + c.duration);
    startWindow = new Date(start.setMinutes(start.getMinutes() - sessionWindow));
    endWindow = new Date(end.setMinutes(end.getMinutes() + sessionWindow));

    // if the prev session is over then get the next session
    if (now > endWindow) {
      start = getNextDate(c.recurring, 1, now);
      end = new Date(start);
      end.setMinutes(end.getMinutes() + c.duration);
      startWindow = new Date(start.setMinutes(start.getMinutes() - sessionWindow));
      endWindow = new Date(end.setMinutes(end.getMinutes() + sessionWindow));
    }
  }

  return {
    eventDate: start,
    startDate: startWindow,
    endDate: endWindow,
  };
}

export default function() {

  const classes = useStyles();
  const history = useHistory();
  const params = useParams();
  const currentUser = useSelector(state => getUserSelector(state));
  const [photo, setPhoto] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [insta, setInsta] = useState('');
  const [course, setCourse] = useState('');
  const [signup, setSignup] = useState(null);
  const [joinSession, setJoinSession] = useState(null);

  async function get() {
    let cls;

    try {
      cls = await Course.get(params.id);
    } catch(err) {
      log.error("COURSE INFO:: get course details", err);
      history.push(path.home);
    }

    if (!cls || !cls.id) {
      log.debug("COURSE INFO:: course not found")
      history.push(path.home);
      return;
    }
    
    log.debug("COURSE INFO:: got course details", cls);
    setPhoto(cls.photo_url);
    setTitle(cls.title);
    setDescription(cls.description);
    setEmail(cls.instructor.email);
    setPhone(cls.instructor.phone_number);
    setCourse(cls);
    if(cls.instructor.social) setInsta(cls.instructor.social.instagram);
  }

  useEffect(() => {
    get();
  }, [params])

  useEffect(() => {
    if (!currentUser.id || !course.id) {
      setSignup((
        <Button variant="contained" color="secondary" onClick={goToLogin}>Login to Sign Up</Button>
      ));
      return;
    }

    if (currentUser.id === course.instructor.id) {
      setSignup((
        <Button variant="contained" color="secondary">Edit</Button>
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
          <Button variant="contained" color="secondary" onClick={courseLeaveHandler}>Leave Class</Button>
        ));
        return;
      }
    }

    setSignup((
      <Button variant="contained" color="secondary" onClick={courseSignupHandler}>Sign Up</Button>
    ));

  }, [currentUser, course]);

  useEffect(() => {
    if (!currentUser.id || !course.id) return;

    let authorized = false;

    if (currentUser.id === course.instructor.id) {
      authorized = true;
    }

    course.participants.forEach(function(user) {
      if (user.id === currentUser.id) {
        authorized = true;
      }
    });

    if (!authorized) return;

    let now = new Date();
    let sessionTime = getNextSession(now, course);

    if (now > sessionTime.startDate && now < sessionTime.endDate) {
      setJoinSession((
        <Button variant="contained" color="secondary" onClick={joinHandler}>Join</Button>
      ))
    }

  }, [currentUser, course])

  const courseSignupHandler = async function() {

    try {
      await Course.addParticipant(params.id);
    } catch(err) {
      return log.error("COURSE INFO: course signup", err);
      // TODO: hookup with new stripe flows
    }

    history.push(path.profile);
  }

  const goToLogin = async function() {
    history.push(`${path.login}?redirect=${path.courses}/${course.id}`)
  }

  const courseLeaveHandler = async function() {
    try {
      await Course.removeParticipant(params.id);
    } catch(err) {
      return log.error("COURSE INFO: course signup", err);
      // TODO: hookup with new stripe flows
    }

    history.push(path.profile);
  }

  const joinHandler = function() {
    history.push(path.courses + "/" + course.id + path.joinPath);
  }

  return (
    <Container>
      <Grid container direction="row" justify="flex-end">
        <Grid item className={classes.actionBtn}>
          {joinSession}
        </Grid>
        <Grid item className={classes.actionBtn}>
          {signup}
        </Grid>
      </Grid>
      <UserData header={title} bio={description} email={email} phone={phone} instagram={insta} photo={photo} />
      <Divider className={classes.divider} />
      <CourseSchedule header="Class Schedule" course={[course]} view="week" />
    </Container>
  )
}