import React,{ useState, useEffect }  from 'react';
import Opentok from '../Components/Opentok';

function OpentokView() {

  const [content, setContent] = useState('loading');

  async function fetchToken() {
    let options = {
      method: 'GET',
    };

    fetch("http://localhost:3001/class/184b3b00-9d41-11ea-b6b7-0957e6c12fcc/session", options)
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