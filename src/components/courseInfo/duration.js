import React from 'react';
import { 
  Grid, 
  Typography, 
  Card, 
} from '@material-ui/core';
import { AvTimer } from '@material-ui/icons';

export default function Duration(props) {
  const { course, classes } = props;

  let durationContent = null;

  if (course.duration) {
    durationContent = (
      <Card className={classes.spotsContainer} title="Class duration in minutes">
        <Grid container direction="column" justify="center" alignItems="center">
          <Grid item>
            <AvTimer color="primary" />
          </Grid>
          <Grid item>
            <Typography className={classes.cost} variant="h2" align="center">
              {course.duration}
            </Typography>
          </Grid>
        </Grid>
      </Card>
    );
  }

  return durationContent;
}