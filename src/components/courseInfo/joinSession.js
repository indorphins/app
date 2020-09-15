import React, { useEffect, useState } from 'react';
import { Button, Grid } from '@material-ui/core';
import { useHistory } from 'react-router-dom';

import { getNextSession } from '../../utils';
import path from '../../routes/path';

export default function JoinSession(props) {

  const { currentUser, course, size } = props;
  const history = useHistory();
  const [joinSession, setJoinSession] = useState(null);

  const joinHandler = async function () {
    history.push(path.courses + "/" + course.id + path.joinPath);
  }

  useEffect(() => {
    if (!currentUser.id || !course.id) return;

    let authorized = false;
    let instructor = course.instructor;

    if (currentUser.id === instructor.id) {
      authorized = true;
    }

    let exists = course.participants.filter(item => {
      return item.id === currentUser.id;
    });

    if (exists && exists[0]) {
      authorized = true;
    }

    let now = new Date();
    let sessionTime = getNextSession(now, course);

    if (!sessionTime) return;

    let disabled = true;

    if (now > sessionTime.start && now < sessionTime.end) {
      disabled = false;
    } else if (now < sessionTime.end) {
      disabled = true;
    }

    let interval = null;

    if (authorized) {
      setJoinSession(
        <Button
          disabled={disabled}
          variant="contained"
          color="primary"
          onClick={joinHandler}
          style={{width:"100%"}}
        >
          Join Session
        </Button>
      );

      interval = setInterval(() => {
        let now = new Date();
        let sessionTime = getNextSession(now, course);
        let disabled = true;
  
        if (sessionTime) {
          if (now > sessionTime.start && now < sessionTime.end) {
            disabled = false;
          } else if (now < sessionTime.end) {
            disabled = true;
          }
        }
    
        setJoinSession(
          <Button
            disabled={disabled}
            variant="contained"
            color="primary"
            onClick={joinHandler}
            style={{width:"100%"}}
          >
            Join Session
          </Button>
        );
      }, 10000);
      
    } else {
      setJoinSession(null);
    }

    return () => clearInterval(interval);

  }, [currentUser, course]);

  let content = null;

  if (joinSession) {
    content = (
      <Grid item xs={size}>
        {joinSession}
      </Grid>
    )
  }

  return content;
}