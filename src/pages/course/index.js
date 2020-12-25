import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { Container, Grid, Fab, Grow, Divider, Typography, Fade }  from '@material-ui/core';
import { Add, Clear } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';

import log from '../../log';
import * as Course from '../../api/course';
import { getNextSession } from '../../utils';
import CreateCourse from '../../components/form/editCourse';
import CourseFeature from '../../components/courseFeature';
import { store, actions } from '../../store';
import { isMonday, isSunday, isSaturday, isFriday, isThursday, isWednesday, isTuesday } from 'date-fns';
import Analytics from '../../utils/analytics';

const getUserSelector = createSelector([(state) => state.user.data], (user) => {
  return user;
});

const userSchedSelector = createSelector([state => state.user.schedule], (items) => {
  return items;
});

const courseSelector = createSelector([state => state.course], (items) => {
  return items;
});

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(2),
  },
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
  },
  emptySched: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  }
}));

export default function CourseList() {
  const classes = useStyles();
  const currentUser = useSelector((state) => getUserSelector(state));
  const schedule = useSelector(state => userSchedSelector(state));
  const courseList = useSelector(state => courseSelector(state));
  const [allowCreate, setAllowCreate] = useState(false);
  const [courseData, setCourseData] = useState([]);
  const [upcomingData, setUpcomingData] = useState([]);
  const [scheduleData, setScheduleData] = useState([]);
  const [mondayData, setMondayData] = useState([]);
  const [tuesdayData, setTuesdayData] = useState([])
  const [wednesdayData, setWednesdayData] = useState([]);
  const [thursdayData, setThursdayData] = useState([]);
  const [fridayData, setFridayData] = useState([]);
  const [saturdayData, setSaturdayData] = useState([]);
  const [sundayData, setSundayData] = useState([]);
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

    store.dispatch(actions.course.set(result.data))
  }

  useEffect(() => {
    if (courseList.length > 0) {
      setCourseData(courseList);
    }
  }, [courseList]);

  useEffect(() => {
    document.title="Classes";
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
    
    let mondays = courseData.filter(item => {
      let next = getNextSession(now, item);

      if (next && next.date) {
        
        const d = new Date(next.date);
        if (isMonday(d)) {
          return true;
        }
      }

      return false;
    })

    let tuesdays = courseData.filter(item => {
      let next = getNextSession(now, item);

      if (next && next.date) {
        const d = new Date(next.date);
        if (isTuesday(d)) {
          return true;
        }
      }

      return false;
    })

    let wednesdays = courseData.filter(item => {
      let next = getNextSession(now, item);

      if (next && next.date) {
        const d = new Date(next.date);
        if (isWednesday(d)) {
          return true;
        }
      }

      return false;
    })

    let thursdays = courseData.filter(item => {
      let next = getNextSession(now, item);

      if (next && next.date) {
        const d = new Date(next.date);
        if (isThursday(d)) {
          return true;
        }
      }

      return false;
    })

    let fridays = courseData.filter(item => {
      let next = getNextSession(now, item);

      if (next && next.date) {
        const d = new Date(next.date);
        if (isFriday(d)) {
          return true;
        }
      }

      return false;
    })

    let saturdays = courseData.filter(item => {
      let next = getNextSession(now, item);

      if (next && next.date) {
        const d = new Date(next.date);
        if (isSaturday(d)) {
          return true;
        }
      }

      return false;
    })

    let sundays = courseData.filter(item => {
      let next = getNextSession(now, item);

      if (next && next.date) {
        const d = new Date(next.date);
        if (isSunday(d)) {
          return true;
        }
      }

      return false;
    })

    setUpcomingData([].concat(upcoming));
    setMondayData([].concat(mondays));
    setTuesdayData([].concat(tuesdays));
    setWednesdayData([].concat(wednesdays));
    setThursdayData([].concat(thursdays));
    setFridayData([].concat(fridays));
    setSaturdayData([].concat(saturdays));
    setSundayData([].concat(sundays));

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
        color="primary"
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
        <CourseFeature id="schedule" header="My Classes" items={scheduleData} />
      </Grid>
    );    
  } else {
    myClassesContent = (
      <Grid item>
        <Typography variant="h5">
          My Classes
        </Typography>
        <Grid container direction="column" justify="center" alignItems="center" spacing={1}>
          <Grid item>
            <Typography className={classes.emptySched} variant='h3'>Book a class below to get started</Typography>
          </Grid>
        </Grid>
      </Grid>
    );
  }

  return (
    <Analytics title="Indoorphins.fit">
      <Container justify='center' className={classes.root}>
        {createButton}
        {createContent}
        <Fade in={true}>
          <Grid container direction="column" className={classes.content} spacing={3}>
            {myClassesContent}
            <Grid item>
              <CourseFeature id="upcoming" header="All Upcoming Classes" items={upcomingData} />
            </Grid>
            <Grid item>
              <CourseFeature id="monday" header="Monday Classes" items={mondayData} />
            </Grid>
            <Grid item>
              <CourseFeature id="tuesday" header="Tuesday Classes" items={tuesdayData} />
            </Grid>
            <Grid item>
              <CourseFeature id="wednesday" header="Wednesday Classes" items={wednesdayData} />
            </Grid>
            <Grid item>
              <CourseFeature id="thursday" header="Thursday Classes" items={thursdayData} />
            </Grid>
            <Grid item>
              <CourseFeature id="friday" header="Friday Classes" items={fridayData} />
            </Grid>
            <Grid item>
              <CourseFeature id="saturday" header="Saturday Classes" items={saturdayData} />
            </Grid>
            <Grid item>
              <CourseFeature id="sunday" header="Sunday Classes" items={sundayData} />
            </Grid>
          </Grid>
        </Fade>
      </Container>
    </Analytics>
  );
}
