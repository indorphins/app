import React from 'react';
import { Container, Grid, makeStyles } from '@material-ui/core';
import InstructorFeature from '../../components/instructorFeature';
import Analytics from '../../utils/analytics';

const useStyles = makeStyles((theme) => ({
  content: {
    paddingTop: theme.spacing(2),
  }
}));

export default function InstructorList(props) {

  const classes = useStyles();

  return (
    <Analytics title="Instructors">
      <Container className={classes.content}>
        <Grid item>
          <InstructorFeature
            limit={500}
            header='Instructors'
          />
        </Grid>
      </Container>
    </Analytics>
  )
}