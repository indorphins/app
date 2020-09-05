import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { Container, Grid, Fab, Grow, Divider, Typography }  from '@material-ui/core';
import { Add, Clear } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';

import log from '../../log';
import * as Course from '../../api/course';
import { getNextSession } from '../../utils';
import CreateCourse from '../../components/form/editCourse';
import CourseFeature from '../../components/courseFeature';
import InstructorFeature from '../../components/instructorFeature';

const getUserSelector = createSelector([(state) => state.user.data], (user) => {
  return user;
});

const userSchedSelector = createSelector([state => state.user.schedule], (items) => {
  return items;
});

const useStyles = makeStyles((theme) => ({
  content: {},
  extendedBtn: {
    marginRight: theme.spacing(1),
  },
  divider: {
    margin: theme.spacing(2),
  },
  fab: {
    fontWeight: "bold",
  },
  noClassContainer: {
    marginBottom: theme.spacing(2),
  }
}));

export default function CourseList() {
  const classes = useStyles();
  const currentUser = useSelector((state) => getUserSelector(state));
  const schedule = useSelector(state => userSchedSelector(state));
  const [allowCreate, setAllowCreate] = useState(false);
  const [courseData, setCourseData] = useState([]);
  const [upcomingData, setUpcomingData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [morningData, setMorningData] = useState([]);
  const [middayData, setMiddayData] = useState([]);
  const [eveningData, setEveningData] = useState([]);    
  const [scheduleData, setScheduleData] = useState([]);
  const [showForm, setShowForm] = useState(false);

  async function init() {
    let now = new Date();
    let filter = {
      $or: [
        { start_date: { $gte: now.toISOString() } },
        { end_date: { $gte: now.toISOString() } },
        { recurring: { $exists: true } }
      ]
    };
    let order = {
      start_date: 'asc',
    };
    let result = [];

    try {
      result = await Course.query(filter, order, 1000);
    } catch(err) {
      return log.error("COURSE WIDGET:: query for courses", filter, order, err);
    }

    setCourseData([].concat(result.data));
  }

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {

    if (schedule && schedule.length <= 0) {
      return setScheduleData([]);
    }

    let now = new Date();
    let filtered = schedule.filter(item => {
      if(getNextSession(now, item)) {
        return true;
      }
      return false;
    });

    setScheduleData([].concat(filtered));

  }, [schedule]);

  useEffect(() => {

    if (courseData.length <= 0) return;

    let now = new Date();

    let upcoming = courseData.filter(item => {
      return !item.recurring;
    });

    let weekly = courseData.filter(item => {
      return item.recurring;
    });

    let morning = courseData.filter(item => {
      let next = getNextSession(now, item);

      if (next && next.date) {
        let d = new Date(next.date);
        let hour = d.getHours();
        if (hour >= 0 && hour < 11) {
          return true;
        }
      }

      return false;
    });

    let mid = courseData.filter(item => {
      let next = getNextSession(now, item);

      if (next && next.date) {
        let d = new Date(next.date);
        let hour = d.getHours();
        if (hour >= 11 && hour <= 16) {
          return true;
        }
      }

      return false;
    });

    let evening = courseData.filter(item => {
      let next = getNextSession(now, item);

      if (next && next.date) {
        let d = new Date(next.date);
        let hour = d.getHours();
        if (hour > 16) {
          return true;
        }
      }

      return false;
    });

    setUpcomingData([].concat(upcoming));
    setWeeklyData([].concat(weekly));
    setMorningData([].concat(morning));
    setMiddayData([].concat(mid));
    setEveningData([].concat(evening));

  }, [courseData])

  useEffect(() => {
    if (currentUser.type && currentUser.type !== 'standard') {
      setAllowCreate(true);
    } else {
      setAllowCreate(false);
    }
  }, [currentUser]);

  const toggleCreateForm = function() {
    if (showForm) {
      setShowForm(false);
    } else {
      setShowForm(true);
    }
  };

  let createButton = null;
  if (allowCreate) {
    let btn = (
      <Fab
        color="secondary"
        variant="extended"
        aria-label="create class"
        className={classes.fab}
        onClick={toggleCreateForm}
      >
        <Add className={classes.extendedBtn} />
        Class
      </Fab>
    );

    if (showForm) {
      btn = (
        <Fab color="primary" aria-label="cancel" onClick={toggleCreateForm}>
          <Clear />
        </Fab>
      )
    }

    createButton = (
      <Grid  container direction="row" justify="flex-end" alignItems="center">
        {btn}
      </Grid>
    )
  }

  let createContent = null
  if (showForm) {
    createContent = (
      <Grow in={showForm}>
        <Grid>
          <CreateCourse
            instructorId={currentUser.id}
            photoUrl={currentUser.photo_url}
            spotsDisabled={false}
            costDisabled={false}
          />
          <Divider className={classes.divider} />
        </Grid>
      </Grow>
    );
  }


  let myClassesContent;

  if (scheduleData && scheduleData.length > 0) {
    myClassesContent = (
      <Grid item>
        <CourseFeature header="My Classes" items={scheduleData} />
      </Grid>
    );    
  } else {
    myClassesContent = (
      <Grid item>
        <Grid container direction="column" justify="center" alignItems="center" spacing={1}>
          <Grid item>
            <Typography variant='h3'>Book a class below to get started</Typography>
          </Grid>
        </Grid>
      </Grid>
    );
  }

  return (
    <Container justify='center'>
      {createButton}
      {createContent}
      <Grid container direction="column" className={classes.content} spacing={3}>
        {myClassesContent}
        <Grid item>
          <CourseFeature header="Upcoming Classes" items={upcomingData} />
        </Grid>
        <Grid item>
          <CourseFeature header="Morning Classes" items={morningData} />
        </Grid>
        <Grid item>
          <CourseFeature header="Mid Day Classes" items={middayData} />
        </Grid>
        <Grid item>
          <CourseFeature header="Evening Classes" items={eveningData} />
        </Grid>
        <Grid item>
          <CourseFeature header="Weekly Classes" items={weeklyData} />
        </Grid>
        <Grid item>
          <InstructorFeature
            limit={500}
            header='Instructors'
          />
        </Grid>
      </Grid>
    </Container>
  );
}
