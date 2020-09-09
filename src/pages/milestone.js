import React from 'react';
import { Container, Grid } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { makeStyles } from '@material-ui/core/styles';
import Milestone from '../components/milestone';
import FitnessCenterIcon from '@material-ui/icons/FitnessCenter';
import DirectionsRunIcon from '@material-ui/icons/DirectionsRun';
import WhatshotIcon from '@material-ui/icons/Whatshot';
import StarIcon from '@material-ui/icons/Star';
import WeekendIcon from '@material-ui/icons/Weekend';
import RepeatIcon from '@material-ui/icons/Repeat';
import Looks4Icon from '@material-ui/icons/Looks4';
import Filter3Icon from '@material-ui/icons/Filter3';
import Filter2Icon from '@material-ui/icons/Filter2';
import Brightness4Icon from '@material-ui/icons/Brightness4';
import Brightness7Icon from '@material-ui/icons/Brightness7';
import Brightness5Icon from '@material-ui/icons/Brightness5';
import BusinessCenterIcon from '@material-ui/icons/BusinessCenter';
import BookmarksIcon from '@material-ui/icons/Bookmarks';
import ChildCareIcon from '@material-ui/icons/ChildCare';
import ContactsIcon from '@material-ui/icons/Contacts';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import FaceIcon from '@material-ui/icons/Face';

const useStyles = makeStyles((theme) => ({
  column: {
    paddingTop: theme.spacing(3),
  }, 
  row: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }
}));

const getSessionsSelector = createSelector([state => state.user.sessions], (sessions) => {
  return sessions;
});

export default function Milestones(props) {
  // const sessions = useSelector(state => getSessionsSelector(state));
  const classes = useStyles();

  return (
    <Container>
      <Grid container direction="column" className={classes.column} spacing={6}>
        <Grid container direction='row' justify='space-evenly' className={classes.row} spacing={2}>
          <Grid item>
            <Milestone label='Rookie' iconText='1' tooltip='Taken 1 Class' format={1} hit>
              <ChildCareIcon />
            </Milestone>
          </Grid>
          <Grid item>
            <Milestone label='Starter' iconText='5' tooltip='Taken 5 Classes' format={1} hit>
              <FaceIcon />
            </Milestone>
          </Grid>
          <Grid item>
            <Milestone label='Pro' iconText='10' tooltip='Taken 10 Classes' format={1} hit>
              <DirectionsRunIcon />
            </Milestone>
          </Grid>
          <Grid item>
            <Milestone label='Expert' iconText='25' tooltip='Taken 25 Classes' format={1} >
              <DirectionsRunIcon />
            </Milestone>
          </Grid>
        </Grid>
        <Grid container direction='row' justify='space-evenly' className={classes.row} spacing={2}>
          <Grid item>
            <Milestone label='Double Discipline' iconText='2' tooltip='Take 2 Different Class Types' format={2} hit>
              <BookmarksIcon />
            </Milestone>
          </Grid>
          <Grid item>
            <Milestone label='Multi Discipline' iconText='3+' tooltip='Take 3+ Different Class Types' format={2} >
              <ContactsIcon />
            </Milestone>
          </Grid>
        </Grid>
        <Grid container direction='row' justify='space-evenly' className={classes.row} spacing={2}>
          <Grid item>
            <Milestone label='Double Up' iconText='2x' tooltip='2 Classes in 1 Day' format={3} >
              <DoneAllIcon />
            </Milestone>
          </Grid>
          <Grid item>
            <Milestone label='Quad Week' iconText='4' tooltip='4 Classes in 1 Week' format={4} hit >
              <Looks4Icon />
            </Milestone>
          </Grid>
          <Grid item>
            <Milestone label='Daily Double' iconText='2x7' tooltip='2 Classes per day for a Week' format={5} >
              <FitnessCenterIcon />
            </Milestone>
          </Grid>
        </Grid>
        <Grid container direction='row' justify='space-evenly' className={classes.row} spacing={2}>
          <Grid item>
            <Milestone label='2 Week Streak' iconText='2' tooltip='Took class back to back weeks' format={6} hit >
              <WhatshotIcon />
            </Milestone>
          </Grid>
          <Grid item>
            <Milestone label='5 Week Streak' iconText='5'
              tooltip='Took 1 Class each week for 5 weeks in a row' format={6} hit
            >
              <WhatshotIcon />
            </Milestone>
          </Grid>
          <Grid item>
            <Milestone label='10 Week Streak' iconText='10' 
              tooltip='Took 1 Class each week for 10 weeks in a row' format={6} 
            >
              <WhatshotIcon />
            </Milestone>
          </Grid>
        </Grid>
        <Grid container direction='row' justify='space-evenly' className={classes.row} spacing={2}>
          <Grid item>
            <Milestone label='Double Dipper' iconText='DD' 
              tooltip='Taken class with 2 different instructors' format={6} hit
            >
              <Filter2Icon />
            </Milestone>
          </Grid>
          <Grid item>
            <Milestone label='Triple Scooper' iconText='3x' 
              tooltip='Taken class with 3 different instructors' format={6} 
            >
              <Filter3Icon />
            </Milestone>
          </Grid>
        </Grid>
        <Grid container direction='row' justify='space-evenly' className={classes.row} spacing={2}>
          <Grid item>
            <Milestone label='Early Bird' iconText='Bird' tooltip='Take a morning class' format={7} >
              <Brightness5Icon />
            </Milestone>
          </Grid>
          <Grid item>
            <Milestone label="It's High Noon" iconText='Noon' tooltip='Take a midday class' format={7} hit>
              <Brightness7Icon />
            </Milestone>
          </Grid>
          <Grid item>
            <Milestone label='Night Owl' iconText='Owl' tooltip='Take an evening class' format={7} >
              <Brightness4Icon />
            </Milestone>
          </Grid>
        </Grid>
        <Grid container direction='row' justify='space-evenly' className={classes.row} spacing={2}>
          <Grid item>
            <Milestone label='Weekend Warrior' iconText='WW' tooltip='Take a weekend class' format={8} hit >
              <WeekendIcon />
            </Milestone>
          </Grid>
          <Grid item>
            <Milestone label='Weekday Warrior' iconText='WW' tooltip='Take a weekday class' format={8} >
              <BusinessCenterIcon />
            </Milestone>
          </Grid>
        </Grid>
        <Grid container direction='row' justify='space-evenly' className={classes.row} spacing={2}>
          <Grid item>
            <Milestone label='Righteous Repeater' iconText='RR' tooltip='Took 1 class 5 times' format={9} hit>
              <RepeatIcon />
            </Milestone>
          </Grid>
          <Grid item>
            <Milestone label='Master Indoorphiner' iconText='10' tooltip='Collected Every Milestone!' format={10} >
              <StarIcon />
            </Milestone>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
}
