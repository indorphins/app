import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Container, Grid, CircularProgress, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';

import CourseSchedule from '../components/courseSchedule';
import UserData from '../components/userData';
import * as InstructorAPI from '../api/instructor';
import * as Course from '../api/course';
import log from '../log';
import path from '../routes/path';

const useStyles = makeStyles((theme) => ({
  divider: {
    margin: theme.spacing(2),
  },
  btn: {
    marginBottom: theme.spacing(2),
  },
  header: {
    color: theme.palette.grey[700],
  },
  loader: {
    minHeight: 300,
  },
  extendedBtn: {
    marginRight: theme.spacing(1),
  },
  fab: {
    fontWeight: "bold",
    marginLeft: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  masked: {
    fontSize: "0.6rem",
    display: "inline",
  },
}));

export default function Instructor() {

  const history = useHistory();
  const classes = useStyles();
  const params = useParams();
  const [photo, setPhoto] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [insta, setInsta] = useState('');
  const [bio, setBio] = useState('');
  const [loader, setLoader] = useState(true);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    
    setCourses([]);

    if (params.id) {
      getInstructor(params.id);
    }
  }, [params]);


  async function getInstructor(id) {
    let instructor;

    try {
      instructor = await InstructorAPI.get(id);
    } catch (err) {
      // redirect to user's profile
      log.error("PROFILE::", err);
      history.push(path.profile);
      return;
    }

    if (!instructor || !instructor.data) {
      // redirect to user's profile
      history.push(path.profile);
      return;
    }

    if (instructor && instructor.data) {
      setUsername(instructor.data.username);
      setEmail(instructor.data.email);
      setFirstName(instructor.data.first_name);
      setLastName(instructor.data.last_name);
      setPhoto(instructor.data.photo_url);
      setBio(instructor.data.bio);
      if (instructor.data.social && instructor.data.social.instagram) setInsta(instructor.data.social.instagram);
      setLoader(false);
      getInstructorSchedule(instructor.data.id);
    }
  }

  async function getSchedule(filter) {
    let result;

    try {
      result = await Course.query(filter, {}, 500);
    } catch(err) {
      throw err;
    }

    log.debug("PROFILE:: course schedule result", result);

    if (result && result.data) {
      setCourses(result.data);
    }
  }

  async function getInstructorSchedule(userId) {
    let now = new Date();
    now.setHours(now.getHours() - 24);
    let schedFilter = { 
      instructor: userId,
      '$or': [ 
          { start_date: {"$gte" : now.toISOString() }},
          { recurring: { '$exists': true }}
      ],
      start_date: { '$exists': true },
    };

    return getSchedule(schedFilter);
  } 

  let loaderContent = (
    <Grid container direction="row" justify="center" alignItems="center" className={classes.loader}>
      <CircularProgress color="secondary" />
    </Grid>
  );
  
  let userContent = (
    <Grid>
      <Grid item>
        <UserData
          header={username}
          email={email}
          photo={photo}
          firstName={firstName}
          lastName={lastName}
          bio={bio}
          instagram={insta}
          showContactInfo={true}
        />
      </Grid>
      <Grid item>
        <Grid container direction="column" spacing={2}>
          <Grid item>
            <Typography variant="h2">Schedule</Typography>
          </Grid>
          <Grid item>
            <CourseSchedule course={courses} view="month" />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );

  let content = loaderContent;

  if (!loader) {
    content = userContent;
  }

  return (
    <Container>
      {content}
    </Container>
  );
}