import React, { useEffect, useState } from 'react';
import { Container, Grid, makeStyles, Typography } from '@material-ui/core';
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
    paddingBottom: theme.spacing(4),
    paddingRight: 0,
    paddingLeft: 0
  }
}))

export default function Admin() {
  const classes = useStyles();
  const user = useSelector(state => getUserSelector(state));
  const [reportData, setReportData] = useState([]);
  const [instructorReports, setInstructorReports] = useState([]);

  useEffect(() => {
    if (user) {
      fetchReports();
      fetchInstructorReports();
    }
  }, [user])

  const fetchReports = () => {
    Reporting.get().then(response => {
      if (response) setReportData(response);
    }).catch(err => {
      log.warn("ADMIN:: Fetch Reports error ", err);
    })
  }

  const fetchInstructorReports = () => {
    Reporting.getInstructors().then(response => {
      if (response) setInstructorReports(response);
    }).catch(err => {
      log.warn("ADMIN:: Fetch Instructor Reports error ", err);
    })
  }

  function createAdminData(week, year, newUsers, newInstructors, newAdmins,
     tBooked, tRefunded, tAttended, tRevenue, uBooked, uRefunded, uAttended, startDate, endDate) {
    
    return { week: `${week} (${year})`, newUsers, newInstructors, newAdmins,
      tBooked, tRefunded, tAttended, tRevenue, uBooked, uRefunded, uAttended, startDate, endDate };
  }

  const columnTitles = ['Week', 'Start Date', 'End Date', 'New Users', 'New Instructors',
    'New Admins', 'Total Booked', 'Total Refunded', 'Total Attended', 'Total Revenue', 
    'Unique Booked', 'Unique Refunded', 'Unique Attended'];

  const fieldNames = ['week', 'startDate', 'endDate', 'tBooked', 'tRefunded', 'tAttended', 'tRevenue', 'uBooked', 
    'uRefunded', 'uAttended', 'newUsers', 'newInstructors', 'newAdmins'];

  let rows = [];
  if (reportData) {
    rows = (
      reportData.map(report => {
        if (report.startDate) {
          const date = new Date(report.startDate)
          report.startDate = (date.getMonth()+1) + '/' + date.getDate();
        } if (report.endDate) {
          const date = new Date(report.endDate)
          report.endDate = (date.getMonth()+1) + '/' + date.getDate();
        }
        return createAdminData(report.week, report.year, report.newUsers, report.newInstructors, 
          report.newAdmins, report.totalBooked, report.totalRefunded, report.totalAttended, report.totalRevenue,
          report.uniqueBooked, report.uniqueRefunded, report.uniqueAttended, report.startDate, report.endDate);
      })
    )
  }

  function createInstructorData(week, year, instructor, pReturn, tNoShow, uAttended, aAttended, tAttended,
    tClasses, tExisting, tNewUser, uExisting, uNewUser, attendence, tEnrolled, eco, startDate, endDate) {

    return { week: `${week} (${year})`, instructor, pReturn, tNoShow, uAttended, aAttended, tAttended,
      tClasses, tExisting, tNewUser, uExisting, uNewUser, attendence, tEnrolled, eco, startDate, endDate };
  }

  const iColumnTitles = ['Week', 'Start Date', 'End Date', 'Instructor', 'Percentage Returned', 'Total No Shows',
    'Unique Attended', 'Average Attended', 'Total Attended', 'Total Classes', 'Total Existing User',
    'Total New Users', 'Unique Existing Users', 'Unique New Users', 'Attendence Rate',
    'Total Enrolled', 'Ecosystem Rate'];

  const iFieldNames = ['week', 'startDate', 'endDate', 'instructor', 'pReturn',
    'tNoShow', 'uAttended', 'aAttended', 'tAttended', 'tClasses', 'tExisting', 
    'tNewUser', 'uExisting', 'uNewUser', 'attendence', 'tEnrolled', 'eco'];

  let instructorRows = [];
  if (instructorReports) {
    instructorRows = instructorReports.map(report => {
      if (!report.instructor) {
        report.instructor = {
          username : 'N/A'
        }
      }
      if (report.startDate) {
        const date = new Date(report.startDate)
        report.startDate = (date.getMonth()+1) + '/' + date.getDate();
      } if (report.endDate) {
        const date = new Date(report.endDate)
        report.endDate = (date.getMonth()+1) + '/' + date.getDate();
      }
      return createInstructorData(report.week, report.year, report.instructor.username,
        report.percentageReturned, report.totalNoShows, report.uniqueAttended, report.averageAttended,
        report.totalAttended, report.totalClasses, report.totalExistingUser, report.totalNewUser,
        report.uniqueExistingUser, report.uniqueNewUser, report.attendenceRate,
        report.totalEnrolled, report.ecoSystemRate, report.startDate, report.endDate);
    })
  }
  
  let content;
  content = (
    <Container className={classes.container}>
      <Grid container>
        <Typography variant='h3'>Overall</Typography>
        <TableComponent rows={rows} columnTitles={columnTitles} fieldNames={fieldNames} />
      </Grid>
      <br />
      <Grid container>
        <Typography variant='h3'>Instructors</Typography>
        <TableComponent rows={instructorRows} columnTitles={iColumnTitles} fieldNames={iFieldNames} />
      </Grid>
    </Container>
  )

  return (
    <Analytics title="Admin">
      {content}
    </Analytics>
  );
}