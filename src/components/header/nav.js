import React, {useState, useEffect} from 'react';
import { useRouteMatch, useHistory } from 'react-router-dom';
import { Badge, Button, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { createSelector } from 'reselect';
import { useSelector } from 'react-redux';

import path from '../../routes/path';

const tabStyles = makeStyles((theme) => ({
  selected: {
    color: theme.palette.common.white,
    minWidth: 0,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    fontSize: '1rem',
    '@media (max-width: 900px)': {
      fontSize: ".8rem",
    },
  },
  unselected: {
    color: theme.palette.grey[400],
    fontWeight: 400,
  },
  badge: {
    fontSize: '.6rem',
    fontWeight: "bold",
    color: theme.palette.secondaryColor.contrastText,
    backgroundColor: theme.palette.secondaryColor.main,
  }
}));

function TabItem(props) {

  const classes = tabStyles();

  let style = classes.selected;

  if (props.value !== props.tab) {
    style = `${classes.selected} ${classes.unselected}`
  }

  if (props.badge) {

    return (
      <Badge badgeContent={props.badge} classes={{badge:classes.badge}}>
        <Button onClick={props.onClick} className={style}>
          {props.label}
        </Button>
      </Badge>
    )

  } else {

    return (
      <Button onClick={props.onClick} className={style}>
        {props.label}
      </Button>
    )
  }
}

const getUserSelector = createSelector([state => state.user.data], (user) => {
  return user;
});

const getSessions = createSelector([state => state.milestone.sessions], (sessions) => {
  return sessions.length;
});

export default function(props) {

  const [tab, setTab] = useState(0);
  const history = useHistory();
  const instructors = useRouteMatch(path.instructors);
  const user = useSelector(state => getUserSelector(state));
  const sessions = useSelector(state => getSessions(state));

  let home = useRouteMatch({ path: path.home, strict: true});
  let courses = useRouteMatch({ path: path.courses, strict: true});
  let milestone = useRouteMatch(path.milestone);
  let admin = useRouteMatch(path.admin);
  let refer = useRouteMatch(path.referFriend);


  useEffect(() => {
    if (home && home.isExact) {
      return setTab(0);
    }
    
    if (courses && courses.isExact) {
      return setTab("Classes");
    }
    
    if (milestone) {
      return setTab("Milestones");
    }
    
    if (instructors && instructors.isExact) {
      return setTab("Instructors");
    }
    
    if (admin && admin.isExact && user && user.type === 'admin') {
      return setTab("Admin");
    }
    
    setTab(0);
  }, [home, courses, milestone, admin]);

  useEffect(() => {
    if (refer && sessions > 0) {
      return setTab("Refer")
    }
  }, [refer, sessions])

  async function navCourses() {
    history.push(path.courses);
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
      <TabItem
        tab={tab}
        value="Admin"
        label="Admin"
        onClick={navAdmin}
      />
    )
  }

  let referFriend = null;

  if (sessions > 0) {

    if (user.referrerId) {
      referFriend = (
        <TabItem
          tab={tab}
          value="Refer"
          label="Refer &amp; Earn"
          onClick={navRefer}
        />
      );
    } else {

      referFriend = (
        <TabItem
          badge="NEW"
          tab={tab}
          value="Refer"
          label="Refer &amp; Earn"
          onClick={navRefer}
        />
      );
    }
  }

  return (
    <Grid>
      <TabItem
        tab={tab}
        value="Classes"
        label="Classes"
        onClick={navCourses}
      />
      <TabItem
        tab={tab}
        value="Instructors"
        label="Instructors"
        onClick={navInstructors}
      />
      <TabItem
        tab={tab}
        value="Milestones"
        label="Milestones"
        onClick={navMilestones}
      />
      {adminTab}
      {referFriend}
    </Grid>
  )
}