import React from 'react';
import { 
  Grid, 
  Typography, 
  Card,
  makeStyles,
} from '@material-ui/core';
import { ShoppingCartOutlined } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  cost: {
    fontWeight: "bold",
    display: "inline",
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

export default function Cost(props) {
  const classes = useStyles();
  const { course, discountPrice } = props;


  function isInteger(n) {
    return n === +n && n === (n|0);
  }

  let content = null;

  if (course.cost && course.cost > 0) {

    let costText = "$" + course.cost.toFixed(2);

    if (isInteger(course.cost)) {
      costText = "$" + course.cost;
    }

    content = (
      <Grid item>
        <Typography className={classes.cost} variant="h2">
          {costText}
        </Typography>
      </Grid>
    );

    if (discountPrice || discountPrice === 0) {
      let text = "$" + discountPrice.toFixed(2);

      if (isInteger(discountPrice)) {
        text = "$" + discountPrice;
      }

      if (discountPrice === 0) {
        text = "FREE"
      }
      content = (
        <Grid item>
          <Typography className={classes.cost} variant="h2" style={{paddingRight: "8px"}}>
            <strike>${course.cost}</strike>
          </Typography>
          <Typography className={classes.cost} variant="h2">
            {text}
          </Typography>
        </Grid>
      );
    }

    return (
      <Card
        className={classes.spotsContainer}
        title="Per class cost. Classes can be left up to 24 hours before the class start time"
      >
        <Grid container direction="column" justify="center" alignItems="center">
          <Grid item>
            <ShoppingCartOutlined color="primary" />
          </Grid>
          {content}
        </Grid>
      </Card>
    );
  }

  return null;
}