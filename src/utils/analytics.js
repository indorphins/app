import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export default function Analytics(props) {

  const { children, title } = props;
  const location = useLocation();
  const locationRef = useRef(location)

  useEffect(() => {
    if (title && title.length > 0) {
      document.title = title;

      let pv = {
        page_path: locationRef.current.pathname,
        page_title: title,
      };

      window.gtag('event', 'page_view', pv);
    }
  }, [title]);

  return (
    <React.Fragment>
      {children}
    </React.Fragment>
  );
}