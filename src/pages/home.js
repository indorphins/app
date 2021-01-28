import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Container, Grid, makeStyles, useMediaQuery, Typography, Zoom, Slide } from '@material-ui/core';
import { createSelector } from 'reselect';
import { useSelector } from 'react-redux';
import ResumeSubscriptionModal from '../components/modals/resumeSub';
import path from '../routes/path';
import BgShape from '../components/icon/bgShape';
import * as Stripe from '../api/stripe';
import log from '../log';
import { store, actions } from '../store';
import StartTrialModal from '../components/modals/startTrial';

const styles = makeStyles((theme) => ({
  subHeader: {
    color: theme.palette.secondary.contrastText,
    fontSize: "3.2rem",
    fontWeight: 700,
    textAlign: "center",
    '@media (max-width: 960px)': {
      fontSize: "2.5rem",
    },
  },
  heroText: {
    color: theme.palette.secondary.contrastText,
    fontSize: "3.8rem",
    fontWeight: 700,
    '@media (max-width: 960px)': {
      fontSize: "3.2rem",
      textAlign: "center",
    },
  },
  img: {
    width: "100%"
  },
  button: {
    marginBottom: 10,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    fontWeight: 500,
    textTransform: "none",
    backgroundImage: "url(/img/buttonWave.svg)",
    backgroundPosition: "0px 0px",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    marginLeft: 5,
    marginRight: 5,
    "&:hover": {
      backgroundColor: theme.palette.primaryColor.main,
      color: theme.palette.primaryColor.contrastText,
    },
  },
  button2: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    fontWeight: 500,
    textTransform: "none",
    backgroundImage: "url(/img/buttonWave.svg)",
    backgroundPosition: "0px 0px",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    marginLeft: 5,
    marginRight: 5,
    "&:hover": {
      backgroundColor: theme.palette.primaryColor.main,
      color: theme.palette.primaryColor.contrastText,
    },
  },
  testimonial: {
    textAlign: "center",
    color: theme.palette.secondary.contrastText,
  },
  missionText: {
    color: theme.palette.secondary.contrastText,
  },
  missionDescription: {
    fontSize: "1rem",
  },
  missionRow: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  missionRowContent: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  howDescription: {
    fontWeight: "700", 
    fontSize:"1.4rem",
    color: theme.palette.secondary.contrastText,
  },
  footer: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(4),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  subHeroText: {
    '@media (max-width: 960px)': {
      textAlign: "center",
    },
  }
}));

const getUserSelector = createSelector([state => state.user.data], (u) => {
  return u;
});

const getThemeSelector = createSelector([state => state.theme], (t) => {
  return t;
});

const getSubscriptionSelector = createSelector([state => state.user.subscription], s => {
  return s;
});

const paymentDataSelector = createSelector([state => state.user.paymentData], (p) => {
  return p;
});

