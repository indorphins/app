import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, makeStyles, useMediaQuery } from '@material-ui/core';
import Whatshot from '@material-ui/icons/Whatshot';
import StarSharpIcon from '@material-ui/icons/StarSharp';
import { getDayOfYear, differenceInWeeks } from 'date-fns';

const useStyles = makeStyles((theme) => ({
  milestone: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    borderColor: theme.palette.grey[500],
    border: "solid 2px",
    borderRadius: "20% / 50%"
  },
  number: {
    minWidth: 60,
    textAlign: "center",
    '@media (max-width: 900px)': {
      minWidth: 40,
    },
  },
  hit: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.white,
  }
}));

export default function WeeklyStreak(props) {
  const classes = useStyles();
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  let weeklyStreakLabels = [2, 3, 4, 7, 10, 20, 30, 40, 52, 60, 70, 80, 90, 104, 125, 156, 175, 208];

  const sml = useMediaQuery('(max-width:600px)');
  const med = useMediaQuery('(max-width:900px)');

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
    
    let icon = <Whatshot className={classes.icon} />;

    if (label === longestStreak) {
      icon = <StarSharpIcon className={classes.icon} />
    }

    let contentStyle = classes.milestone;

    if (label <= streak) {
      contentStyle = `${classes.milestone} ${classes.hit}`;
    }
    
    let contents = (
      <Grid container direction="column" justify='center' alignItems='center'>
        <Grid item>
          <Typography variant='h3' className={classes.number}>{label}</Typography>
        </Grid>
        <Grid item>
          {icon}
        </Grid>
      </Grid>
    )

    let fullLabel = `${label} Week Streak`;

    if (label === 52) {
      fullLabel = '1 Year Streak';
    } 
    if (label === 104) {
      fullLabel = '2 Year Streak';
    }
    if (label === 156) {
      fullLabel = '3 Year Streak';
    }
    if (label === 208) {
      fullLabel = '4 Year Streak';
    }

    let layout = {
      width: 2,
    };

    if (sml) {
      layout.width = 4;
    } else if (med) {
      layout.width = 3;
    } else {
      layout.width = 2;
    }

    content.push(
      <Grid item xs={layout.width}>
        <Grid container direction='column' alignItems='center' justify='center' spacing={2}>
          <Grid item className={contentStyle}>
            {contents}
          </Grid>
          <Grid item>
            <Typography variant='body2' align="center">{fullLabel}</Typography>
          </Grid>
        </Grid>
      </Grid>
    )
  })

  return (
    <Container>
      <Grid container direction="column" spacing={4}>
        <Grid item>
          <Typography variant='h3' align="center">Weekly Streak</Typography>
        </Grid>
        <Grid item>
          <Grid container spacing={4} direction='row' justify='flex-start'>
            {content}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  )
}