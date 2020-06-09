import React, {useState, useEffect} from 'react';
import { useRouteMatch, useHistory } from 'react-router-dom';
import { Tab, Tabs } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import path from '../routes/path';

const useStyles = makeStyles((theme) => ({
  hidden: {
    display: "none",
    visibility: "hidden",
  }
}));

export default function() {

  const [tab, setTab] = useState(0);
  const [profileLabel, setProfileLabel] = useState("My Schedule");
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
  }, [profile]);

  useEffect(() => {
    if (instructor) {
      setProfileLabel('Instructor');
    }
  }, [instructor]);

  useEffect(() => {
    if (!home && !profile && !instructor) {
      setTab(null);
    }
  }, [home, profile, instructor]);


  async function navHome() {
    history.push(path.home);
  }

  async function navProfile() {
    history.push(path.profile);
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
    <Tab value={2} label={profileLabel} onClick={navProfile} />
  </Tabs>
  )
}