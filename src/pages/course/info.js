import React, { useEffect, useState, useRef } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  Container, 
  Grid, 
  Typography, 
  Card, 
  LinearProgress, 
  useMediaQuery, 
  makeStyles,
} from '@material-ui/core';
import { Photo, RecordVoiceOver } from '@material-ui/icons';
import Alert from '@material-ui/lab/Alert';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { isSameDay, isWithinInterval, sub, add } from 'date-fns';

import { 
  AvailableSpots,
  Cancel,
  Cost, 
  Duration, 
  JoinSession,
  Message,
  OtherCourseInfo,
  Signup,
  StartTime, 
  Participants 
} from '../../components/courseInfo/index';
import { store, actions } from '../../store';
import * as Course from '../../api/course';
import * as Stripe from '../../api/stripe';
import { classJoined } from '../../api/message';
import log from '../../log';
import path from '../../routes/path';
import CoursePayment from '../../components/form/coursePayment';
import Instagram from '../../components/instagram';
import EditorContent from '../../components/editorContent';
import { format } from 'date-fns';
import { createCalenderEvent } from '../../utils/index';

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(4),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
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
  instructorContainer: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    cursor: "default",
    backgroundColor: theme.palette.grey[200],
  },
  photo: {
    minHeight: 400,
    maxHeight: 550,
    width: "100%",
    objectFit: "cover",
    borderRadius: "4px",
    '@media (max-width: 900px)': {
      minHeight: 350,
      maxHeight: 500,
    },
    '@media (max-width: 600px)': {
      minHeight: 300,
      maxHeight: 450,
    },
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
  consentContainer: {
    flexWrap: "nowrap",
    paddingTop: theme.spacing(3),
    paddingRight: theme.spacing(1),
    marginLeft: theme.spacing(1)
  },
  alert: {
    marginBottom: theme.spacing(1),
  },
  userAccept: {
    fontStyle: "italic",
    fontSize: "0.9rem",
  },
  icon: {
    display: 'flex',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  link: {
    cursor: "pointer",
    textDecoration: "none",
    color: theme.palette.primary.main,
  }
}));

const getUserSelector = createSelector([state => state.user], (user) => {
  return user.data;
});

const paymentDataSelector = createSelector([state => state.user], (data) => {
  return data.paymentData;
});

const selectDefaultPaymentMethod = createSelector(
  paymentDataSelector,
  pd => pd.methods.filter(item => item.default)
);

const courseDataSelector = createSelector([state => state.course], (data) => {
  return data;
});

