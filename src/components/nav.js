import React, {useState, useEffect} from 'react';
import { useRouteMatch, useHistory } from 'react-router-dom';
import { Tab, Tabs } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import path from '../routes/path';

const useStyles = makeStyles((theme) => ({
  hidden: {
    display: "none",
    visibility: "hidden",
  },
  tab: {
    color: theme.palette.common.white,
    minWidth: 0,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    fontSize: '1rem',
    '@media (max-width: 900px)': {
      fontSize: ".8rem",
    },
  },
  color: {
    color: theme.palette.common.white,
  },
  indicator: {
    backgroundColor: theme.palette.common.white,
  },
}));

const getUserSelector = createSelector([state => state.user.data], (user) => {
  return user;
});

export default function(props) {

  const [tab, setTab] = useState(0);
  const currentUser = useSelector(state => getUserSelector(state));
  const classes = useStyles();
  const history = useHistory();
  let home = useRouteMatch({ path: path.home, strict: true});
  let schedule = useRouteMatch(path.schedule);
  let milestone = useRouteMatch(path.milestone)

  useEffect(() => {
    if (home && home.isExact) {
      setTab(1);
    } else if (milestone) {
      setTab(2);
    } else if (currentUser.id && schedule) {
      setTab(3);
    }  else {
      setTab(0);
    }
  }, [home]);

  async function navHome() {
    history.push(path.home);
  }

  async function navSchedule() {
    history.push(path.schedule);
  }

  async function navMilestones() {
    history.push(path.milestone);
  }

  let scheduleTab = null;

  if (currentUser.id) {
    scheduleTab = (
      <Tab 
        value={3}
        label="My Schedule"
        onClick={navSchedule}
        className={classes.tab}
        classes={{selected: classes.color}}
      />
    )
  }

  return (
    <Tabs
    value={tab}
    classes={{
      indicator: classes.indicator,
    }}
    >
      <Tab value={0} className={classes.hidden} classes={{selected: classes.color}} />
      <Tab
        value={1}
        label="Classes"
        onClick={navHome}
        className={classes.tab}
        classes={{selected: classes.color}}
      />
      <Tab
        value={2}
        label="Milestones"
        onClick={navMilestones}
        className={classes.tab}
        classes={{selected: classes.color}}
      />
      {scheduleTab}
    </Tabs>
  )
}