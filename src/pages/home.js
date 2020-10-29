import React from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Container, Grid, makeStyles, useMediaQuery, Typography } from '@material-ui/core';

import path from '../routes/path';

const styles = makeStyles((theme) => ({
  backShape: {
    position: "absolute",
    top: 0,
    right: 0,
    width: "100%",
    height: "100%",
    backgroundImage: "url(/img/bg_shape.svg)",
    backgroundPosition: "100% 0%",
    backgroundSize: "auto",
    backgroundRepeat: "no-repeat",
    zIndex: -9,
  },
  subHeader: {
    color: theme.palette.common.black,
    fontSize: "3.2rem",
    fontWeight: 600,
    textAlign: "center",
    '@media (max-width: 960px)': {
      fontSize: "2.5rem",
    },
  },
  heroText: {
    color: theme.palette.common.black,
    fontSize: "3.8rem",
    fontWeight: 600,
    '@media (max-width: 960px)': {
      fontSize: "3.2rem",
      textAlign: "center",
    },
  },
  img: {
    width: "100%"
  },
  button: {
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
    "&:hover": {
      backgroundColor: theme.palette.primaryColor.main,
      color: theme.palette.primaryColor.contrastText,
    }
  },
  testimonial: {
    textAlign: "center",
    color: theme.palette.common.black,
  },
  missionText: {
    color: theme.palette.common.black,
  },
  missionRow: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  missionRowContent: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  }
}));

export default function Home() {
  const classes = styles();
  const history = useHistory();

  const med = useMediaQuery('(max-width:960px)');

  function navClasses() {
    history.push(path.courses);
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
    }
  }

  let section1 = (
    <Grid container direction={layout.direction} justify="center" alignItems="center" style={{paddingTop: 100}}>
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
            Live, small group fitness classes - at home
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant="body1">
            The easiest way to actually, consistently workout at home, led by an instructor and empowered by a community
          </Typography>
        </Grid>
        <Grid item>
          <Button variant="contained" color="primary" className={classes.button} onClick={navClasses}>
            View schedule
          </Button>
        </Grid>
      </Grid>
      <Grid item xs={layout.size}>
        <img className={classes.img} alt="class demo on notebook" src="/img/heroImage.png" />
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
            <Typography variant="body">
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
            <Typography variant="body">
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
            <Typography variant="body">
              {`Instructors make the world go round, and they're people too! 
              At Indoorphins, 80% of class proceeds go to your instructor. 
              Instructors set their schedule and take time off as they need it.`}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )

  return (
    <Grid style={{position: "relative", width: "100%", height: "100%"}}>
      <Grid className={classes.backShape}></Grid>
      <Container>
        {section1}
        {testimonials}
        {mission}
      </Container>
    </Grid>
  );
}