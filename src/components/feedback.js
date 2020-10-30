import React, { useState, useEffect } from 'react';
import { Grid, Modal, Paper, IconButton, Typography, makeStyles } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import { useRouteMatch } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import CourseFeedback from './form/courseFeedback';
import path from '../routes/path';

const useStyles = makeStyles((theme) => ({
  container: {
    height: "100%",
    outline: "0",
  },
  content: {
    paddingBottom: theme.spacing(4),
    paddingRight: theme.spacing(4),
    paddingLeft: theme.spacing(4),
  }
}));

const courseFeedbackSelector = createSelector([(state) => state.feedback], (feedback) => {
  return feedback.show;
});

const courseSelector = createSelector([(state) => state.feedback], (feedback) => {
  return feedback.course;
});

const sessionIdSelector = createSelector([(state) => state.feedback], (feedback) => {
  return feedback.sessionId;
});

export default function Feedback() {
  const classes = useStyles();
  const showFeedback = useSelector((state) => courseFeedbackSelector(state));
  const [ showFeedbackForm, setShowFeedbackForm ] = useState(false);
  const course = useSelector((state) => courseSelector(state));
  const sessionId = useSelector((state) => sessionIdSelector(state));
  let match = useRouteMatch({
    path: path.courseJoinSession,
    strict: true,
  });

  useEffect(() => {
    if (showFeedback && !match) {
      setShowFeedbackForm(true);
    }
  }, [showFeedback, match]);

  function closeModal() {
    setShowFeedbackForm(false);
  }

  let close = (
    <IconButton onClick={closeModal}>
      <Close />
    </IconButton>
  );

  let formContent = (
    <Paper>
      <Grid container direction="row" justify="flex-end">
        <Grid item>
          {close}
        </Grid>
      </Grid>
      <Grid container direction="column" spacing={1} className={classes.content}>
        <Grid item>
          <Typography variant="h3" align="center">
            Let us know what you thought
          </Typography>
          <Typography variant="h6" align="center">
            Your feedback is important to us
          </Typography>
        </Grid>
        <Grid item>
          <CourseFeedback course={course} sessionId={sessionId} onSubmit={() => closeModal()} />
        </Grid>
      </Grid>
    </Paper>
  );

  let content = null;

  if (showFeedbackForm) {
    content = (
      <Modal open={showFeedbackForm} style={{overflowY: "scroll"}}>
        <Grid container direction="row" justify="center" className={classes.container}>
          <Grid item xs={5}>
            <Grid container direction="column" justify="center" className={classes.container}>
              <Grid item>
                {formContent}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Modal>
    );
  }

  return content;
}