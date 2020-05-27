import React,{ useState, useEffect }  from 'react';
import Opentok from '../components/Opentok';
import config from '../config';

function OpentokView() {

  const [content, setContent] = useState('loading');

  async function fetchClasses() {
    let options = {
      method: 'GET',
    };

    fetch(config.host + "/class/", options)
      .then(function(result) {
        let data = result.json();
        return data;
      }).catch(function(err) {
        return err;
      });
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
    let classes;

    try {
      classes = fetchClasses();
    } catch(e) {
      console.error(e);
    }

    if (!classes.data) {
      return;
    }

    fetchToken(classes.data[0].id);
  }, [])

  return (
    <div>
      {content}
    </div>
  );
}

export default OpentokView;