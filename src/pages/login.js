import React from 'react';

import LoginForm from '../components/form/login';
import Container from '../components/loginContainer';

export default function Login(props) {

  return (
    <Container>
      <LoginForm query={props.query} />
    </Container>
  );
}
