import React from 'react';
import { Divider, Grid, Typography} from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import { EmailOutlined, PhoneOutlined } from '@material-ui/icons';
import { Instagram } from './instagram';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
  contact: {
    background: theme.palette.primary.main,
    padding: theme.spacing(1.5),
    minWidth: 225,
    maxWidth: 300,
    '@media (max-width: 900px)': {
      maxWidth: "100%",
      width: "100%",
    }
  },
  contactLabel: {
    color: theme.palette.text.secondary,
  },
  icon: {
    color: theme.palette.primary.main,
    fontSize: "1.5rem",
  },
  link: {
    textDecoration: "none",
    cursor: "pointer",
    color: theme.palette.primary.main,
    display: "inline-block",
    width: "100%",
  },
  container: {
    padding: theme.spacing(1),
  },
  iconCnt: {
    display: 'flex',
  }
}));


export default function(props) {

  const classes = useStyles();
  
  let emailContent = null;
  if (props.email) {
    const mailTo = "mailto:" + props.email;
    emailContent = (
      <a title="Send an email" className={classes.link} target="_blank" rel="noopener noreferrer" href={mailTo}>
        <Grid container direction="row" justify="flex-start" alignItems="center" alignContent="center" spacing={1} className={classes.container}>
          <Grid item className={classes.iconCnt}>
            <EmailOutlined className={classes.icon} />
          </Grid>
          <Grid item>
            <Typography className={classes.contactLabel}>
              {props.email}
            </Typography>
          </Grid>
        </Grid>
      </a>
    );
  }

  let phoneContent = null;
  if (props.phone) {
    phoneContent = (
      <React.Fragment>
        <Divider  style={{width:"100%"}} />
        <Grid container direction="row" justify="flex-start" alignItems="center" alignContent="center" spacing={1} className={classes.container}>
          <Grid item className={classes.iconCnt}>
            <PhoneOutlined className={classes.icon} />
          </Grid>
          <Grid item>
            <Typography className={classes.contactLabel}>
              {props.phone}
            </Typography>
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }


  let instaContent = null;
  if (props.instagram) {
    instaContent = (
      <React.Fragment>
        <Divider style={{width:"100%"}} />
        <Instagram instagram={props.instagram} />
      </React.Fragment>
    );    
  }

  let content = (
    <Grid container>
      {emailContent}
      {phoneContent}
      {instaContent} 
    </Grid>
  );

  return content;
}