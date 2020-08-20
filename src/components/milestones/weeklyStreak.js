import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, makeStyles, CardMedia } from '@material-ui/core';
import Whatshot from '@material-ui/icons/Whatshot';
import StarSharpIcon from '@material-ui/icons/StarSharp';
import hexy from './assets/hexy.png'

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
    height: '95px',
    width: '75px',
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
    height: '95px',
    width: '75px',
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

export default function WeeklyStreak(props) {
  const classes = useStyles();

  let content = [];
  let classesTakenLabels = [2, 3, 4, 7, 10, 20, 30, 40, 52, 60, 70, 80, 90, 104, 125, 156, 175, 208]

  classesTakenLabels.forEach(label => {
    let fullLabel = `${label}-Week Streak`;
    let style = classes.milestone;
    let contents = (
      <Grid container className={style} justify='center' alignItems='center'>
        <Typography variant='h3'>{label}</Typography>
        <Whatshot />
      </Grid>
    )
    // To test successful streak
    if (label === 2) {
      style = classes.milestoneHit;
      contents = (
        <Grid container className={style} justify='center' alignItems='center'>
          <Typography variant='h3' className={classes.contentsHit}>{label}</Typography>
          <StarSharpIcon className={classes.contentsHit} />
        </Grid>
      )
    }
    if (label === 52) {
      fullLabel = '1-Year Streak';
      style = classes.milestoneHit;
    } 
    if (label === 104) {
      fullLabel = '2-Year Streak';
    }
    if (label === 156) {
      fullLabel = '3-Year Streak';
    }
    if (label === 208) {
      fullLabel = '4-Year Streak';
    }
    content.push(
      <Grid item className={classes.item}>
        <Grid container className={classes.milestoneContainer} direction='column' alignItems='center' justify='center'>
            {/* <CardMedia image={hexy} title='milestone-hexy' className={classes.media} component='image'/> */}
            {contents}
          <Typography variant='body2' className={classes.milestoneLabel} align='center'>{fullLabel}</Typography>
        </Grid>
      </Grid>
    )
  })

  return (
    <Container>
      <Typography variant='h1' className={classes.header}>Weekly Streak</Typography>
      <Grid container className={classes.grid} spacing={7} alignItems='center' justify='center' direction='row' justify='flex-start'>
        {content}
      </Grid>
    </Container>
  )
};