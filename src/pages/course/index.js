import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { Container, Grid, Fab, Grow, Divider, Fade }  from '@material-ui/core';
import { Add, Clear } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';

import log from '../../log';
import * as Course from '../../api/course';
import { getNextSession } from '../../utils';
import CreateCourse from '../../components/form/editCourse';
import CourseFeature from '../../components/courseFeature';
import { store, actions } from '../../store';
import { isSameDay } from 'date-fns';
import DatePicker from '../../components/datePicker';
import Analytics from '../../utils/analytics';
import * as constants from '../../utils/constants';

const getUserSelector = createSelector([(state) => state.user.data], (user) => {
  return user;
});

const courseSelector = createSelector([state => state.course], (items) => {
  return items;
});

const userScheduleIDsSelector = createSelector([state => state.user.schedule], (items) => {
  return items.map(item => item.id);
});

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.common.backgroundGrey,
    maxWidth: 'inherit',
    paddingTop: theme.spacing(2),
    paddingRight: theme.spacing(5),
    paddingLeft: theme.spacing(5),
    paddingBottom: theme.spacing(3),
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
  },
  listContainer: {
    background: theme.palette.common.background,
    borderRadius: 7,
    border: '0.5px solid ' + theme.palette.common.border
  },
  listLabel: {
    paddingBottom: theme.spacing(2),
  },
  listItem: {
    width: '100%',
    maxWidth: 950,
    paddingRight: theme.spacing(4),
    paddingLeft: theme.spacing(4),
    '@media (max-width: 600px)': {
      paddingRight: theme.spacing(0),
      paddingLeft: theme.spacing(0),
    },
  }
}));

