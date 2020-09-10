import React from 'react';
import { Typography, Grid, makeStyles } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';

const BorderLinearProgress = withStyles((theme) => ({
  root: {
    height: 15,
    borderRadius: 5,
    width: '100%'
  },
  colorPrimary: {
    backgroundColor: theme.palette.grey[200],
  },
  bar: {
    borderRadius: 5,
    backgroundColor: theme.palette.grey[400],
  },
}))(LinearProgress);

const useStyles = makeStyles((theme) => ({
  container: {
    borderColor: theme.palette.grey[400] + ' !important',
    borderBottom: '1px solid',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
  barContainer: {
    width: '75%',
    flexWrap: 'nowrap'
  },
  bar: {
    width: '90%',
  },
  barText: {
    width: '10%',
    marginLeft: theme.spacing(4)
  },
  text: {
    paddingBottom: theme.spacing(1)
  }
}));

export default function Milestone(props) {
  const classes = useStyles();
  const { label, max, title, value } = props;

  const normalise = value => (value) * 100 / (max);

  
  if (title && label) {
    return (
      <Grid container direction='column' alignItems='flex-start' className={classes.container}>
        <Typography variant='h4' className={classes.text}>{title}</Typography>
        <Typography variant='body1' className={classes.text}>{label}</Typography>
        <Grid container direction='row' alignItems='center' className={classes.barContainer}>
          <BorderLinearProgress variant="determinate" value={normalise(value)} className={classes.bar} />
          <Typography className={classes.barText}>{`${value}/${max}`}</Typography>
        </Grid>
      </Grid>
    )
  }

  return null;
}