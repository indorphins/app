import React, { useState, useEffect } from 'react';
import { Grid, Typography, Card } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import { EmailOutlined, PhoneOutlined } from '@material-ui/icons';
import Instagram from './instagram';

const useStyles = makeStyles((theme) => ({
  container: {
    cursor: 'pointer',
  },
  contactInfo: {
    backgroundColor: theme.palette.grey[200],
    padding: theme.spacing(1),
    width: "100%",
  },
  icon: {
    color: theme.palette.primary.main,
    fontSize: "1.5rem",
    display: 'flex',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));


export default function ContactInfo(props) {

  const classes = useStyles();
  const [ email, setEmail ] = useState(null);

  useEffect(() => {
    if (props.email) {
      setEmail(props.email);
    }
  }, [props]);

  const sendEmail = function() {
    const mailTo = "mailto:" + email;
    let win = window.open(mailTo, '_blank');
    win.focus();
  }
  
  let emailContent = null;
  if (email) {
    emailContent = (
      <Grid item>
        <Grid
          container
          direction="row"
          justify="flex-start"
          alignItems="center"
          alignContent="center"
          spacing={2}
          className={classes.container}
          onClick={sendEmail}
          title="Send email"
        >
          <Grid item className={classes.icon}>
            <EmailOutlined color="primary" />
          </Grid>
          <Grid item>
            <Typography variant="h5">
              {email}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    );
  }

  let phoneContent = null;
  if (props.phone) {
    phoneContent = (
      <Grid item>
        <Grid
          container
          direction="row"
          justify="flex-start"
          alignItems="center"
          alignContent="center"
          spacing={2}
          className={classes.container}
        >
          <Grid item className={classes.icon}>
            <PhoneOutlined color="primary" />
          </Grid>
          <Grid item>
            <Typography variant="h5">
              {props.phone}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    );
  }


  let instaContent = null;
  if (props.instagram) {
    instaContent = (
      <Grid item>
        <Instagram instagram={props.instagram} />
      </Grid>
    );    
  }

  let content = (
    <Card className={classes.contactInfo}>
      <Grid container direction="column" spacing={2} justify="flex-start">
        {emailContent}
        {phoneContent}
        {instaContent}
      </Grid>
    </Card>
  );

  return content;
}