export default function CourseList() {
  const classes = useStyles();
  const currentUser = useSelector((state) => getUserSelector(state));
  const courseList = useSelector(state => courseSelector(state));
  const [allowCreate, setAllowCreate] = useState(false);
  const [courseData, setCourseData] = useState([]);
  const [selectedData, setSelectedData] = useState([]);
  const [selectPlus1Data, setSelectPlus1Data] = useState([]);
  const [selectPlus2Data, setSelectPlus2Data] = useState([]);
  const [selectPlus3Data, setSelectPlus3Data] = useState([]);
  const [selectPlus4Data, setSelectPlus4Data] = useState([]);
  const [selectPlus5Data, setSelectPlus5Data] = useState([]);
  const [selectPlus6Data, setSelectPlus6Data] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState();
  const [userSchedule, setUserSchedule] = useState([]);
  const schedule = useSelector(state => userScheduleIDsSelector(state));

  async function init() {
    let now = new Date();
    let filter = {
      $or: [
        { start_date: { $gte: now.toISOString() } },
        { end_date: { $gte: now.toISOString() } },
        { recurring: { $exists: true } }
      ],
      $and: [
        { private: false }
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

    setSelectedDate(now);
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

    if (courseData.length <= 0) return;

    let now = new Date();
    let selected = courseData.filter(item => {
      let next = getNextSession(now, item);

      if (next && next.date) {
        const d = new Date(next.date);
        if (isSameDay(d, selectedDate)) {
          return true;
        }
      }

      return false;
    })

    let selectedPlus1 = courseData.filter(item => {
      let next = getNextSession(now, item);

      if (next && next.date) {
        const d = new Date(next.date);
        let datePlus = new Date(selectedDate);
        datePlus.setDate(datePlus.getDate() + 1)
        if (isSameDay(d, datePlus)) {
          return true;
        }
      }

      return false;
    })

    let selectedPlus2 = courseData.filter(item => {
      let next = getNextSession(now, item);

      if (next && next.date) {
        const d = new Date(next.date);
        let datePlus = new Date(selectedDate);
        datePlus.setDate(datePlus.getDate() + 2)
        if (isSameDay(d, datePlus)) {
          return true;
        }
      }

      return false;
    })

    let selectedPlus3 = courseData.filter(item => {
      let next = getNextSession(now, item);

      if (next && next.date) {
        const d = new Date(next.date);
        let datePlus = new Date(selectedDate);
        datePlus.setDate(datePlus.getDate() + 3)
        if (isSameDay(d, datePlus)) {
          return true;
        }
      }

      return false;
    })

    let selectedPlus4 = courseData.filter(item => {
      let next = getNextSession(now, item);

      if (next && next.date) {
        const d = new Date(next.date);
        let datePlus = new Date(selectedDate);
        datePlus.setDate(datePlus.getDate() + 4)
        if (isSameDay(d, datePlus)) {
          return true;
        }
      }

      return false;
    })

    let selectedPlus5 = courseData.filter(item => {
      let next = getNextSession(now, item);

      if (next && next.date) {
        const d = new Date(next.date);
        let datePlus = new Date(selectedDate);
        datePlus.setDate(datePlus.getDate() + 5)
        if (isSameDay(d, datePlus)) {
          return true;
        }
      }

      return false;
    })

    let selectedPlus6 = courseData.filter(item => {
      let next = getNextSession(now, item);

      if (next && next.date) {
        const d = new Date(next.date);
        let datePlus = new Date(selectedDate);
        datePlus.setDate(datePlus.getDate() + 6)
        if (isSameDay(d, datePlus)) {
          return true;
        }
      }

      return false;
    })

    setSelectedData(selected);
    setSelectPlus1Data(selectedPlus1);
    setSelectPlus2Data(selectedPlus2);
    setSelectPlus3Data(selectedPlus3);
    setSelectPlus4Data(selectedPlus4);
    setSelectPlus5Data(selectedPlus5);
    setSelectPlus6Data(selectedPlus6);

  }, [courseData, selectedDate])

  useEffect(() => {
    if (currentUser.type && currentUser.type !== 'standard') {
      setAllowCreate(true);
    } else {
      setAllowCreate(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (schedule) {
      setUserSchedule(schedule);
    }
  }, [schedule])

  const selectDateHandler = (d) => {
    const newDate = new Date(d);
    setSelectedDate(newDate);
  }

  const toggleCreateForm = () => {
    if (showForm) {
      setShowForm(false);
    } else {
      setShowForm(true);
    }
  };

  // Creates the Date header based on selected date and index from it
  const createHeader = (index) => {
    let d = new Date(selectedDate);
    d.setDate(d.getDate() + index);
    const zone = d.toLocaleTimeString('en-us',{timeZoneName:'short'}).split(' ')[2]
    return `${constants.daysLarge[d.getDay()]}, ${constants.monthsLarge[d.getMonth()]} ${d.getDate()} (${zone})`;
  }

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

  return (
    <Analytics title="Indoorphins.fit">
      <Container justify='center' className={classes.root}>
        {createButton}
        {createContent}
        <DatePicker selectDateHandler={selectDateHandler} startDate={new Date()} />
        <Fade in={true}>
          <Grid container direction="column" alignContent='center' spacing={3}>
            <Grid className={classes.listItem}>
              <CourseFeature 
              id="todays" 
              header={createHeader(0)} 
              items={selectedData} 
              schedule={userSchedule} 
              />
            </Grid> 
            <Grid className={classes.listItem}>
              <CourseFeature 
              id="todays-plus1" 
              header={createHeader(1)} 
              items={selectPlus1Data} 
              schedule={userSchedule} 
              />
            </Grid>
            <Grid className={classes.listItem}>
              <CourseFeature 
              id="todays-plus2" 
              header={createHeader(2)} 
              items={selectPlus2Data} 
              schedule={userSchedule} 
              />
            </Grid>
            <Grid className={classes.listItem}>
              <CourseFeature 
              id="todays-plus3" 
              header={createHeader(3)} 
              items={selectPlus3Data} 
              schedule={userSchedule} 
              />
            </Grid>
            <Grid className={classes.listItem}>
              <CourseFeature 
              id="todays-plus4" 
              header={createHeader(4)} 
              items={selectPlus4Data} 
              schedule={userSchedule} 
              />
            </Grid>
            <Grid className={classes.listItem}>
              <CourseFeature 
              id="todays-plus5" 
              header={createHeader(5)} 
              items={selectPlus5Data} 
              schedule={userSchedule} 
              />
            </Grid>
            <Grid className={classes.listItem}>
              <CourseFeature 
              id="todays-plus6" 
              header={createHeader(6)} 
              items={selectPlus6Data} 
              schedule={userSchedule} 
              />
            </Grid>
          </Grid>
        </Fade>
      </Container>
    </Analytics>
  );
}
