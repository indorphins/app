import React, { useEffect, useState, useRef } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Button, Container, Divider, Grid, LinearProgress, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import Alert from '@material-ui/lab/Alert';

import { store, actions } from '../../store';
import UserData from '../../components/userData';
import CourseSchedule from '../../components/courseSchedule';
import CreateMessage from '../../components/form/createMessage'
import * as Course from '../../api/course';
import * as Stripe from '../../api/stripe';
import log from '../../log';
import path from '../../routes/path';
import { getNextDate, getPrevDate } from '../../utils';
import Cards from '../../components/cards';

const sessionWindow = 5;

const useStyles = makeStyles((theme) => ({
  divider: {
    margin: theme.spacing(2),
  },
  actionBtn: {
    marginLeft: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  alert: {
    marginBottom: theme.spacing(1),
  },
  signupBtn: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1)
  }
}));

const getUserSelector = createSelector([state => state.user], (user) => {
  return user.data;
});

const paymentDataSelector = createSelector([state => state.user], (data) => {
  return data.paymentData.methods;
});

const selectDefaultPaymentMethod = createSelector(
  paymentDataSelector,
  methods => methods.filter(item => item.default)
)

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

export default function () {

  const classes = useStyles();
  const history = useHistory();
  const params = useParams();
  const currentUser = useSelector(state => getUserSelector(state));
  const paymentData = useSelector(state => paymentDataSelector);
  const defaultPaymentMethod = useSelector(state => selectDefaultPaymentMethod(state));
  const paymentMethod = useRef(defaultPaymentMethod);
  const [photo, setPhoto] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [insta, setInsta] = useState('');
  const [course, setCourse] = useState('');
  const [signup, setSignup] = useState(null);
  const [notify, setNotify] = useState(null);
  const [makeMessage, setMakeMessage] = useState(false);
  const [joinSession, setJoinSession] = useState(null);
  const [needsPaymentMethod, setNeedsPaymentMethod] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [errMessage, setErrMessage] = useState(null);

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
    setCourse(cls);
  }

  useEffect(() => {
    getCourse(params.id);
  }, [params]);

  useEffect(() => {
    if (course.id) {
      let instructor = JSON.parse(course.instructor);
      setPhoto(course.photo_url);
      setTitle(course.title);
      setDescription(course.description);
      setEmail(instructor.email);
      setPhone(instructor.phone_number);
      if (course.instructor.social) setInsta(course.instructor.social.instagram);
    }
  }, [course]);

  useEffect(() => {
    if (!course.id) {
      return;
    }

    if (!currentUser.id) {
      setSignup((
        <Button variant="contained" color="secondary" onClick={goToLogin}>Login to Sign Up</Button>
      ));
      return;
    }

    let instructor = JSON.parse(course.instructor);

    if (currentUser.id === instructor.id || currentUser.type === 'admin') {
      setNotify((
        <Button variant='contained' color='secondary' onClick={createMessageHandler}>Message Class</Button>
      ))
    }

    if (currentUser.id === instructor.id) {
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

    // Show two join buttons (one-time and weekly) if course is recurring
    if (course.recurring) {
      setSignup((
        <Grid container>
          <Button variant="contained" className={classes.signupBtn} color="secondary" onClick={() => courseSignupHandler(false)}>Sign Up Once</Button>
          <Button variant="contained" className={classes.signupBtn} color="secondary" onClick={() => courseSignupHandler(true)}>Sign Up Weekly</Button>
        </Grid>
      ));
    } else {
      setSignup((
        <Button variant="contained" color="secondary" onClick={() => courseSignupHandler(false)}>Sign Up</Button>
      ));
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
    let instructor = JSON.parse(course.instructor);

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

    if (now > sessionTime.startDate && now < sessionTime.endDate) {
      setJoinSession((
        <Button variant="contained" color="secondary" onClick={joinHandler}>Join</Button>
      ))
    }

  }, [currentUser, course]);

  const goToLogin = async function () {
    history.push(`${path.login}?redirect=${path.courses}/${course.id}`);
  }

  const showSignupForm = async function () {
    setNeedsPaymentMethod(true);
    setSignup((
      <Button disabled={paymentProcessing} variant="contained" color="primary" onClick={courseSignupHandler}>Submit Payment</Button>
    ));
  }

  const createMessageHandler = function () {
    setMakeMessage(true);
    setNotify(null)
  }

  const sendMessageHandler = function () {
    setMakeMessage(false);
    setNotify((
      <Button variant='contained' color='secondary' onClick={createMessageHandler}>Message Sent</Button>
    ))
  }

  /**
   * Takes in a payment method and books a class for the given user using the input pMethod
   * Adds the user to the class after stripe confirms the one-time payment
   * Will create a subscription if signing up for recurring class
   * Throws error if any async calls fail
   * @param {Object} pMethod
   * @param {Boolean} subscribe
   */
  const payForClass = async (pMethod, subscribe) => {
    if (!course.instructor.id || !pMethod) {
      return log.error("PAY FOR CLASS: no instructor ID or payment method")
    }
    let payment, subscription, confirmed;

    try {
      payment = await Stripe.createPaymentIntent(course.instructor.id, pMethod.id, course.id, subscribe)
      log.debug("PAY FOR CLASS: created payment intent: ", payment);
    } catch (err) {
      log.error("PAY FOR CLASS: create payment intent error: ", err);
      throw err;
    }
    if (subscribe) {
      try {
        subscription = await Stripe.createSubscription(course.id);
        log.debug("PAY FOR CLASS: created subscription: ", subscription);
      } catch (err) {
        log.error("PAY FOR CLASS: create subscription error: ", err);
        throw err;
      }
    }

    if (!payment) {
      log.error("PAY FOR CLASS: no payment intent created");
      throw Error("No payment intent created");
    }

    try {
      confirmed = await stripe.confirmCardPayment(payment.data.client_secret)
    } catch (err) {
      log.error("PAY FOR CLASS: confirm card payment w/ stripe error: ", err);
      throw Error("No payment intent created");
    }

    useEffect(() => {
      if (defaultPaymentMethod) {
        paymentMethod.current = defaultPaymentMethod;
      }
    }, [defaultPaymentMethod]);

    const courseSignupHandler = async function () {

      setErrMessage({ severity: "info", message: "Processing..." });
      setPaymentProcessing(true);
      setNeedsPaymentMethod(false);
      setSignup(null);

      log.debug("local payment", paymentMethod);

      let defaultPaymentMethod = paymentMethod.current[0];

      Stripe.createPaymentIntent(defaultPaymentMethod.id, course.id)
        .then(result => {
          setCourse({ ...result.course });
          setPaymentProcessing(false);
          setNeedsPaymentMethod(false);
          setErrMessage({ severity: "success", message: result.message });
        }).catch(err => {
          setPaymentProcessing(false);
          showSignupForm();
          setErrMessage({ severity: "error", message: err.message });
        });
    }

    const courseLeaveHandler = async function () {
      let updatedCourse;
      setPaymentProcessing(true);
      setErrMessage({ severity: "info", message: "Processing..." });

      // remove from the course
      try {
        updatedCourse = await Stripe.refundPayment(course.id);
      } catch (err) {
        log.error("COURSE INFO: course leave", err);
        setPaymentProcessing(false);
        return setErrMessage({ severity: "error", message: err.message });
      }

      setPaymentProcessing(false);
      setErrMessage({ severity: "success", message: updatedCourse.message });
      setCourse(updatedCourse.course);
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
    if (errMessage) {
      errorContent = (
        <Grid className={classes.alert}>
          <Alert severity={errMessage.severity} >{errMessage.message}</Alert>
          {paymentProcessingContent}
        </Grid>
      );
    }

    let paymentContent = null;
    if (needsPaymentMethod) {
      paymentContent = (
        <Grid>
          <Typography variant="h5">Select or enter your default payment method</Typography>
          <Cards />
        </Grid>
      );
    }

    let messageContent = null;
    if (makeMessage) {
      messageContent = (
        <CreateMessage onSend={sendMessageHandler} courseId={course.id} />
      )
    }

    let content = (
      <Grid>
        {errorContent}
        {paymentContent}
        {messageContent}
        <Grid container direction="row" justify="flex-end">
          <Grid item className={classes.actionBtn}>
            {notify}
          </Grid>
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
      </Grid>
    );

    return (
      <Container>
        {content}
      </Container>
    )
  }