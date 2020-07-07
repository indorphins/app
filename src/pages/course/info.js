import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Button, Container, Divider, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { useStripe } from '@stripe/react-stripe-js';

import UserData from '../../components/userData';
import CourseSchedule from '../../components/courseSchedule';
import * as Course from '../../api/course';
import * as Stripe from '../../api/stripe';
import log from '../../log';
import path from '../../routes/path';
import { getNextDate, getPrevDate } from '../../utils';
import AddPaymentMethod from '../../components/form/addPaymentMethod';

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

export default function () {

  const classes = useStyles();
  const history = useHistory();
  const params = useParams();
  const stripe = useStripe();
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
  const [needsPaymentMethod, setNeedsPaymentMethod] = useState(false);

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
    setPhoto(cls.photo_url);
    setTitle(cls.title);
    setDescription(cls.description);
    setEmail(cls.instructor.email);
    setPhone(cls.instructor.phone_number);
    setCourse(cls);
    if (cls.instructor.social) setInsta(cls.instructor.social.instagram);
  }

  useEffect(() => {
    get();
  }, [params])

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

    log.debug("test", instructor.id, currentUser.id);

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

    setSignup((
      <Button variant="contained" color="secondary" onClick={courseSignupHandler}>Sign Up</Button>
    ));

  }, [currentUser, course]);

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

  const goToLogin = async function() {
    history.push(`${path.login}?redirect=${path.courses}/${course.id}`);
  }

  const showAddPayment = () => {
    setNeedsPaymentMethod(true);
  }

  const paymentMethodAddedHandler = async (pMethod) => {
    // return to this pages content then call pay for class helper
    setNeedsPaymentMethod(false);
    try {
      await payForClass(pMethod);
    } catch (err) {
      return log.error("PAYMENT METHOD ADDED HANDLER: ERROR ", err);
    }

    try {
      await Course.addParticipant(params.id);
    } catch (err) {
      return log.error("COURSE INFO: course signup", err);
    }

    history.push(path.profile);
  }

  /**
   * Takes in a payment method and books a class for the given user using the input pMethod
   * Adds the user to the class after stripe confirms the one-time payment
   * Will create a subscription if signing up for recurring class
   * Throws error if any async calls fail
   * @param {Object} pMethod 
   */
  const payForClass = async (pMethod) => {
    if (!course.instructor.id || !pMethod) {
      return log.error("PAY FOR CLASS: no instructor ID or payment method")
    }
    let payment, subscription, confirmed;
    const recurring = course.recurring ? true : false;

    try {
      payment = await Stripe.createPaymentIntent(course.instructor.id, pMethod.id, course.id, recurring)
      log.debug("PAY FOR CLASS: created payment intent: ", payment);
    } catch (err) {
      log.error("PAY FOR CLASS: create payment intent error: ", err);
      throw err;
    }
    if (recurring) {
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

    if (confirmed && confirmed.paymentIntent.status === 'succeeded') {
      // Once stripe confirms the payment update transaction on our back end
      try {
        await Stripe.confirmPayment(confirmed.paymentIntent.id)
        log.debug("PAY FOR CLASS: update transaction success");
      } catch (err) {
        log.error("PAY FOR CLASS: update transaction failed: ", err);
        throw err;
      }
    } else {
      log.error("PAY FOR CLASS: Stripe couldn't confirm payment intent");
      throw Error("Payment confirmation failed")
    }

    // and add user to class
  }

  const courseSignupHandler = async function () {
    // Check if user has a payment method - add one if not
    // If so, create either a one-time payment or recurring subscription
    // confirm the one time payment in both cases that is returned
    // then add user to class backend (below)
    let pMethods;

    try {
      pMethods = await Stripe.getPaymentMethods();
    } catch (err) {
      return log.error("PAYMENT METHODS: error fetching", err);
    }

    if (!pMethods || !Array.isArray(pMethods.data) || pMethods.data.length === 0) {
      log.info("PAYMENT METHODS: no payment methods found add one")
      // Show add payment method form
      return showAddPayment();
    } else {
      try {
        await payForClass(Stripe.getDefaultPaymentMethod(pMethods.data))
      } catch (err) {
        // Display error?
        return log.info("COURSE INFO: error paying for class: ", err)
      }
    }


    try {
      await Course.addParticipant(params.id);
    } catch (err) {
      return log.error("COURSE INFO: course signup", err);
    }

    history.push(path.profile);
  }

  const courseLeaveHandler = async function () {
    // refund the payment
    let refund;

    try {
      refund = await Stripe.refundPayment(course.id)
    } catch (err) {
      return log.error("COURSE INFO: refund course ", err);
    }

    if (refund.message.statusCode >= 400) {
      // refund unsuccessful don't remove from class
      return log.error("COURSE INFO: refund unsuccessful");
    }

    // remove from the course
    try {
      await Course.removeParticipant(params.id);
    } catch (err) {
      return log.error("COURSE INFO: course leave", err);
    }

    history.push(path.profile);
  }

  const joinHandler = function () {
    history.push(path.courses + "/" + course.id + path.joinPath);
  }

  const content = (
    needsPaymentMethod ?
      <Container>
        <Grid>
          <AddPaymentMethod backHandler={paymentMethodAddedHandler} />
        </Grid>
      </Container>
      :
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
  );

  return content;
}