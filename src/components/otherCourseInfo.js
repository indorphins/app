import React from 'react'
import { Grid, Typography, makeStyles } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
  content: {
    color: theme.palette.text.secondary
  }
}));

export const OtherCourseInfo = (props) => {
  const classes = useStyles();

  return (
    <Grid container direction='column' className={classes.content}>
        <Typography variant="body2">Other things to know:</Typography>
        <Typography variant="body2"> - You'll join the class right here</Typography>
        <Typography variant="body2"> - Join using a laptop/computer</Typography>
        <Typography variant="body2"> - You can cancel up to 24 hours before the class starts</Typography>
    </Grid>
  )
}