import React from 'react';

import AddPaymentStartTrial from '../components/form/addPaymentStartTrial';
import Container from '../components/addPaymentStartTrialContainer';
import Analytics from '../utils/analytics';

export default function Login(props) {

  return (
    <Analytics title="Add Payment Start Trial">
      <Container>
        <AddPaymentStartTrial query={props.query} />
      </Container>
    </Analytics>
  );
}
