import React from 'react'
import { Grid, Typography } from '@material-ui/core'

export const OtherCourseInfo = (props) => {
  return (
    <Grid container>
      <p>
        <Typography variant="body2">Other things to know:</Typography>
        <Typography variant="body2"> - You'll join the class right here</Typography>
        <Typography variant="body2"> - Join using a laptop/computer</Typography>
        <Typography variant="body2"> - You can cancel up to 24 hours before the class starts</Typography>
      </p>
    </Grid>
  )
}