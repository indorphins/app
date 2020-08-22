import React from 'react';
import { Grid, Typography } from '@material-ui/core';

import CreateMessage from '../form/createMessage';

export default function Message(props) {
  const { currentUser, course } = props;
  let content = null;

  if (currentUser.type === "instructor" || currentUser.type === "admin") {
    content = (
      <Grid container direction="column">
        <Grid item>
          <Typography variant="h5">
            Send your class a message
          </Typography>
        </Grid>
        <Grid>
          <CreateMessage courseId={course.id} />
        </Grid>
      </Grid>
    )
  }

  return content;
}