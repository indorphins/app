import React from 'react';
import { Container, Grid } from '@material-ui/core';
import InstructorFeature from '../../components/instructorFeature';

export default function InstructorList(props) {

  return (
    <Container>
      <Grid item>
        <InstructorFeature
          limit={500}
          header='Instructors'
        />
      </Grid>
    </Container>
  )
}