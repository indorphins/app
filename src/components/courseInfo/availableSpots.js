import React from 'react';
import { 
  Grid, 
  Typography, 
  Card, 
} from '@material-ui/core';
import { GroupAdd } from '@material-ui/icons';

export default function AvailableSpots(props) {
  const { course, classes } = props;
  let spotsContent = null;

  const takenSpots = course.participants ? course.participants.length : 0;
  let spotsCount = `${takenSpots}/${course.total_spots}`;
  if (course.available_spots <= 0) spotsCount = "FULL";
  
  if (spotsCount) {
    spotsContent = (
      <Card className={classes.spotsContainer} title="Spaces remaining">
        <Grid container direction="column" justify="center" alignItems="center">
          <Grid item>
            <GroupAdd color="primary" />
          </Grid>
          <Grid item>
            <Typography className={classes.cost} variant="h2" align="center">
              {spotsCount}
            </Typography>
          </Grid>
        </Grid>
      </Card>
    );
  }

  return spotsContent;
}