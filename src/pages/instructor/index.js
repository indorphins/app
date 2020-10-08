import React from 'react';
import { Container, Grid } from '@material-ui/core';
import InstructorFeature from '../../components/instructorFeature';
import Analytics from '../../utils/analytics';

export default function InstructorList(props) {

  return (
    <Analytics title="Instructors">
      <Container>
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