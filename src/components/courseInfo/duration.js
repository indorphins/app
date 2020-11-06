import React from 'react';
import { 
  Grid, 
  Typography, 
  Card,
  makeStyles
} from '@material-ui/core';
import { AvTimer } from '@material-ui/icons';

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

export default function Duration(props) {
  const classes = useStyles();
  const { course } = props;

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