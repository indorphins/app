import React from 'react'
import { Grid, Typography, makeStyles } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
  content: {
    color: theme.palette.text.secondary
  }
}));

export default function OtherCourseInfo(props) {
  const classes = useStyles();

  return (
    <Grid container direction='column' className={classes.content}>
      <Typography variant="body2">Other things to know:</Typography>
      <Typography variant="body2">
        - Join class from your computer or mobile device, ideally using the Google Chrome browser
      </Typography>
      <Typography variant="body2"> - Login to indoorphins.fit and join from this page</Typography>
      <Typography variant="body2"> 
        - Drop-ins can receive full refunds as long as they cancel more than 24 hours before the class time
      </Typography>
    </Grid>
  )
}