import React, { useState, useEffect } from 'react';
import { Typography, Grid, makeStyles, useMediaQuery } from '@material-ui/core';
import DirectionsRunIcon from '@material-ui/icons/DirectionsRun';

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
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.common.white,
  }
}));

export default function ClassesTaken(props) {
  const classes = useStyles();
  const [classesTaken, setClassesTaken] = useState(0);

  const sml = useMediaQuery('(max-width:600px)');
  const med = useMediaQuery('(max-width:900px)');

  useEffect(() => {
    if (props.sessions) {
      setClassesTaken(props.sessions.length);
    }
  }, [props.sessions])

  let content = [];
  let classesTakenLabels = 
    [1, 5, 10, 20, 30, 50, 75, 100, 150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000]

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
      <Grid container direction="column" justify='center' alignItems="center" spacing={1}>
        <Grid item>
          <Typography variant='h3' className={classes.number} style={{color: "inherit"}}>{label}</Typography>
        </Grid>
        <Grid item>
          <DirectionsRunIcon />
        </Grid>
      </Grid>
    );
    let contentStyle = classes.milestone;

    if (classesTaken >= label) {
      contents = (
        <Grid container direction="column" justify='center' alignItems="center" spacing={1}>
          <Grid item>
            <Typography variant='h3' className={classes.number} style={{color: "inherit"}}>{label}</Typography>
          </Grid>
          <Grid item>
            <DirectionsRunIcon />
          </Grid>
        </Grid>
      );
      contentStyle = `${classes.milestone} ${classes.hit}`;
    }

    content.push(
      <Grid item key={fullLabel} xs={layout.width}>
        <Grid container direction='column' alignItems='center' justify='center' spacing={2}>
          <Grid item className={contentStyle}>
            {contents}
          </Grid>
          <Grid item>
            <Typography variant='body2' align='center'>{fullLabel}</Typography>
          </Grid>
        </Grid>
      </Grid>
    )
  })

  return (
    <Grid container direction="column" spacing={4}>
      <Grid item>
        <Typography variant='h3' align="center">Classes Taken</Typography>
      </Grid>
      <Grid item>
        <Grid container spacing={4} direction='row' justify='flex-start'>
          {content}
        </Grid>
      </Grid>
    </Grid>
  )
}