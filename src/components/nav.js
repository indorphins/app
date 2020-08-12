import React, {useState, useEffect} from 'react';
import { useRouteMatch, useHistory } from 'react-router-dom';
import { Tab, Tabs } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import path from '../routes/path';

const useStyles = makeStyles((theme) => ({
  hidden: {
    display: "none",
    visibility: "hidden",
  },
  tab: {
    '@media (max-width: 900px)': {
      fontSize: ".8rem",
    },
  },
}));

export default function(props) {

  const [tab, setTab] = useState(0);
  const [profileLabel, setProfileLabel] = useState("My Schedule");
  const [showProfile, setShowProfile] = useState(false);
  const currentUser = props.user;
  const classes = useStyles();
  const history = useHistory();
  let home = useRouteMatch({ path: path.home, strict: true});
  let profile = useRouteMatch(path.schedule);
  let instructor = useRouteMatch(path.instructorProfile);

  useEffect(() => {
    if (home && home.isExact) {
      setTab(1);
    } else {
      setTab(0);
    }
    setProfileLabel('My Schedule');
  }, [home]);

  useEffect(() => {
    if (profile) {
      setShowProfile(true);
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
    history.push(path.schedule);
  }

  let profileTab = null;

  if (showProfile) {
    profileTab = (
      <Tab value={2} label={profileLabel} onClick={navProfile} className={classes.tab} />
    );
  }

  return (
    <Tabs
    value={tab}
    indicatorColor="primary"
    textColor="secondary"
    >
      <Tab value={0} className={classes.hidden} />
      <Tab value={1} label="Classes" onClick={navHome} className={classes.tab} />
      {profileTab}
    </Tabs>
  )
}