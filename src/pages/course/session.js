import React, { useState, useEffect }  from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Container, Grid, CircularProgress } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import Opentok from '../../components/Opentok';
import * as Course from '../../api/course';
import path from '../../routes/path';
import log from '../../log';

const getUserSelector = createSelector([state => state.user.data], (user) => {
  return user;
});

export default function() {

  const currentUser = useSelector(state => getUserSelector(state));
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

  let content = (
    <CircularProgress color="secondary" />
  );

  if (!loader) {
    content = chatContent;
  }

  return (
    <Container>
      <Grid container direction="row">
        {content}
      </Grid>
    </Container>
  );
};