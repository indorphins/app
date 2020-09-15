import React from 'react';
import { Typography, Grid, makeStyles } from '@material-ui/core';
import { Check } from '@material-ui/icons';
import LinearProgress from '@material-ui/core/LinearProgress';

const useStyles = makeStyles((theme) => ({
  container: {
    borderColor: theme.palette.grey[400] + ' !important',
    borderBottom: '1px solid',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
  text: {
    paddingBottom: theme.spacing(1)
  },
  complete: {
    color: theme.palette.success.light,
  },
  progressRoot: {
    height: 15,
    borderRadius: 5,
    width: '100%'
  },
  progressColor: {
    backgroundColor: theme.palette.grey[200],
  },
  progressComplete: {
    borderRadius: 5,
    backgroundColor: theme.palette.success.light,
  },
  progressBar: {
    borderRadius: 5,
    backgroundColor: theme.palette.grey[400],
  }   
}));

export default function MilestoneItem(props) {
  const classes = useStyles();
  const { label, max, title, value, lvl } = props;
  const normalise = value => (value) * 100 / (max);

  let progress = (
    <Grid item container direction='row' alignItems='center' spacing={2}>
      <Grid item xs={9}>
        <LinearProgress 
          variant="determinate"
          value={normalise(value)}
          classes={{
            root: classes.progressRoot, 
            colorPrimary: classes.progressColor,
            bar: classes.progressBar,
          }}
        />
      </Grid>
      <Grid item xs={1}>
        <Typography align="center">{`${value}/${max}`}</Typography>
      </Grid>
    </Grid>
  );

  if (lvl === 'max') {
    progress = (
      <Grid item container direction='row' alignItems='center' spacing={2}>
        <Grid item xs={9}>
          <LinearProgress 
            variant="determinate"
            value={normalise(value)}
            classes={{
              root: classes.progressRoot, 
              colorPrimary: classes.progressColor,
              bar: classes.progressComplete,
            }}
          />
        </Grid>
        <Grid item xs={1}>
          <Typography align="center">
            <Check className={classes.complete} />
          </Typography>
        </Grid>
      </Grid>
    );
  }
  
  if (title && label) {
    return (
      <Grid container direction='column' className={classes.container} spacing={1}>
        <Grid item>
          <Typography variant='h4'>{title}</Typography>
        </Grid>
        <Grid item>
          <Typography variant='body1' className={classes.text}>{label}</Typography>
        </Grid>
        {progress}
      </Grid>
    )
  }

  return null;
}