import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, makeStyles } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import ClassesTaken from '../components/milestones/classesTaken';
import WeeklyStreak from '../components/milestones/weeklyStreak';
import log from '../log';

const getUserSelector = createSelector([state => state.user.data], (user) => {
  return user;
});

const useStyles = makeStyles((theme) => ({
 
}));

export default function Milestones(props) {
  const user = useSelector(state => getUserSelector(state));
  const classes = useStyles();


  return (
    <Grid container>
      <ClassesTaken />
      <br/>
      <WeeklyStreak />  
    </Grid>
  );
}
