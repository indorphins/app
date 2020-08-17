/* eslint max-len: 0*/
import React from 'react';

export default function SplitGridIcon(props) {

  let width = "1em";
  let height = "1em";

  if (props.width) width = props.width;
  if (props.height) height = props.height;

  return (
    <svg {...props} width={width} height={height} viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 1a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V1zm9 0a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1V1zm0 9a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1v-5z" />
    </svg>
  );
}