import React, { useEffect, useState } from 'react';
import { Container, makeStyles } from '@material-ui/core';
import TableComponent from '../components/table/tableComponent';
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
    paddingBottom: theme.spacing(4)
  }
}))

export default function Admin() {
  const classes = useStyles();
  const user = useSelector(state => getUserSelector(state));
  const [reportData, setReportData] = useState([]);

  useEffect(() => {
    if (user) {
      fetchReports()
    }
  }, [user])

  const fetchReports = () => {
    Reporting.get().then(response => {
      if (response) setReportData(response);
    }).catch(err => {
      log.warn("ADMIN:: Fetch Reports error ", err);
    })
  }

  function createAdminData(week, year, newUsers, newInstructors, newAdmins,
     tBooked, tRefunded, tAttended, tRevenue, uBooked, uRefunded, uAttended) {
    
    return { week: `${week} (${year})`, newUsers, newInstructors, newAdmins,
      tBooked, tRefunded, tAttended, tRevenue, uBooked, uRefunded, uAttended };
  }

  const columnTitles = ['Week', 'New Users', 'New Instructors', 'New Admins', 'Total Booked', 'Total Refunded',
    'Total Attended', 'Total Revenue', 'Unique Booked', 'Unique Refunded', 'Unique Attended'];
  const fieldNames = ['week', 'tBooked', 'tRefunded', 'tAttended', 'tRevenue', 'uBooked', 
    'uRefunded', 'uAttended', 'newUsers', 'newInstructors', 'newAdmins'];

  let rows = [];
  if (reportData) {
    rows = (
      reportData.map(report => {
        return createAdminData(report.week, report.year, report.newUsers, report.newInstructors, 
          report.newAdmins, report.totalBooked, report.totalRefunded, report.totalAttended, report.totalRevenue,
          report.uniqueBooked, report.uniqueRefunded, report.uniqueAttended);
      })
    )
  }
  
  let content;
  content = (
    <Container className={classes.container}>
      <TableComponent rows={rows} columnTitles={columnTitles} fieldNames={fieldNames} />
    </Container>
  )

  return (
    <Analytics title="Admin">
      {content}
    </Analytics>
  );
}
