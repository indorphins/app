import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { Container, Grid, Button, Grow, Divider }  from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import CreateCourse from '../../components/form/editCourse';
import CourseWidget from '../../components/courseListWidget';
import InstructorWidget from '../../components/instuctorWidget';

const getUserSelector = createSelector([state => state.user.data], (user) => {
  return user;
});

const useStyles = makeStyles((theme) => ({
  content: {
    marginBottom: theme.spacing(4),
  }
}));

export default function() {

  let now = new Date();
  let filter = { 
    start_date: {"$gte" : now.toISOString() }, 
    available_spots: { "$gt": 0 },
  };

  let order = {
    start_date: "asc",
  };

  const classes = useStyles();
  const currentUser = useSelector(state => getUserSelector(state));
  const [allowCreate, setAllowCreate] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (currentUser.type && currentUser.type !== "standard") {
      setAllowCreate(true);
    } else {
      setAllowCreate(false);
    }
  }, [currentUser]);

  const toggleCreateForm = function() {
    if (showForm) {
      setShowForm(false);
    } else {
      setShowForm(true);
    }
  }

  let createButton = null;
  if (allowCreate) {
    let text = "Create";
    let color = "secondary"

    if (showForm) {
      text = "Cancel";
      color = "primary"
    }

    createButton = (
      <Grid  container direction="row" justify="flex-end" alignItems="center">
        <Button color={color} variant="contained" onClick={toggleCreateForm}>{text}</Button>
      </Grid>
    )
  }

  let createContent = null
  if (showForm) {
    createContent = (
      <Grow in={showForm}>
        <Grid>
          <CreateCourse instructorId={currentUser.id} photoUrl={currentUser.photo_url} />
          <Divider />
        </Grid>
      </Grow>
    );
  }

  return (
    <Container justify="center">
      {createButton}
      {createContent}
      <Grid container className={classes.content}>
        <CourseWidget filter={filter} order={order} limit={500} header="Upcoming &amp; available classes" />
      </Grid>
      <Grid container className={classes.content}>
        <InstructorWidget limit={500} header="Find instructors &amp; community"/>
      </Grid>
    </Container>
  )
}