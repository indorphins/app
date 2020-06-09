import React, {useState, useEffect} from 'react';
import { useRouteMatch, useHistory } from 'react-router-dom';
import { Tab, Tabs } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import path from '../routes/path';

const getUserSelector = createSelector([state => state.user.data], (user) => {
  return user;
});

const useStyles = makeStyles((theme) => ({
  hidden: {
    display: "none",
    visibility: "hidden",
  }
}));

export default function() {

  const [tab, setTab] = useState(0);
  const [profileLabel, setProfileLabel] = useState("My Schedule");
  const [showProfile, setShowProfile] = useState(false);
  const currentUser = useSelector(state => getUserSelector(state));
  const classes = useStyles();
  const history = useHistory();
  let home = useRouteMatch({ path: path.home, strict: true});
  let profile = useRouteMatch(path.profile);
  let instructor = useRouteMatch(path.instructorProfile);

  useEffect(() => {
    console.log(home);
    if (home && home.isExact) {
      setTab(1);
    } else {
      setTab(0);
    }
  }, [home]);

  useEffect(() => {
    if (profile) {
      setTab(2);
      setProfileLabel('My Schedule');
    }
  }, [profile, currentUser]);

  useEffect(() => {
    if (instructor) {
      setShowProfile(true);
      setTab(2);
      setProfileLabel('Instructor');
    }
  }, [instructor]);

  useEffect(() => {
    
  }, [showProfile]);

  useEffect(() => {
    if (currentUser.id) {
      setShowProfile(true);
    } else {
      setShowProfile(false);
    }
  }, [currentUser])


  async function navHome() {
    history.push(path.home);
  }

  async function navProfile() {
    history.push(path.profile);
  }

  let profileTab = null;

  if (showProfile) {
    profileTab = (
      <Tab value={2} label={profileLabel} onClick={navProfile} />
    );
  }

  return (
    <Tabs
    value={tab}
    indicatorColor="secondary"
    textColor="secondary"
    aria-label="disabled tabs example"
  >
    <Tab value={0} className={classes.hidden} />
    <Tab value={1} label="Classes" onClick={navHome} />
    {profileTab}
  </Tabs>
  )
}