import React, { useEffect, useState } from 'react';
import { Button, Grid } from '@material-ui/core';
import { useHistory } from 'react-router-dom';

import path from '../../routes/path';

export default function Signup(props) {

  const { currentUser, course, size } = props;
  const history = useHistory();
  const [ signupBtn, setSignup ] = useState(null);

  useEffect(() => {

    if (!course.id) return;

    if (currentUser.id === course.instructor.id) {
      return;
    }

    let handler = goToLogin;
    let label = "Login to Book Class";
    let enrolled = false;

    if (course.participants.length > 0) {
      
      for (var i = 0; i < course.participants.length; i++) {
        if (course.participants[i].id === currentUser.id) {
          enrolled = true;
        }
      }

      if (enrolled) {
        handler = props.leaveHandler;
        label = "Leave Class";
      }
    }

    if (course.available_spots > 0 && !enrolled) {
      label = "Book Class";
      if (course.cost && course.cost > 0) {
        handler = props.paidHandler
      } else {
        handler = props.freeHandler
      }
    }

    setSignup(
      <Grid item xs={size}>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => { handler(); setSignup(null);}}
          style={{width:"100%"}}
        >
          {label}
        </Button>
      </Grid>
    );

  }, [currentUser, course]);

  const goToLogin = async function() {
    history.push(`${path.login}?redirect=${path.courses}/${course.id}`);
  }

  return signupBtn;
}