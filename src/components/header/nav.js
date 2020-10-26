import React, {useState, useEffect} from 'react';
import { useRouteMatch, useHistory } from 'react-router-dom';
import { Tab, Tabs } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { createSelector } from 'reselect';
import { useSelector } from 'react-redux';

import path from '../../routes/path';

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
    display: 'none',
  },
}));

const getUserSelector = createSelector([state => state.user.data], (user) => {
  return user;
});

const getSessions = createSelector([state => state.milestone.sessions], (sessions) => {
  return sessions.length;
});

export default function(props) {

  const [tab, setTab] = useState(0);
  const classes = useStyles();
  const history = useHistory();
  const instructors = useRouteMatch(path.instructors);
  const user = useSelector(state => getUserSelector(state));
  const sessions = useSelector(state => getSessions(state));
  let home = useRouteMatch({ path: path.home, strict: true});
  let milestone = useRouteMatch(path.milestone);
  let admin = useRouteMatch(path.admin);
  let refer = useRouteMatch(path.referFriend);


  useEffect(() => {
    if (home && home.isExact) {
      setTab("Classes");
    } else if (milestone) {
      setTab("Milestones");
    } else if (instructors && instructors.isExact) {
      setTab("Instructors");
    } else if (admin && admin.isExact && user && user.type === 'admin') {
      setTab("Admin")
    } else if (refer) {
      setTab("Refer")
    } else {
      setTab(0);
    }
  }, [home, milestone, admin, refer]);

  async function navHome() {
    history.push(path.home);
  }

  async function navMilestones() {
    history.push(path.milestone);
  }

  async function navInstructors() {
    history.push(path.instructors);
  }

  async function navAdmin() {
    history.push(path.admin);
  }

  async function navRefer() {
    history.push(path.referFriend);
  }

  let adminTab = null;

  if (user && user.type === 'admin') {
    adminTab = (
      <Tab
        value="Admin"
        label="Admin"
        onClick={navAdmin}
        className={classes.tab}
        classes={{selected: classes.color}}
      />
    )
  }

  let referFriend = null;

  if (sessions > 0) {
    referFriend = (
      <Tab
        value="Refer"
        label="Refer &amp; Earn"
        onClick={navRefer}
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
        value="Classes"
        label="Classes"
        onClick={navHome}
        className={classes.tab}
        classes={{selected: classes.color}}
      />
      <Tab
        value="Instructors"
        label="Instructors"
        onClick={navInstructors}
        className={classes.tab}
        classes={{selected: classes.color}}
      />
      <Tab
        value="Milestones"
        label="Milestones"
        onClick={navMilestones}
        className={classes.tab}
        classes={{selected: classes.color}}
      />
      {adminTab}
      {referFriend}
    </Tabs>
  )
}