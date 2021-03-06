import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { Container, Grid, Fab, Grow, Divider, Typography, Fade, Paper }  from '@material-ui/core';
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

const userSchedSelector = createSelector([state => state.user.schedule], (items) => {
  return items;
});

const courseSelector = createSelector([state => state.course], (items) => {
  return items;
});

const useStyles = makeStyles((theme) => ({
  root: {
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
    paddingRight: theme.spacing(4),
    paddingLeft: theme.spacing(4),
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
    console.log("INDEX selectedDate - ", selectedDate);
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
    console.log("INDEX Selected array ", selected)

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

  const selectDateHandler = (d) => {
    const newDate = new Date(d);
    console.log("SELECT DATE HANDLER WITH DATE ", newDate);
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

  // let dataContent
  // if (selectedData && selectedData.length > 0) {
  //   dataContent = (
  //     <Grid className={classes.listItem}>
  //       <CourseFeature id="todays" header={createHeader(0)} items={selectedData} />
  //     </Grid>
  //   )
  // }

  // let data1Content;
  // if (selectPlus1Data && selectPlus1Data.length > 0) {
  //   data1Content = (
  //     <Grid className={classes.listItem}>
  //       <CourseFeature id="todays" header={createHeader(1)} items={selectPlus1Data} />
  //     </Grid>
  //   )
  // }

  // let data2Content;
  // if (selectPlus2Data && selectPlus2Data.length > 0) {
  //   data2Content = (
  //     <Grid className={classes.listItem}>
  //       <CourseFeature id="todays-plus2" header={createHeader(2)} items={selectPlus2Data} />
  //     </Grid>
  //   )
  // }

  // let data3Content;
  // if (selectPlus3Data && selectPlus3Data.length > 0) {
  //   data3Content = (
  //     <Grid className={classes.listItem}>
  //       <CourseFeature id="todays-plus3" header={createHeader(3)} items={selectPlus3Data} />
  //     </Grid>
  //   )
  // }

  // let data4Content;
  // if (selectPlus4Data && selectPlus4Data.length > 0) {
  //   data4Content = (
  //     <Grid className={classes.listItem}>
  //       <CourseFeature id="todays-plus4" header={createHeader(4)} items={selectPlus4Data} />
  //     </Grid>
  //   )
  // }

  // let data5Content;
  // if (selectPlus5Data && selectPlus5Data.length > 0) {
  //   data5Content = (
  //     <Grid className={classes.listItem}>
  //       <CourseFeature id="todays-plus5" header={createHeader(5)} items={selectPlus5Data} />
  //     </Grid>
  //   )
  // }

  // let data6Content;
  // if (selectPlus6Data && selectPlus6Data.length > 0) {
  //   data6Content = (
  //     <Grid className={classes.listItem}>
  //       <CourseFeature id="todays-plus6" header={createHeader(6)} items={selectPlus6Data} />
  //     </Grid>
  //   )
  // }

  return (
    <Analytics title="Indoorphins.fit">
      <Container justify='center' className={classes.root}>
        {createButton}
        {createContent}
        <DatePicker selectDateHandler={selectDateHandler} startDate={new Date()} />
        <Fade in={true}>
          <Grid container direction="column" spacing={3}>
            <Grid className={classes.listItem}>
              <CourseFeature id="todays-plus1" header={createHeader(0)} items={selectedData} />
            </Grid> 
            <Grid className={classes.listItem}>
              <CourseFeature id="todays-plus1" header={createHeader(1)} items={selectPlus1Data} />
            </Grid>
            <Grid className={classes.listItem}>
              <CourseFeature id="todays-plus2" header={createHeader(2)} items={selectPlus2Data} />
            </Grid>
            <Grid className={classes.listItem}>
              <CourseFeature id="todays-plus3" header={createHeader(3)} items={selectPlus3Data} />
            </Grid>
            <Grid className={classes.listItem}>
              <CourseFeature id="todays-plus4" header={createHeader(4)} items={selectPlus4Data} />
            </Grid>
            <Grid className={classes.listItem}>
              <CourseFeature id="todays-plus5" header={createHeader(5)} items={selectPlus5Data} />
            </Grid>
            <Grid className={classes.listItem}>
              <CourseFeature id="todays-plus6" header={createHeader(6)} items={selectPlus6Data} />
            </Grid>
          </Grid>
        </Fade>
      </Container>
    </Analytics>
  );
}