export default function Home() {
  const classes = styles();
  const history = useHistory();
  const user = useSelector(state => getUserSelector(state));
  const paymentData = useSelector(state => paymentDataSelector(state));
  const [transition, setTranstion] = useState(false); 
  const theme = useSelector(state => getThemeSelector(state));
  const [bgShape, setBgShape] = useState({
    color: "#f5fbfc",
    opacity: "0.87",
  })
  const [resumeSub, setResumeSub] = useState(false);
  const [trialModal, setTrialModal] = useState(false);
  let subscription = useSelector(state => getSubscriptionSelector(state));

  const med = useMediaQuery('(max-width:960px)');

  useEffect(() => {
    document.title="Indoorphins.fit";
    setTranstion(true);

    return function() {
      setTranstion(false);
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      setBgShape({
        color: "#000",
        opacity: "0.07",
      });
    } else {
      setBgShape({
        color: "#f5fbfc",
        opacity: "0.87",
      });
    }
  }, [theme])

  useEffect(() => {

    if (!user.id) {
      return;
    }

    if (paymentData.id) { 
      return;
    }

    Stripe.getPaymentMethods().then(result => {
      return store.dispatch(actions.user.setPaymentData(result));
    })
    .catch(err => {
      log.error("HOME:: update user payment data", err);
    });

  }, [paymentData.id, user.id]);

  function navClasses() {
    history.push(path.courses);
  }

  function navSignup() {
    if (user && Object.entries(user).length > 0) {
      setTrialModal(true);
    } else {
      history.push(path.signup);
    }
  }

  function showResumeSubModal() {
    setResumeSub(true);
  }

  function closeResumeSubModal(sub) {
    setResumeSub(false);
    if (sub && Object.entries(sub).length > 0) {
      subscription = sub;
    }
  }

  function closeStartTrialModal(sub) {
    setTrialModal(false);
    if (sub && Object.entries(sub).length > 0) {
      subscription = sub;
    }
  }

  let layout;

  if (med) {
    layout = {
      size: 12,
      direction: "column",
      align: "center",
      spacing: 6,
      testimonialDirection: "column",
      testimonialSize: 12,
      missionHeaderSize: 12,
      missionTblSize: 12,
      howDirection: "column",
      howSize: 12,
      slideDirection: "down",
    }
  } else {
    layout = {
      size: 6,
      direction: "row",
      align: "flex-start",
      spacing: 2,
      testimonialDirection: "row",
      testimonialSize: 4,
      missionHeaderSize: 8,
      missionTblSize: 10,
      howDirection: "row",
      howSize: 4,
      slideDirection: "right",
    }
  }

  let signup = (
    <Button variant="contained" color="primary" className={classes.button} onClick={navSignup}>
      Start Free Trial
    </Button>
  );

  let schedule = (
    <Button variant="contained"
    color="primary" 
    className={classes.button2} 
    onClick={navClasses}
    >
      View Schedule
    </Button>
  )

  if (user && user.id) {
    if (subscription) {
      let activeSub = subscription.status === 'ACTIVE' || subscription.status === 'TRIAL';
      let inactiveSub = subscription.status === 'CANCELED' || subscription.status === 'PAYMENT_FAILED';
      if (activeSub) {
        schedule = null;
        // remove margin if no other button is present
        signup = (
          <Button variant="contained" color="primary" className={classes.button} onClick={navClasses}>
            View Schedule
          </Button>
        )
      } else if (inactiveSub) {
        signup = (
          <Button variant="contained" color="primary" className={classes.button} onClick={showResumeSubModal}>
            Resume Subscription
          </Button>
        )
      }
    }
  }

  let section1 = (
    <Grid container direction={layout.direction} justify="center" alignItems="center" style={{paddingTop: 100}}>
      <Slide direction={layout.slideDirection} in={transition}>
        <Grid
          item
          xs={layout.size}
          container
          direction="column"
          alignItems={layout.align}
          alignContent={layout.align}
          spacing={6}
        >
          <Grid item>
            <Typography variant="h1" className={classes.heroText}>
              Live, small group fitness classes
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="body1" className={classes.subHeroText}>
              {`The easiest way to workout at home, led by an 
                instructor and empowered by a community.`}
            </Typography>
          </Grid>
          <Grid item>
            <Grid container justify='space-evenly' className={classes.buttonCtn}>
              <Grid item>
                {signup}
              </Grid>
              <Grid item>
                {schedule}
              </Grid>
            </Grid>
          </Grid>    
        </Grid>
      </Slide>
      <Grid item xs={layout.size}>
        <Zoom in={transition}>
          <img className={classes.img} alt="class demo on notebook" src="/img/heroImage.png" />
        </Zoom>
      </Grid>
    </Grid>
  );


  let testimonials = (
    <Grid style={{paddingTop: 50}}>
      <Grid container direction="column" justify="center" alignContent="center" alignItems="center" spacing={2}>
        <Grid item>
          <Typography variant="body1">The reviews are in:</Typography>  
        </Grid>
        <Grid item>
          <Typography variant="h1" className={classes.heroText}>⭑⭑⭑⭑⭑</Typography>
        </Grid>
      </Grid>
      <Grid container direction={layout.testimonialDirection} spacing={4} style={{marginTop: 50}}>
        <Grid item xs={layout.testimonialSize}>
          <Typography variant="h3" className={classes.testimonial}>
            &ldquo;A beautiful space to be yourself, let go and have fun&rdquo;
          </Typography>
        </Grid>
        <Grid item xs={layout.testimonialSize}>
          <Typography variant="h3" className={classes.testimonial}>
            &ldquo;AMAZING WORKOUT HOLY SMOKES&rdquo;
          </Typography>
        </Grid>
        <Grid item xs={layout.testimonialSize}>
          <Typography variant="h3" className={classes.testimonial}>
            &ldquo;best virtual class in the whole wide world&rdquo;
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  );

  let mission = (
    <Grid
      container
      direction="column"
      justify="center"
      alignContent="center"
      alignItems="center"
      style={{paddingTop:150}}
    >
      <Grid item className={classes.missionRow} xs={layout.missionHeaderSize}>
        <Typography variant="h1" className={classes.subHeader}>
          We&apos;re on a mission to make group fitness accessible
        </Typography>
      </Grid>
      <Grid item className={classes.missionRow} xs={layout.missionHeaderSize}>
        <Typography variant="body1">For us, that means:</Typography>
      </Grid>
      <Grid item className={classes.missionRowContent} xs={layout.missionTblSize}>
        <Grid container direction="row" spacing={4} justify="flex-start">
          <Grid item xs={6}>
            <Typography variant="h3" className={classes.missionText}>
              We hold space for all&nbsp;
              <span role="img" aria-label="fist">✊🏾</span>
              <span role="img" aria-label="fist">✊🏼</span>
              <span role="img" aria-label="fist">✊🏿</span>
              <span role="img" aria-label="fist">✊🏻</span>
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" className={classes.missionDescription}>
              {`People of all body types, skin colors, backgrounds and walks of life 
              should have the opportunity to access the group fitness experience.`}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item className={classes.missionRowContent} xs={layout.missionTblSize}>
        <Grid container direction="row" spacing={4} justify="flex-start">
          <Grid item xs={6}>
            <Typography variant="h3" className={classes.missionText}>
              We strive for authenticity&nbsp;<span role="img" aria-label="100%">💯</span>
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" className={classes.missionDescription}>
              {`Freedom to be ourselves without judgement. 
              We accept and love each other for who we are, 
              not who we're supposed to be based on outdated fitness ideals.`}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item className={classes.missionRowContent} xs={layout.missionTblSize}>
        <Grid container direction="row" spacing={4} justify="flex-start">
          <Grid item xs={6}>
            <Typography variant="h3" className={classes.missionText}>
              We empower instructors&nbsp;<span role="img" aria-label="strong arm">💪</span>
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" className={classes.missionDescription}>
              {`Instructors make the world go round, and they're people too! 
              At Indoorphins, 80% of class proceeds go to your instructor. 
              Instructors set their schedule and take time off as they need it.`}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );

  let how = (
    <Grid>
      <Typography variant="h1" className={classes.subHeader} style={{paddingBottom: 50, paddingTop: 150}}>
        How it works
      </Typography>
      <Grid
        container
        direction={layout.howDirection}
        justify="center"
        alignContent="center"
        alignItems="center"
        spacing={4}
      >
        <Grid item xs={layout.howSize} container direction="column">
          <Grid item style={{paddingBottom: 40}}>
            <img className={classes.img} alt="Find and Book Class" src="/img/findAndBook.png" />
          </Grid>
          <Grid item>
            <Typography variant="body1" align="center" className={classes.howDescription}>
              Find &amp; book a class
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="body1" align="center">
              Our classes are live, two-way-streaming so that our instructors can motivate and form correct. 
              Pay $10 to drop in or $49.99 for unlimited access.
            </Typography>
          </Grid>
        </Grid>
        <Grid item xs={layout.howSize} container direction="column">
          <Grid item style={{paddingBottom: 40}}>
            <img className={classes.img} alt="Join from website" src="/img/joinFromWebsite.png" />
          </Grid>
          <Grid item>
            <Typography variant="body1" align="center" className={classes.howDescription}>
              Join from our website
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="body1" align="center">
              Our platform is like Zoom but built for group fitness. You&apos;ll join class right from Chrome or Safari.
            </Typography>
          </Grid>
        </Grid>
        <Grid item xs={layout.howSize} container direction="column">
          <Grid item style={{paddingBottom: 40}}>
            <img className={classes.img} alt="Workout together" src="/img/workoutTogether.png" />
          </Grid>
          <Grid item>
            <Typography variant="body1" align="center" className={classes.howDescription}>
              Workout together
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="body1" align="center">
              Get form feedback &amp; motivation from your instructor. Send emojis &amp; energy to the community.
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );

  let footer = (
    <React.Fragment>
      <Grid container direction="row" justify="center" alignItems="center" style={{paddingTop: 50, paddingBottom: 50}}>
        <Grid item>
          {signup}
        </Grid>
      </Grid>
      <Grid className={classes.footer}>
        <Typography variant="body1" align="center">
          Questions? Comments? Want a recommendation? Shoot us an email: hello@indoorphins.fit
        </Typography>
      </Grid>
    </React.Fragment>
  );

  let resumeSubModal;
  if (resumeSub) {
    resumeSubModal = <ResumeSubscriptionModal openModal={resumeSub} closeModalHandler={closeResumeSubModal} />
  }

  let startTrialModal;
  if (trialModal) {
    startTrialModal = <StartTrialModal openModal={trialModal} closeModalHandler={closeStartTrialModal} />
  }

  return (
    <Grid style={{position: "relative", width: "100%", height: "100%"}}>
      <BgShape color={bgShape.color} opacity={bgShape.opacity} />
      <Container>
        {section1}
        <Zoom in={transition}>
          {testimonials}
        </Zoom>
        <Zoom in={transition}>
          {mission}
        </Zoom>
        <Zoom in={transition}>
          {how}
        </Zoom>
        {resumeSubModal}
        {startTrialModal}
      </Container>
      {footer}
    </Grid>
  );
}