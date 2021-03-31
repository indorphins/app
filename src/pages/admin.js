import React, { useState } from 'react';
import { Button, makeStyles, TextField, Typography } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import Analytics from '../utils/analytics';
import * as Reporting from '../api/reporting';
import log from '../log';

const getUserSelector = createSelector([state => state.user.data], (user) => {
  return user;
});

const useStyles = makeStyles((theme) => ({
  table: {
    minWidth: 650,
  },
  container: {
    paddingBottom: theme.spacing(4),
    paddingRight: 0,
    paddingLeft: 0
  }
}))

export default function Admin() {
  const classes = useStyles();
  const user = useSelector(state => getUserSelector(state));
  const [domain, setDomain] = useState('');
  const [reportData, setReportData] = useState([]);

  function submitHandler(e) {
    e.preventDefault();
    fetchReportByDomain(domain)
  }

  function domainChangeHandler(e) {
    setDomain(e.target.value);
  }

  function fetchReportByDomain(domain) {
    return Reporting.getReportByDomain(domain)
      .then(report => {
        log.debug("REPORTS:: Fetched reports by domain ", report);
        setReportData(report);
        log.info('report data ' , reportData);
      })
      .catch(err => {
        log.warn("REPORTS:: Error fetching report by domain ", err);
        return;
      }) 
  }
  
  return (
    <Analytics title="Admin">
      <Typography variant='h4'>Search reports by domain (ex. "@indoorphins.fit")</Typography>
      <form onSubmit={submitHandler} className={classes.container}>
        <Typography variant='h3'>Domain:</Typography>
        <TextField onChange={domainChangeHandler} />
        <Button type='submit' variant="contained" color="primary">Search</Button>
      </form>
    </Analytics>
  );
}
