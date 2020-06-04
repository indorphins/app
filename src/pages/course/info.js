import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Container } from '@material-ui/core';

import UserData from '../../components/userData';
import * as Course from '../../api/course';
import log from '../../log';
import path from '../../routes/path';

export default function() {

  const history = useHistory();
  const params = useParams();
  const [photo, setPhoto] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [insta, setInsta] = useState('');
  //const [cost, setCost] = useState(0);
  //const [available, setAvailable] = useState(0);

  useEffect(() => {

    async function get() {
      let cls;

      log.debug("course info param", params.id);

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
      //setCost(cls.cost);
      //setAvailable(cls.available_spots);
      setEmail(cls.instructor.email);
      setPhone(cls.instructor.phone_number);
      if(cls.instructor.social )setInsta(cls.instructor.social.instagram);
    }

    get();
  }, [params])

  return (
    <Container>
      <UserData header={title} bio={description} email={email} phone={phone} instagram={insta} photo={photo} />
    </Container>
  )
}