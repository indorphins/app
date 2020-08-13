import React, { useEffect, useState, useRef } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { 
  Button,  
  Container, 
  Grid, 
  Typography, 
  Card, 
  LinearProgress, 
  useMediaQuery, 
  makeStyles, 
  Modal, 
  Fade 
} from '@material-ui/core';
import { Photo, RecordVoiceOver } from '@material-ui/icons';
import Alert from '@material-ui/lab/Alert';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import { store, actions } from '../../store';
import CreateMessage from '../../components/form/createMessage'
import * as Course from '../../api/course';
import * as Stripe from '../../api/stripe';
import log from '../../log';
import path from '../../routes/path';
import { AvailableSpots, Cost, Duration, StartTime, Participants } from '../../components/courseInfo/index';
import CoursePayment from '../../components/form/coursePayment';

import { getNextSession } from '../../utils';
import { OtherCourseInfo } from '../../components/otherCourseInfo';
import Instagram from '../../components/instagram';

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
  link: {
    cursor: "pointer",
    textDecoration: "none",
    color: theme.palette.primary.main,
  },
  modal: {
    display: 'flex',
    padding: theme.spacing(1),
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalContent: {
    background: 'white',
    borderRadius: '4px',
    padding: theme.spacing(2),
    outline: 0
  },
  modalBtn: {
    width: '40%',
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(1)
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

export default function CourseInfo() {

  const classes = useStyles();
  const history = useHistory();
  const params = useParams();
  const currentUser = useSelector(state => getUserSelector(state));
  const paymentData = useSelector(state => paymentDataSelector(state));
  const defaultPaymentMethod = useSelector(state => selectDefaultPaymentMethod(state));
  const paymentMethod = useRef(defaultPaymentMethod);
  const [course, setCourse] = useState('');
  const [signup, setSignup] = useState(null);
  const [notify, setNotify] = useState(null);
  const [makeMessage, setMakeMessage] = useState(false);
  const [joinSession, setJoinSession] = useState(null);
  const [needsPaymentMethod, setNeedsPaymentMethod] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [errMessage, setErrMessage] = useState(null);
  const [cancel, setCancel] = useState(null);
  const [cancellingClass, setCancellingClass] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  async function getCourse(id) {
    let cls;

    try {
      cls = await Course.get(id);
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

    if (typeof cls.instructor === String) {
      cls.instructor = JSON.parse(cls.instructor);
    }
    log.info("SET COURSE ", cls);
    setCourse(cls);
  }

  useEffect(() => {
    document.querySelector('body').scrollTo(0, 0);
  }, []);

  useEffect(() => {
    getCourse(params.id);
  }, [params]);

  useEffect(() => {

    if (!course.id) return;

    let instructor = course.instructor;

    if (currentUser.id === instructor.id || currentUser.type === 'admin') {
      setCancel(
        <Button
          variant="contained"
          disabled={cancellingClass}
          color="secondary"
          onClick={confirmCancelHandler}
          style={{width:"100%"}}
        >
          Cancel Class
        </Button>
      )
      setMakeMessage(true);
    }

  }, [currentUser, course]);

  useEffect(() => {

    if (!course.id) return;

    if (!currentUser.id) {
      setSignup((
        <Button 
          variant="contained"
          color="secondary"
          onClick={goToLogin}
          style={{width:"100%"}}
        >
          Login to Book Class
        </Button>
      ));
      return;
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
      }

      if (enrolled) {
        setSignup((
          <Button
            variant="contained"
            color="secondary"
            onClick={courseLeaveHandler}
            style={{width:"100%"}}
          >
            Leave Class
          </Button>
        ));
        return;
      }
    }

    if (course.available_spots > 0) {
      if (course.cost && course.cost > 0) {
        setSignup((
          <Button
            variant="contained"
            color="secondary"
            onClick={showSignupForm}
            style={{width:"100%"}}
          >
            Book Class
          </Button>
        ));
      } else {
        setSignup((
          <Button
            variant="contained"
            color="secondary"
            onClick={courseSignupHandler}
            style={{width:"100%"}}
          >
            Book Class
          </Button>
        ));
      }
    }

  }, [currentUser, course]);

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


  useEffect(() => {
    if (!currentUser.id || !course.id) return;

    let authorized = false;
    let instructor = course.instructor;

    if (currentUser.id === instructor.id) {
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

    if (!sessionTime) return;

    let disabled = true;

    if (now > sessionTime.start && now < sessionTime.end) {
      disabled = false;
    } else if (now < sessionTime.end) {
      disabled = true;
    }

    setJoinSession((
      <Button
        disabled={disabled}
        variant="contained"
        color="secondary"
        onClick={joinHandler}
        style={{width:"100%"}}
      >
        Join Session
      </Button>
    ));

    const interval = setInterval(() => {
      let now = new Date();
      let sessionTime = getNextSession(now, course);
      let disabled = true;

      if (now > sessionTime.start && now < sessionTime.end) {
        disabled = false;
      } else if (now < sessionTime.end) {
        disabled = true;
      }
  
      setJoinSession((
        <Button
          disabled={disabled}
          variant="contained"
          color="secondary"
          onClick={joinHandler}
          style={{width:"100%"}}
        >
          Join Session
        </Button>
      ));
    }, 10000);

    return () => clearInterval(interval);

  }, [currentUser, course]);


  const goToLogin = async function() {
    history.push(`${path.login}?redirect=${path.courses}/${course.id}`);
  }
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

  const showSignupForm = async function() {
    setNeedsPaymentMethod(true);
    setSignup(null);
  }

  const confirmCancelHandler = () => {
    setConfirmCancel(true)
  }

  const closeModalHandler = () => {
    setConfirmCancel(false);
  }

  const cancelClassHandler = async function () {
    setCancellingClass(true);
    setConfirmCancel(false);
    setPaymentProcessing(true);
    
    try {
      await Course.remove(params.id);
    } catch (err) {
      setErrMessage({severity: 'error', message: 'Class failed to cancel'})
      setPaymentProcessing(false);
      return log.error("COURSE INFO: course cancel ", err);
    }

    setCancellingClass(false);
    setPaymentProcessing(false);
    history.push(path.home);
  }

  useEffect(() => {
    if(defaultPaymentMethod) {
      paymentMethod.current = defaultPaymentMethod;
    }
  }, [defaultPaymentMethod]);

  const courseSignupHandler = async function () {

    setErrMessage({severity: "info", message: "Processing..."});
    setPaymentProcessing(true);
    setNeedsPaymentMethod(false);
    setSignup(null);

    log.debug("local payment", paymentMethod);

    let defaultPaymentMethod = paymentMethod.current[0];
    let paymentMethodId = defaultPaymentMethod ? defaultPaymentMethod.id : "none";

    if (course.cost && course.cost > 0 && !defaultPaymentMethod) {
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
      }).catch(err => {
        setPaymentProcessing(false);
        showSignupForm();
        setErrMessage({severity: "error", message: err.message});
      });
  }

  const courseLeaveHandler = async function () {
    let updatedCourse;
    setPaymentProcessing(true);
    setErrMessage({severity: "info", message: "Processing..."});

    // remove from the course
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

  const joinHandler = function () {
    history.push(path.courses + "/" + course.id + path.joinPath);
  }

  let paymentProcessingContent = null;
  if (paymentProcessing) {
    paymentProcessingContent = ( 
      <LinearProgress color="secondary" />
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

  let instructorContent = null;

  if (course.instructor) {
    let insta = null;

    if (course.instructor.social && course.instructor.social.instagram) {
      insta = (
        <Instagram instagram={course.instructor.social.instagram} />
      );
    }

    instructorContent = (
      <Card className={classes.instructorContainer}>
        <Grid container direction="row" justify="flex-start" alignItems="center" alignContent="center" spacing={2}>
          <Grid item>
            <RecordVoiceOver color="primary" />
          </Grid>
          <Grid item>
            <Typography variant="h5">
              {course.instructor.username}
            </Typography>
          </Grid>
        </Grid>
        <Grid container direction="row" justify="flex-start" alignItems="center" alignContent="center" spacing={2}>
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
      costSize: 4,
      spotsSize: 4,
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
      main: "column-reverse",
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

  let cancelBtn = null;
  if (cancel) {
    cancelBtn = (
      <Grid item xs={layout.actionBtnSize}>
        {cancel}
      </Grid>
    )
  }

  let courseCostContainer = (
    <Grid container direction="column" spacing={2}>
      <Grid item>
        <Grid container direction="row" justify="flex-end" spacing={2}>
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
      </Grid>
      <Grid item>
        <Grid container direction={layout.instructorDetailsDirection} spacing={2}>
          <Grid item xs={layout.instructorDetailsSize}>
            {instructorContent}
          </Grid>
          <Grid item xs={layout.instructorDetailsSize}>
            <Participants currentUser={currentUser} course={course} classes={classes} />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );

  let courseDetails = (
    <Grid container direction={layout.courseDetailsDirection} justify={layout.courseDetailsJustify} spacing={2}>
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
            <div 
              id="wysiwygContent"
              className={classes.bio}
              dangerouslySetInnerHTML={{__html: course.description}}
            />
            <OtherCourseInfo />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={layout.courseCostSize}>
        {courseCostContainer}
      </Grid>
    </Grid>
  );

  return (
    <Container style={{paddingTop: "2rem", paddingBottom: "2rem"}}>
      <Grid container direction={layout.main} spacing={2}>
        <Grid item>
          <Grid container direction={layout.actionBtnDirection} justify="flex-end" spacing={2}>
            {notifyBtn}
            {joinBtn}
            {signupBtn}
            {cancelBtn}
          </Grid>
        </Grid>
        <Modal
          open={confirmCancel}
          onClose={closeModalHandler}
          className={classes.modal}
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <Fade in={confirmCancel}>
            <div className={classes.modalContent}>
              <span id='modal-title'>Are you sure you want to cancel?</span>
              <Grid container id='modal-description' justify='center'>
                <Button
                  onClick={closeModalHandler}
                  variant="contained"
                  color="secondary"
                  className={classes.modalBtn}
                >
                  No
                </Button>
                <Button onClick={cancelClassHandler} variant="contained" className={classes.modalBtn}>Yes</Button>
              </Grid>
            </div>
          </Fade>
        </Modal>
        <Grid item>
          {errorContent}
          {paymentContent}
        </Grid>
        <Grid item>
          {courseDetails}
        </Grid>
      </Grid>
      {messageContent}
    </Container>
  )
}