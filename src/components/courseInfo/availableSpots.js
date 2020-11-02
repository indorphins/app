import React from 'react';
import { 
  Grid, 
  Typography, 
  Card,
  makeStyles,
} from '@material-ui/core';
import { GroupAdd } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  cost: {
    fontWeight: "bold",
    display: "inline-block",
    width: "100%",
  },
  spotsContainer: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    cursor: "default",
    backgroundColor: theme.palette.grey[200],
  },
}));

export default function AvailableSpots(props) {
  const classes = useStyles();
  const { course } = props;
  let spotsContent = null;

  const takenSpots = course ? course.participants.length : 0;
  let spotsCount = takenSpots;
  if (course.available_spots <= 0) spotsCount = "FULL";
  
  if (course && (spotsCount || spotsCount === 0)) {
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