import React from 'react';
import { Container, Grid, makeStyles, Fade } from '@material-ui/core';
import InstructorFeature from '../../components/instructorFeature';
import Analytics from '../../utils/analytics';

const useStyles = makeStyles((theme) => ({
  content: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(4),
    backgroundColor: theme.palette.common.backgroundGrey,
    maxWidth: 'inherit',
  }
}));

export default function InstructorList(props) {

  const classes = useStyles();

  return (
    <Analytics title="Instructors">
      <Container className={classes.content}>
        <Fade in={true}>
          <Grid item>
            <InstructorFeature
              limit={500}
              header='Instructors'
            />
          </Grid>
        </Fade>
      </Container>
    </Analytics>
  )
}