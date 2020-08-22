import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, makeStyles } from '@material-ui/core';
import DirectionsRunIcon from '@material-ui/icons/DirectionsRun';

const useStyles = makeStyles((theme) => ({
  topContainer: {
    marginBottom: theme.spacing(5)
  },
  milestoneContainer: {
    marginRight: theme.spacing(2),
    marginTop: theme.spacing(1),
  },
  milestone: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    borderColor: theme.palette.grey[500],
    height: 95,
    width: 75,
    zIndex: 25,
    border: "solid 2px",
    borderRadius: "20% / 50%"
  },
  milestoneHit: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    borderColor: "white",
    height: 95,
    width: 75,
    zIndex: 25,
    border: "solid 2px",
    borderRadius: "20% / 50%",
    backgroundColor: "#FF877F"
  },
  contentsHit: {
    color: "white"
  },
  milestoneLabel: {
    paddingTop: theme.spacing(1),
    width: 130,
  },
  item: {
    flexGrow: 0,
    paddingTop: theme.spacing(1) + "px !important",
    paddingBottom: theme.spacing(1) + "px !important",
    paddingRight: theme.spacing(1) + "px !important",
    paddingLeft: theme.spacing(1) + "px !important"
  },
  grid: {
    margin: 0
  },
  header: {
    marginLeft: theme.spacing(4)
  },
  media: {
    height: 94,
    width: 76
  },
}));

export default function ClassesTaken(props) {
  const classes = useStyles();
  const [classesTaken, setClassesTaken] = useState(0);

  useEffect(() => {
    if (props.sessions) {
      setClassesTaken(props.sessions.length);
    }
  }, [props.sessions])

  let content = [];
  let classesTakenLabels = 
    [1, 5, 10, 20, 30, 50, 75, 100, 150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000]

  classesTakenLabels.forEach(label => {
    let fullLabel = `${label} Classes`;

    if (label === 1000) {
      fullLabel = '1K Classes'
      label = '1K'
    }
    if (classesTakenLabels.indexOf(label) === 0) {
      fullLabel = 'First Class';
    }

    let contents = (
      <Grid container className={classes.milestone} justify='center'>
        <Typography variant='h3'>{label}</Typography>
        <DirectionsRunIcon />
      </Grid>
    );

    if (classesTaken >= label) {
      contents = (
        <Grid container className={classes.milestoneHit} justify='center'>
          <Typography variant='h3' className={classes.contentsHit}>{label}</Typography>
          <DirectionsRunIcon className={classes.contentsHit} />
        </Grid>
      )
    }
    content.push(
      <Grid item className={classes.item} key={fullLabel}>
        <Grid container className={classes.milestoneContainer} direction='column' alignItems='center' justify='center'>
          {contents}
          <Typography variant='body2' className={classes.milestoneLabel} align='center'>{fullLabel}</Typography>
        </Grid>
      </Grid>
    )
  })

  return (
    <Container className={classes.topContainer}>
      <Typography variant='h5' className={classes.header}>Classes Taken</Typography>
      <Grid container className={classes.grid} spacing={7} alignItems='center' direction='row' justify='flex-start'>
        {content}
      </Grid>
    </Container>
  )
}