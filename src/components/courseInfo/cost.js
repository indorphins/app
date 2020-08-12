import React from 'react';
import { 
  Grid, 
  Typography, 
  Card, 
} from '@material-ui/core';
import { ShoppingCartOutlined } from '@material-ui/icons';

export default function Cost(props) {
  const { course, classes } = props;

  let content = null;

  if (course.cost && course.cost > 0) {
    content = (
      <Card
        className={classes.spotsContainer}
        title="Per class cost. Classes can be left up to 24 hours before the class start time"
      >
        <Grid container direction="column" justify="center" alignItems="center">
          <Grid item>
            <ShoppingCartOutlined color="primary" />
          </Grid>
          <Grid item>
            <Typography className={classes.cost} variant="h2" align="center">
              ${course.cost}
            </Typography>
          </Grid>
        </Grid>
      </Card>
    );
  }

  return content;
}