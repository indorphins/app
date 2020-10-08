import React from 'react';

import LoginForm from '../components/form/login';
import Container from '../components/loginContainer';
import Analytics from '../utils/analytics';

export default function Login(props) {

  return (
    <Analytics title="Login to Indoorphins">
      <Container>
        <LoginForm query={props.query} />
      </Container>
    </Analytics>
  );
}
