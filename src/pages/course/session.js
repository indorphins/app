import React, { useState, useEffect }  from 'react';

import Opentok from '../../components/Opentok';
import config from '../../config';

export default function() {

  const [content, setContent] = useState('loading');

  async function fetchClasses() {
    let options = {
      method: 'GET',
    };

    let data = await fetch(config.host + "/class/", options)
      .then(function(result) {
        let data = result.json();
        console.log('got class result', data);
        return data;
      }).catch(function(err) {
        throw err;
      });

    return data;
  }

  async function fetchToken(classId) {
    let options = {
      method: 'GET',
    };

    fetch(`${config.host}/class/${classId}/session`, options)
      .then(function(result) {
        return result.json();
      }).then((data) => {
        console.log('got session result', data);
        setContent(<Opentok credentials={data}></Opentok>);
      }).catch(function(err) {
        console.error(err);
      });
  };

  useEffect(() => {
    const init = async function() {
      let all;

      try {
        all = await fetchClasses();
      } catch(e) {
        console.error(e);
      }

      if (!all || !all.data) {
        return setContent("no classes");
      }

      fetchToken(all.data[0].id);
    };

    init();
  }, [])

  return (
    <div>
      {content}
    </div>
  );
};