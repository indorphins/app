import React from 'react';
import { Grid, Typography, makeStyles } from '@material-ui/core';
import { Error } from '@material-ui/icons';
import { isSafari, isChrome } from 'react-device-detect';

const useStyles = makeStyles((theme) => ({
  link: {
    color: theme.palette.primary.main,
    textDecoration: "none",
    cursor: "pointer",
  }
}));

export default function permissionsError() {
  const classes = useStyles();

  let permissionsMsgContent = (
    <React.Fragment>
      <Grid item>
        <Typography variant="h2"><Error style={{marginRight:10}} />We cannot access your camera or microphone.</Typography>
      </Grid>

    </React.Fragment>
  );

  let additional = null;

  if (isSafari) {
    additional = (
      <React.Fragment>
        <Grid item>
          <Typography variant="h4">Please refresh the page and 'accept' the request for camera and microphone access.</Typography>
        </Grid>
        <Grid item>
          <Typography variant="h5">If you do not see this request then Indoorphins may have been permanently blocked. To unblock this site:</Typography>
        </Grid>
        <Grid item>
          <ol>
            <li>
            <Typography variant="h5">Click <strong>Safari</strong> in the system menus</Typography>
            </li>
            <li>
            <Typography variant="h5">Select <strong>Preferences</strong></Typography>
            </li>
            <li>
            <Typography variant="h5">Select <strong>Websites</strong></Typography>
            </li>
            <li>
            <Typography variant="h5">Find <strong>Camera</strong> and <strong>Microphone</strong> in the General list</Typography>
            </li>
            <li>
            <Typography variant="h5">Make sure <strong>indoorphins.fit</strong> is set to Ask or Allow</Typography>
            </li>
            <li>
            <Typography variant="h5">Refresh the page or <span className={classes.link} onClick={() => {window.location.reload();}}>click here to refresh</span></Typography>
            </li>
          </ol>
        </Grid>
      </React.Fragment>
    );
  }

  if (isChrome) {
    additional = (
      <React.Fragment>
        <Grid item>
          <Typography variant="h4">Adjust the camera permissions as shown below</Typography>
        </Grid>
        <Grid item>
          <img alt="chrome permissions" src="/img/chrome_camera_permissions.png" style={{width: 500, height: "auto"}}/>
        </Grid>
      </React.Fragment>
    )
  }

  return (
    <Grid xs item style={{height: "100%", overflow: "hidden", position: "relative"}}>
      <Grid container direction="row" justify="center" alignItems="center" spacing={2} style={{height: "100%"}}>
        <Grid item xs={8} container direction="column" justify="center" alignItems="center" spacing={2}>
          {permissionsMsgContent}
          {additional}
        </Grid>
      </Grid>
    </Grid>
  );
}