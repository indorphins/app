import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { Container, Grid, Fab, Grow, Divider, Typography }  from '@material-ui/core';
import { Add, Clear } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';

import CreateCourse from '../../components/form/editCourse';
import CourseFeature from '../../components/courseFeature';
import InstructorFeature from '../../components/instructorFeature';

const getUserSelector = createSelector([(state) => state.user.data], (user) => {
  return user;
});

const useStyles = makeStyles((theme) => ({
  content: {
    marginBottom: theme.spacing(4),
  },
  extendedBtn: {
    marginRight: theme.spacing(1),
  },
  divider: {
    margin: theme.spacing(2),
  },
  fab: {
    fontWeight: "bold",
  },
  noClassContainer: {
    marginBottom: theme.spacing(2),
  }
}));

export default function CourseList() {
  const classes = useStyles();
  const currentUser = useSelector((state) => getUserSelector(state));
  const [allowCreate, setAllowCreate] = useState(false);
  const [showForm, setShowForm] = useState(false);

  let now = new Date();
  let courseFilter = {
    $or: [
			{ start_date: { $gte: now.toISOString() } },
			{ end_date: { $gte: now.toISOString() } },
    ],
    recurring: { $exists: false },
    start_date: { $exists: true },
  };

  let recurringFilter = {
    recurring: { $exists: true },
  };

  let scheduleFilter = {
    '$and': [
      {'$or': [
        {instructor: currentUser.id},
        {participants: { $elemMatch: { id: currentUser.id }}},
      ]},
      {'$or': [ 
        { start_date: {"$gte" : now.toISOString() }},
        { recurring: { '$exists': true }}
      ]},
    ],
    start_date: { '$exists': true },
  };

  let order = {
    start_date: 'asc',
  };

  useEffect(() => {
    if (currentUser.type && currentUser.type !== 'standard') {
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
  };

  let createButton = null;
  if (allowCreate) {
    let btn = (
      <Fab
        color="secondary"
        variant="extended"
        aria-label="create class"
        className={classes.fab}
        onClick={toggleCreateForm}
      >
        <Add className={classes.extendedBtn} />
        Class
      </Fab>
    );

    if (showForm) {
      btn = (
        <Fab color="primary" aria-label="cancel" onClick={toggleCreateForm}>
          <Clear />
        </Fab>
      )
    }

    createButton = (
      <Grid  container direction="row" justify="flex-end" alignItems="center">
        {btn}
      </Grid>
    )
  }

  let createContent = null
  if (showForm) {
    createContent = (
      <Grow in={showForm}>
        <Grid>
          <CreateCourse
            instructorId={currentUser.id}
            photoUrl={currentUser.photo_url}
            spotsDisabled={false}
            costDisabled={false}
          />
          <Divider className={classes.divider} />
        </Grid>
      </Grow>
    );
  }

  let noClassContent = (
    <Grid container className={classes.noClassContainer} style={{ 'display': 'block' }}>
      <Typography variant='h5' style={{ 'padding-bottom': '10px' }}>
        Class happens here. Indoorphins go with you everywhere.
      </Typography>
      <Typography variant='h5'>Book a class below to get started.</Typography>
    </Grid>
  );

  let myClassesContent ;
  if (currentUser.id) {
    myClassesContent = (
      <Grid container className={classes.content}>
        <CourseFeature
          filter={scheduleFilter}
          order={order}
          limit={500}
          header='My Classes'
          altContent={noClassContent}
        />
      </Grid>
    );    
  } else {
    myClassesContent = noClassContent;
  }

  return (
    <Container justify='center'>
      {createButton}
      {createContent}
      {myClassesContent}
      <Grid container className={classes.content}>
        <CourseFeature
					filter={courseFilter}
					order={order}
					limit={500}
					header='Upcoming classes'
        />
      </Grid>
      <Grid container className={classes.content}>
        <CourseFeature
					filter={recurringFilter}
					order={order}
					limit={500}
					header='Weekly classes'
        />
      </Grid>
      <Grid container className={classes.content}>
        <InstructorFeature
					limit={500}
					header='Instructors'
        />
      </Grid>
    </Container>
  );
}
