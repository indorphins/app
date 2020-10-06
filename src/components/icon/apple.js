/* eslint max-len: 0*/
import React from 'react';

export default function AppleIcon(props) {

  const { color, className } = props;

  return (
    <svg xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width="32" height="32"
      viewBox="0 0 172 172"
      style={{fill: color}}
      className={className}
    >
      <g fill="none" fillRule="nonzero" stroke="none" strokeWidth="1" strokeLinecap="butt" strokeLinejoin="miter" strokeMiterlimit="10" strokeDasharray="" strokeDashoffset="0" fontFamily="none" fontWeight="none" fontSize="none" textAnchor="none" style={{mixBlendMode: "normal"}}><path d="M0,172v-172h172v172z" fill="none"></path><g fill="currentColor"><path d="M158.32993,125.33053c-3.95372,8.76021 -5.84015,12.6881 -10.93089,20.41466c-7.08053,10.82753 -17.10697,24.31671 -29.51081,24.39423c-11.00842,0.10337 -13.85096,-7.18389 -28.8131,-7.05469c-14.96214,0.05168 -18.08894,7.18389 -29.1232,7.08053c-12.37801,-0.10337 -21.86178,-12.27463 -28.96815,-23.05048c-19.87199,-30.26021 -21.96515,-65.74038 -9.69051,-84.60456c8.68269,-13.38582 22.43029,-21.24159 35.35096,-21.24159c13.1274,0 21.39663,7.20974 32.27584,7.20974c10.54327,0 16.95192,-7.23558 32.17248,-7.23558c11.47356,0 23.64483,6.25361 32.32752,17.08113c-28.42548,15.55649 -23.79988,56.15325 4.90986,67.00662zM109.54147,29.14904c5.53004,-7.08053 9.71635,-17.10697 8.21754,-27.3143c-9.04447,0.62019 -19.58774,6.38281 -25.76382,13.82512c-5.58173,6.79627 -10.20733,16.90024 -8.39844,26.66827c9.84555,0.3101 20.02704,-5.55589 25.94471,-13.17909z"></path></g></g>
    </svg>
  );
}