import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Container, Divider } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import UserData from '../../components/userData';
import CourseSchedule from '../../components/courseSchedule';
import * as Course from '../../api/course';
import log from '../../log';
import path from '../../routes/path';

const useStyles = makeStyles((theme) => ({
  divider: {
    margin: theme.spacing(2),
  }
}));

export default function() {

  const classes = useStyles();
  const history = useHistory();
  const params = useParams();
  const [photo, setPhoto] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [insta, setInsta] = useState('');
  const [course, setCourse] = useState('');

  useEffect(() => {

    async function get() {
      let cls;

      try {
        cls = await Course.get(params.id);
      } catch(err) {
        log.error("COURSE INFO:: get course details", err);
        history.push(path.courses);
      }

      if (!cls) {
        log.debug("COURSE INFO:: course not found")
        history.push(path.courses);
        return;
      }
      
      log.debug("COURSE INFO:: got course details", cls);
      setPhoto(cls.photo_url);
      setTitle(cls.title);
      setDescription(cls.description);
      setEmail(cls.instructor.email);
      setPhone(cls.instructor.phone_number);
      setCourse(cls);
      if(cls.instructor.social) setInsta(cls.instructor.social.instagram);
    }

    get();
  }, [])

  return (
    <Container>
      <UserData header={title} bio={description} email={email} phone={phone} instagram={insta} photo={photo} />
      <Divider className={classes.divider} />
      <CourseSchedule header="Class Schedule" course={[course]} />
    </Container>
  )
}