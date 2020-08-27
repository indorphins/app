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
  const classes = useStyles();
  const history = useHistory();
  let home = useRouteMatch({ path: path.home, strict: true});
  let milestones = useRouteMatch(path.milestone);

  useEffect(() => {
    if (home && home.isExact) {
      setTab(1);
    } else {
      setTab(0);
    }
  }, [home]);

  useEffect(() => {
    if (milestones) {
      setTab(3);
    }
  })

  async function navHome() {
    history.push(path.home);
  }

  async function navMilestone() {
    history.push(path.milestone);
  }

  let milestoneTab = (
    <Tab value={2} label="Milestones" onClick={navMilestone} className={classes.tab} />
  )

  return (
    <Tabs
    value={tab}
    indicatorColor="primary"
    textColor="secondary"
    >
      <Tab value={0} className={classes.hidden} />
      <Tab value={1} label="Classes" onClick={navHome} className={classes.tab} />
      {milestoneTab}
    </Tabs>
  )
}