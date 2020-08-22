import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, makeStyles } from '@material-ui/core';
import Whatshot from '@material-ui/icons/Whatshot';
import StarSharpIcon from '@material-ui/icons/StarSharp';
import { getDayOfYear, differenceInWeeks } from 'date-fns';

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
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  let weeklyStreakLabels = [2, 3, 4, 7, 10, 20, 30, 40, 52, 60, 70, 80, 90, 104, 125, 156, 175, 208]

  useEffect(() => {
    // Sessions will be from earliest to latest
    if (props.sessions) {
      setStreak(getRecentStreak(props.sessions));
      setLongestStreak(getLongestStreak(props.sessions));
    }
  }, [props.sessions])

  function getRecentStreak(sessions) {
    if (sessions.length < 2) {
      return 0;
    }

    let longest = 0;
    let start, last;

    sessions.forEach(session => {
      let sessionDate = new Date(session.start_date);

      if (!start) {
        start = sessionDate;
      }
      if (!last) {
        last = sessionDate;
      }

      if (getDayOfYear(last) !== getDayOfYear(sessionDate)) {
        let weekDiff = differenceInWeeks(last, sessionDate)
        if (weekDiff > 1) {
          return longest;
        } else {
          weekDiff = differenceInWeeks(start, sessionDate);
          if (weekDiff > longest) {
            longest = weekDiff;
          }
        }
        last = sessionDate;
      }
    })
    return longest
  }

  function getLongestStreak(sessions) {
    if (sessions.length < 2) {
      return 0;
    }

    let longest = 0;
    let start, last;

    sessions.forEach(session => {
      let sessionDate = new Date(session.start_date);
      if (!start) {
        start = sessionDate;
      }
      if (!last) {
        last = sessionDate;
      }

      if (getDayOfYear(last) !== getDayOfYear(sessionDate)) {
        let weekDiff = differenceInWeeks(last, sessionDate)
        if (weekDiff > 1) {
          start = sessionDate;
        } else {
          weekDiff = differenceInWeeks(start, sessionDate);
          if (weekDiff > longest) {
            longest = weekDiff;
          }
        }
        last = sessionDate;
      }
    })

    // Fit longest to its closest valid label
    if (longest >= 2) {
      let i = 0;
      let longestLabel = 0;
      while (longest >= weeklyStreakLabels[i]) {
        longestLabel = weeklyStreakLabels[i];
        i++;
      }
      longest = longestLabel;
    }

    return longest
  }

  let content = [];

  weeklyStreakLabels.forEach(label => {
    let fullLabel = `${label}-Week Streak`;
    let typeStyle = {};
    let iconStyle = {};
    let contentsStyle = classes.milestone;

    if (label <= streak) {
      iconStyle = classes.contentsHit;
      typeStyle = classes.contentsHit;
      contentsStyle = classes.milestoneHit;
    }

    let icon = <Whatshot className={iconStyle} />;

    if (label === longestStreak) {
      icon = <StarSharpIcon className={iconStyle} />
    }
    
    let type = <Typography variant='h3' className={typeStyle}>{label}</Typography>
    let contents = (
      <Grid container className={contentsStyle} justify='center' alignItems='center'>
        {type}
        {icon}
      </Grid>
    )
    if (label === 52) {
      fullLabel = '1-Year Streak';
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
      <Grid item className={classes.item} key={fullLabel}>
        <Grid container className={classes.milestoneContainer} direction='column' alignItems='center' justify='center'>
          {contents}
          <Typography variant='body2' className={classes.milestoneLabel} align='center'>{fullLabel}</Typography>
        </Grid>
      </Grid>
    )
  })

  return (
    <Container>
      <Typography variant='h5' className={classes.header}>Weekly Streak</Typography>
      <Grid container className={classes.grid} spacing={7} alignItems='center' direction='row' justify='flex-start'>
        {content}
      </Grid>
    </Container>
  )
}