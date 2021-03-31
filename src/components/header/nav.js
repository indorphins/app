import React, {useState, useEffect} from 'react';
import { useRouteMatch, useHistory } from 'react-router-dom';
import { Badge, Button, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { createSelector } from 'reselect';
import { useSelector } from 'react-redux';

import path from '../../routes/path';

const tabStyles = makeStyles((theme) => ({
  selected: {
    color: theme.palette.common.black,
    minWidth: 0,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    whiteSpace: "nowrap",
    fontSize: '1rem',
    textTransform: 'capitalize',
    '@media (max-width: 900px)': {
      fontSize: ".8rem",
    },
  },
  unselected: {
    color: theme.palette.grey[900],
    fontWeight: 300,
  },
  badge: {
    fontSize: '.6rem',
    fontWeight: "bold",
    color: theme.palette.secondaryColor.main,
    backgroundColor: theme.palette.common.black,
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
          <Typography variant='body1'>{props.label}</Typography>
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

export default function(props) {

  const [tab, setTab] = useState(0);
  const history = useHistory();
  const instructors = useRouteMatch(path.instructors);
  const user = useSelector(state => getUserSelector(state));

  let home = useRouteMatch({ path: path.home, strict: true});
  let courses = useRouteMatch({ path: path.courses, strict: true});
  let milestone = useRouteMatch(path.milestone);
  let admin = useRouteMatch(path.admin);
  let refer = useRouteMatch(path.referFriend);
  let reports = useRouteMatch(path.reports);


  useEffect(() => {
    if (home && home.isExact) {
      return setTab('Classes');
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
    
    if (refer) {
      return setTab("Refer");
    }
    
    if (admin && admin.isExact) {
      return setTab("Admin");
    }
    if (reports && reports.isExact) {
      return setTab("Reports");
    }

    setTab(0);
  }, [home, courses, milestone, admin, refer]);

  useEffect(() => {
    if (user && user.type === 'admin') {
      if (admin && admin.isExact) {
        return setTab("Admin");
      }
      
      if (reports && reports.isExact) {
        return setTab("Reports");
      }
    }

  }, [user, admin]);


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

  async function navReports() {
    history.push(path.reports);
  }

  let adminTab, reportsTab = null;

  if (user && user.type === 'admin') {
    adminTab = (
      <TabItem
        tab={tab}
        value="Admin"
        label="Admin"
        onClick={navAdmin}
      />
    )
    reportsTab = (
      <TabItem
        tab={tab}
        value="Reports"
        label="Reports"
        onClick={navReports}
      />
    )
  }

  let referFriend = null;
  let msContent;

  if (user && user.id) {
    msContent = (
      <TabItem
        tab={tab}
        value="Milestones"
        label="Milestones"
        onClick={navMilestones}
      />
    )
  }

  return (
    <Grid style={{display: "flex"}}>
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
      {msContent}
      {referFriend}
      {reportsTab}
      {adminTab}
    </Grid>
  )
}