export default function CourseInfo() {

  const classes = useStyles();
  const history = useHistory();
  const params = useParams();
  const currentUser = useSelector(state => getUserSelector(state));
  const paymentData = useSelector(state => paymentDataSelector(state));
  const courseData = useSelector(state => courseDataSelector(state))
  const defaultPaymentMethod = useSelector(state => selectDefaultPaymentMethod(state));
  const paymentMethod = useRef(defaultPaymentMethod);
  const [course, setCourse] = useState('');
  const [needsPaymentMethod, setNeedsPaymentMethod] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [errMessage, setErrMessage] = useState(null);

  const sml = useMediaQuery('(max-width:600px)');
  const med = useMediaQuery('(max-width:900px)');

  useEffect(() => {
    document.querySelector('body').scrollTo(0, 0);
  }, []);

  useEffect(() => {

    if (params.id && courseData.length > 0) {
      let existing = courseData.filter(item => {
        return item.id === params.id;
      })[0];

      if (existing) setCourse(existing);
    }

  }, [courseData, params]);


  useEffect(() => {
    getCourse(params.id, currentUser);
  }, [params, currentUser]);

  useEffect(() => {
    if(defaultPaymentMethod) {
      paymentMethod.current = defaultPaymentMethod;
    }
  }, [defaultPaymentMethod]);

  useEffect(() => {

    if (!currentUser.id) {
      return;
    }

    if (paymentData.id) { 
      return;
    }

    Stripe.getPaymentMethods().then(result => {
      return store.dispatch(actions.user.setPaymentData(result));
    })
    .catch(err => {
      log.error("PROFILE:: update user payment data", err);
    });

  }, [paymentData.id, currentUser.id]);

  function birthdayHelper(user, course) {
    if (user.birthday) {
      // Check range extending to 8 days on either side of today to ensure time differences don't miss a valid birthday
      const bday = new Date(user.birthday);
      const start = sub(new Date(course.start_date), {days: 8});
      const end = add(new Date(course.start_date), {days: 8});
      bday.setFullYear(start.getFullYear());

      if (isSameDay(bday, new Date(course.start_date)) || isWithinInterval(bday, {start: start, end: end})) {
        return true;
      }
    }
    return false;
  }

  async function getParticipantsData(course) {
    let participants;
    let cls = Object.assign({}, course);
    try {
      participants = await Course.getParticipants(cls.id)
    } catch (err) {
      log.warn("COURSE INFO:: unable to fetch list of participants");
    }
    
    if (participants) {
      let data = participants.map(item => {
        item.showBirthday = birthdayHelper(item, cls);
        return item;
      });

      cls.participants = data;
      setCourse(cls);
    }
  }

  async function getCourse(id, currentUser) {
    let cls;

    try {
      cls = await Course.get(id);
    } catch (err) {
      log.error("COURSE INFO:: get course details", err);
    }

    if (!cls || !cls.id) {
      log.debug("COURSE INFO:: course not found")
      return;
    }

    log.debug("COURSE INFO:: got course details", cls);
    log.info("SET COURSE ", cls);
    setCourse(cls);

    if (cls.instructor.id === currentUser.id || currentUser.type === 'admin') {
      getParticipantsData(cls)
    }
  }

  const showSignupForm = async function() {
    setNeedsPaymentMethod(true);
  }

  const cancelClassHandler = async function () {
    setPaymentProcessing(true);
    
    try {
      await Course.remove(params.id);
    } catch (err) {
      setErrMessage({severity: 'error', message: 'Class failed to cancel'})
      setPaymentProcessing(false);
      return log.error("COURSE INFO: course cancel ", err);
    }

    setPaymentProcessing(false);
    history.push(path.home);
  }

  const courseSignupHandler = function () {

    setErrMessage({severity: "info", message: "Processing..."});
    setPaymentProcessing(true);
    setNeedsPaymentMethod(false);

    log.debug("local payment", paymentMethod);

    let defaultPaymentMethod = paymentMethod.current[0];
    let paymentMethodId = defaultPaymentMethod ? defaultPaymentMethod.id : "none";

    if (course.cost && course.cost > 0 && !defaultPaymentMethod && currentUser.type === "standard") {
      setPaymentProcessing(false);
      setNeedsPaymentMethod(true);
      setErrMessage({severity: "error", message: "No default payment method. Please add one below."});
      return;
    }

    Stripe.createPaymentIntent(paymentMethodId, course.id)
      .then(result => {
        setCourse({...result.course});
        store.dispatch(actions.user.addScheduleItem(result.course));
        setPaymentProcessing(false);
        setNeedsPaymentMethod(false);
        setErrMessage({severity: "success", message: result.message});
      })
      .catch(err => {
        setPaymentProcessing(false);
        showSignupForm();
        setErrMessage({severity: "error", message: err.message});
        return err;
      })
      .then((err) => {
        if (err) return;

        // Send class joined email
        const start = format(new Date(course.start_date), "iiii, MMMM do");
        const s = new Date(course.start_date);
        let end = new Date(course.start_date);
        end.setMinutes(end.getMinutes() + course.duration);

        const regex = /[^\w\s\d-!*$#()&^@]/g;
        const cal = createCalenderEvent(course.title.replace(regex, ""), 'indoorphins.fit', course.id, s, end, false)

        let emailAttachment = null;

        try {
          emailAttachment = btoa(cal.toString());
        } catch(e) {
          log.error("create buffer error", e);
        }
        
        return classJoined(start, course.id, emailAttachment);
      }).catch(err => {
        setErrMessage({severity: "error", message: err.message});
      })

  }

  const courseLeaveHandler = async function () {
    let updatedCourse;
    setPaymentProcessing(true);
    setErrMessage({severity: "info", message: "Processing..."});

    try {
      updatedCourse = await Stripe.refundPayment(course.id);
    } catch (err) {
      log.error("COURSE INFO: course leave", err);
      setPaymentProcessing(false);
      return setErrMessage({severity: "error", message: err.message});
    }

    setPaymentProcessing(false);
    setErrMessage({severity: "success", message: updatedCourse.message});
    setCourse(updatedCourse.course);
    store.dispatch(actions.user.removeScheduleItem(updatedCourse.course));
  }

  let layout = null;
  if (sml) {
    layout = {
      main: "column",
      courseDetailsDirection: "column",
      courseDetailsJustify: "flex-start",
      courseDetailsSize: 12,
      courseCostSize: 12,
      costSize: 4,
      spotsSize: 4,
      coursePhotoDirection: "column",
      coursePhotoSize: "auto",
      actionBtnDirection: "column",
      actionBtnSize: "auto",
      instructorDetailsDirection: "column",
      instructorDetailsSize: 12,
    };
  } else if (med) {
    layout = {
      main: "column",
      courseDetailsDirection: "column",
      courseDetailsJustify: "flex-start",
      courseDetailsSize: 12,
      courseCostSize: 12,
      costSize: 4,
      spotsSize: 4,
      coursePhotoDirection: "row",
      coursePhotoSize: 4,
      actionBtnDirection: "row",
      actionBtnSize: 6,
      instructorDetailsDirection: "row",
      instructorDetailsSize: 6,
    }
  } else {
    layout = {
      main: "column",
      courseDetailsDirection: "row",
      courseDetailsJustify: "space-between",
      courseDetailsSize: 8,
      courseCostSize: 4,
      costSize: "auto",
      spotsSize: "auto",
      coursePhotoDirection: "row",
      coursePhotoSize: 4,
      actionBtnDirection: "row",
      actionBtnSize: 3,
      instructorDetailsDirection: "column",
      instructorDetailsSize: 12,
    }
  }

  let paymentProcessingContent = null;
  if (paymentProcessing) {
    paymentProcessingContent = ( 
      <LinearProgress color="primary" />
    );
  }

  let errorContent = null;
  if(errMessage) {
    errorContent = (
      <Grid className={classes.alert}>
        <Alert severity={errMessage.severity} >{errMessage.message}</Alert>
        {paymentProcessingContent}
      </Grid>
    );
  }

  let instructorContent = null;

  if (course.instructor) {
    let insta = null;
    if (course.instructor.social && course.instructor.social.instagram) {
      insta = (
        <Grid item style={{width: "100%"}}>
          <Instagram instagram={course.instructor.social.instagram} />
        </Grid>
      );
    }

    instructorContent = (
      <Card className={classes.instructorContainer}>
        <Grid container direction="column" spacing={2}>
          <Grid 
            item 
            container 
            direction="row"
            justify="flex-start"
            alignItems="center"
            alignContent="center"
            spacing={2}
          >
            <Grid item className={classes.icon}>
              <RecordVoiceOver color="primary" />
            </Grid>
            <Grid item>
              <Typography variant="h5">
                {course.instructor.username}
              </Typography>
            </Grid>
          </Grid>
          {insta}
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

  let paymentContent = null;
  if (needsPaymentMethod) {
    let hideAdd = true;

    if (!defaultPaymentMethod[0]) {
      hideAdd = false;
    }

    paymentContent = (<CoursePayment onSubmit={courseSignupHandler} hideAddCard={hideAdd} classes={classes} />);
  }

  let courseMetaData = (
    <Grid container direction="column" spacing={2}>
      <Grid item container direction="row" justify="flex-end" spacing={2}>
        <Grid item xs={layout.costSize}>
          <Cost course={course} classes={classes} />
        </Grid>
        <Grid item xs={layout.costSize}>
          <Duration course={course} classes={classes} />
        </Grid>
        <Grid item xs={layout.spotsSize}>
          <AvailableSpots course={course} classes={classes} />
        </Grid>               
      </Grid>
      <Grid item container direction={layout.instructorDetailsDirection} spacing={2}>
        <Grid item xs={layout.instructorDetailsSize} style={{width: "100%"}}>
          {instructorContent}
        </Grid>
        <Grid item xs={layout.instructorDetailsSize} style={{width: "100%"}}>
          <Participants currentUser={currentUser} course={course} />
        </Grid>
      </Grid>
    </Grid>
  );

  let courseDetails = (
    <Grid 
      container
      direction={layout.courseDetailsDirection}
      justify={layout.courseDetailsJustify}
      spacing={2}
      style={{flexWrap: "nowrap"}}
    >
      <Grid item xs={layout.courseDetailsSize}>
        <Grid container direction={layout.coursePhotoDirection} justify="flex-start" spacing={2}>
          <Grid item xs={layout.coursePhotoSize}>
            {photoContent}
          </Grid>
          <Grid item xs>
            <Typography variant="h1" className={classes.title}>
              {course.title}
            </Typography>
            <StartTime course={course} classes={classes} />
            <EditorContent content={course.description} />
            <OtherCourseInfo />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={layout.courseCostSize} style={{width:"100%"}}>
        {courseMetaData}
      </Grid>
    </Grid>
  );

  return (
    <Container className={classes.root}>
      <Grid container direction={layout.main} spacing={2}>
        <Grid item container>
          {courseDetails}
        </Grid>
        <Grid item>
          {errorContent}
          {paymentContent}
        </Grid>
        <Grid item container>
          <Grid container direction={layout.actionBtnDirection} justify="flex-end" spacing={2}>
            <JoinSession currentUser={currentUser} course={course} size={layout.actionBtnSize} />
            <Signup
              currentUser={currentUser}
              course={course}
              size={layout.actionBtnSize}
              leaveHandler={courseLeaveHandler}
              paidHandler={showSignupForm}
              freeHandler={courseSignupHandler}
            />
            <Cancel 
              currentUser={currentUser}
              course={course}
              size={layout.actionBtnSize}
              onCancel={cancelClassHandler}
            />
          </Grid>
        </Grid>
        <Grid item>
          <Message currentUser={currentUser} course={course} />
        </Grid>
      </Grid>
    </Container>
  )
}