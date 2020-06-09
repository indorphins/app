import React, { useState, useEffect }  from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Grid, CircularProgress, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import Header from '../../components/header';
import Opentok from '../../components/Opentok';
import * as Course from '../../api/course';
import path from '../../routes/path';
import log from '../../log';


const useStyles = makeStyles((theme) => ({
  '@global': {
    '#root': {
      height: '100%',
    }
  },
  root: {
    height: '100%',
  },
  contentCol: {
    /*flex: 1,
    overflow: 'auto',*/
    padding: theme.spacing(2),
  }
}));

const headerStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    /*display: 'flex',
    flexFlow: 'column',*/
  },
  logo: {
    fontSize: '1.5rem',
  },
  appbar: {
    padding: theme.spacing(0.5),
    '@media (max-width: 600px)': {
      padding: theme.spacing(0.5),
    }
  },
  themeBtn: {
    padding: theme.spacing(1),
    marginRight: theme.spacing(1),
    '@media (max-width: 600px)': {
      marginRight: theme.spacing(1),
    }
  },
}));

const getUserSelector = createSelector([state => state.user.data], (user) => {
  return user;
});

export default function() {

  const currentUser = useSelector(state => getUserSelector(state));
  const classes = useStyles();
  const history = useHistory();
  const params = useParams();
  const [authData, setAuthData] = useState({});
  const [loader, setLoader] = useState(true);

  const init = async function(classId) {

    if (!currentUser.id) return;

    let data;
    try {
      data = await Course.getSessionInfo(classId);
    } catch(err) {
      //TODO: redirect to class page with error message or display error here
      console.error(err);
      log.error("OPENTOK:: session join", err);
      history.push(path.courses + classId);
      return;
    }
    setAuthData(data);
    setLoader(false);
  }

  useEffect(() => {
    init(params.id);
  }, [params.id, currentUser]);

  let chatContent = (
    <Opentok credentials={authData}></Opentok>
  );

  /*let chatContent = (
    <Typography variant="h4">test</Typography>
  )*/

  let content = (
    <CircularProgress color="secondary" />
  );

  if (!loader) {
    content = chatContent;
  }

  return (
    <Grid className={classes.root}>
      <Header className={headerStyles}>
        <Grid className={classes.contentCol}>
          <Grid container direction="row" justify="center" alignItems="center" alignContent="center" className={classes.root}>
            {content}
          </Grid>
        </Grid>
      </Header>
    </Grid>
  );
};