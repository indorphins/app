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
    }
  } else {
    layout = {
      size: 6,
      direction: "row",
      align: "flex-start",
      spacing: 2,
    }
  }

  let section1 = (
    <Grid container direction={layout.direction} justify="center" alignItems="center" /*spacing={layout.spacing}*/>
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

  return (
    <Grid style={{position: "relative", width: "100%", height: "100%"}}>
      <Grid className={classes.backShape}></Grid>
      <Container>
        {section1}
      </Container>
    </Grid>
  );
}