import React, { useState } from 'react';
import { 
  Grid, 
  Typography, 
  Checkbox,
  Button,
} from '@material-ui/core';
import Cards from '../../components/cards';

export default function CoursePayment(props) {
  
  const { classes, hideAddCard } = props;
  const [userConsent, setUserConsent] = useState(false);

  const handleConsent = function() {
    setUserConsent(!userConsent);
  }

  let userConsentContent = (
    <Grid container direction="row" alignItems="center" className={classes.consentContainer}>
      <Grid item>
        <Checkbox checked={userConsent} color="primary" onChange={handleConsent} />
      </Grid>
      <Grid item>
        <Typography
          variant="body1"
          className={classes.userAccept}
        >
          <span>I understand that any fitness class can put my health at risk, I attest that I am </span>
          <span>physically fit to take this class and I take full responsibility for my physical </span>
          <span>well being. I continue to agree to the </span>
          <span><a className={classes.link} href="/TOS.html" target="_blank">Terms of Service</a> </span>
          <span>and give permission for my payment method to be charged.</span>
        </Typography>
      </Grid>
    </Grid>
  );

  let paymentContent = (
    <Grid container direction="column" justify="flex-start" spacing={2} style={{flexWrap: "nowrap"}}>
      <Grid item>
        <Typography variant="h5">Select or enter your default payment method</Typography>
      </Grid>
      <Grid item>
        <Cards collapseAdd={hideAddCard} />
      </Grid>
      <Grid item>
        <Grid container direction="column" alignItems="flex-end" spacing={2}>
          {userConsentContent}
          <Grid item>
            <Button 
              disabled={!userConsent}
              variant="contained"
              color="primary"
              onClick={props.onSubmit}
            >
              Submit Payment
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );

  return paymentContent;
}