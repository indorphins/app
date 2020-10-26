import React from 'react';
import { Container, Grid, makeStyles, useMediaQuery, Typography } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(4),
  }
}));

export default function ReferBonus() {
  const classes = useStyles();
  const sml = useMediaQuery('(max-width:600px)');
  const med = useMediaQuery('(max-width:900px)');

  let layout = null;
  if (sml) {
    layout = {
      descWidth: 12,
      txtWidth: 12
    };
  } else if (med) {
    layout = {
      descWidth: 6,
      txtWidth: 9
    }
  } else {
    layout = {
      descWidth: 5,
      txtWidth: 9
    }
  }

  return (
    <Container className={classes.root}>
      <Grid container direction="row" justify="center">
        <Grid item xs={layout.descWidth}
          container
          spacing={2}
          direction="column"
          justify="center"
          alignItems="center"
          alignContent="center"
        >
          <Grid item>
            <img alt="present" src="/img/presentArt.png" />
          </Grid>
          <Grid item>
            <Typography variant="h2">Give $20, Get $10</Typography>
          </Grid>
          <Grid item xs={layout.txtWidth}>
            <Typography variant="body1" align="center">
              Get $10 in credits when someone signs up using your referral link and books their first paid class.
              Your friend also gets $20 off ($5 off their next 4 classes)
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  )
}