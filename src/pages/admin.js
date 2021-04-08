import React, { useState, useEffect } from 'react';
import { Button, Grid, makeStyles, TextField, Typography, LinearProgress } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import Analytics from '../utils/analytics';
import * as Reporting from '../api/reporting';
import {create} from '../api/user';
import {accountCreated} from '../api/message';
import {createAsAdmin} from '../api/subscription';
import Firebase from '../Firebase';
import log from '../log';
import { nanoid } from 'nanoid'

const getUserSelector = createSelector([state => state.user.data], (user) => {
  return user;
});

const getProductsSelector = createSelector([state => state.products], products => {
  return products;
});

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingRight: 0,
    paddingLeft: 0
  },
  inputField: {
    width: '100%'
  },
  item: {
    width: '40%',
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1)
  }
}))

export default function Admin() {
  const classes = useStyles();
  const user = useSelector(state => getUserSelector(state));
  const products = useSelector(state => getProductsSelector(state));
  const [domain, setDomain] = useState('');
  const [reportData, setReportData] = useState([]);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState();
  const [loader, setLoader] = useState(false);
  const [productId, setProductId] = useState();
  const [priceId, setPriceId] = useState();
  const [userEmail, setUserEmail] = useState('');

  function submitDomainHandler(e) {
    e.preventDefault();
    fetchReportByDomain(domain)
  }

  useEffect(() => {
    if (products && products.product && products.product.trial_length 
      && products.price && products.price.length > 0 && products.price[0].amount) {

      if (products.product.id && products.price[0].id) {
        setProductId(products.product.id);
        setPriceId(products.price[0].id);
      }
    }
  }, [products]);

  async function submitAccountHandler(e) {
    e.preventDefault();
    setError(null);
    setLoader(true);

    const password = nanoid(10);
    // create firebase user
    let firebaseUser;
    try {
      firebaseUser = await Firebase.createAccount(email, password);
    } catch(err) {
      setLoader(false);
      log.error("AUTH:: firebase account create", err);

      if (err.code === "auth/email-already-in-use") {

        return setError({
          severity: "error",
          message: `An account already exists with this email address`,
        });

      } else {
        return setError({
          severity: "error",
          message: err.message,
        });
      }
    }

    // create user
    let user;
    try {
      user = await create(username, '', '', email, '', '', firebaseUser.user.uid);
    } catch (err) {
      log.warn("ADMIN:: Error creating user ", err);
      return setError({
        severity: "error",
        message: err.message,
      });
    }

    if (user && user.data && user.data.id) {
      // create subscription for user
      try {
        await createAsAdmin(productId, priceId, user.data.id);
      } catch (err) {
        log.warn("ADMIN:: Error creating subscription ", err);
        return setError({
          severity: "error",
          message: err.message,
        });
      }

      // send acct created email
      const hashedPassword = btoa(password);
      try {
        await accountCreated(email, hashedPassword);
      } catch (err) {
        log.warn("ADMIN:: Error sending email ", err);
        return setError({
          severity: "error",
          message: err.message,
        });
      }
    } else {
      log.warn("ADMIN:: User wasn't created");
      return setError({
        severity: "error",
        message: "User wasn't created",
      });
    }

    setLoader(false);
    setError({
      severity: "info",
      message: "Account + free trial subscription created successfully for " + username,
    })
  }

  function domainChangeHandler(e) {
    setDomain(e.target.value);
  }

  function usernameHandler(e) {
    setUsername(e.target.value);
  }

  function emailHandler(e) {
    setEmail(e.target.value);
  }

  function fetchReportByDomain(domain) {
    setError(null);
    return Reporting.getReportByDomain(domain)
      .then(report => {
        log.debug("ADMIN:: Fetched reports by domain ", report);
        setReportData(report);
        setError({
          message: `Found classes for domain ${domain}`,
          severity: 'info'
        })
        log.info('report data ' , reportData);
      })
      .catch(err => {
        log.warn("ADMIN:: Error fetching report by domain ", err);
        return;
      }) 
  }

  function submitUserSearchHandler(e) {
    e.preventDefault();
    setError(null);
    return Reporting.getReportByUserEmail(userEmail)
      .then(report => {
        log.debug("ADMIN:: Fetched reports by userEmail ", report);
        setReportData(report);
        setError({
          message: `Found classes for user ${userEmail}`,
          severity: 'info'
        })
        log.info('report data ' , reportData);
      })
      .catch(err => {
        log.warn("ADMIN:: Error fetching report by userEmail ", err);
        return;
      }) 
  }

  function userEmailHandler(e) {
    setUserEmail(e.target.value);
  }

  let reportContent
  if (reportData) {
    // Currently this is set up for data to be an array of Objects with key value pairs of {email: [class array]}
    let content = reportData.map(data => {
      let key;
      
      const classContent = Object.keys(data).map(email => {
        const classes = data[email];
        key = email

        return classes.map(c => {
          const startDate = new Date(c.start_date).toLocaleDateString()
          return (
            <Typography 
              key={`${email}-${c.id}`} 
              variant='body2'
            >
              {`${email}: class "${c.title}" on ${startDate} with ${c.instructor_name}`}
            </Typography>
          )
        })
      })

      return (
        <Grid container key={`${key}-container`}>
          {classContent}
        </Grid>
      )
    })
    
    reportContent = (
      <Grid container>
        {content}
      </Grid>
    )
  }

  let progress;
  if (loader) {
    progress = (
      <LinearProgress color="secondary" />
		);
  }

  let infoContent = null;
  if (error) {
    infoContent = (
      <Grid item>
        <Alert severity={error.severity}>{error.message}</Alert>
      </Grid>
		)
  }
  
  let content;
  if (user && user.type === 'admin') {
    content = (
      <Analytics title="Admin">
        <Typography variant='h5'>
          Add Account (will auto generate password and send welcome email to user with password)
        </Typography>
        {infoContent}
        <form onSubmit={submitAccountHandler} className={classes.container}>
          <Grid container>
            <Grid item className={classes.item}>
              <Typography variant='body1' >Username:</Typography>
              <TextField onChange={usernameHandler} className={classes.inputField} />
            </Grid>
            <Grid item className={classes.item}>
              <Typography variant='body1'>Email:</Typography>
              <TextField onChange={emailHandler} className={classes.inputField} />
            </Grid>
            <Button type='submit' variant="contained" color="primary">Create</Button>
          </Grid>
        </form>
        {progress}
        <br />
        <Typography variant='h4'>{`Search reports by domain (ex. "indoorphins.fit")`}</Typography>
        <form onSubmit={submitDomainHandler} className={classes.container}>
          <Typography variant='h3'>Domain:</Typography>
          <TextField onChange={domainChangeHandler} />
          <Button type='submit' variant="contained" color="primary">Search</Button>
        </form>
        <Typography variant='h4'>{'Search reports by user email (ex. "alex@indoorphins.fit")'}</Typography>
        <form onSubmit={submitUserSearchHandler} className={classes.container}>
          <Typography variant='h3'>Email:</Typography>
          <TextField onChange={userEmailHandler} />
          <Button type='submit' variant="contained" color="primary">Search</Button>
        </form>
        {reportContent}
      </Analytics>
    );
  }
  return (
    <div>
      {content}
    </div>
  );
}
