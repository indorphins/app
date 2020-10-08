import React from 'react';

import CreateForm from '../components/form/createAccount';
import Container from '../components/loginContainer';
import Analytics from '../utils/analytics';

export default function Signup(props) {

  return (
    <Analytics title="Create Indoorphins Account">
      <Container>
        <CreateForm query={props.query} />
      </Container>
    </Analytics>
  );
}
