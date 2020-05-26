import React,{ useState, useEffect }  from 'react';
import Opentok from '../Components/Opentok';

function OpentokView() {

  const [content, setContent] = useState('loading');

  async function fetchToken() {
    let options = {
      method: 'GET',
    };

    fetch("https://dev.api.indorphins.com/class/0cec3dd0-9ef0-11ea-b7a6-7556464c4d55/session", options)
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
    fetchToken();
  }, [])

  return (
    <div>
      {content}
    </div>
  );
}

export default OpentokView;