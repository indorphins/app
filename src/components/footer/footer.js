import { Grid, IconButton, Link, makeStyles, Typography, useMediaQuery } from '@material-ui/core';
import React from 'react';
import { Instagram, Facebook } from '@material-ui/icons'
import { useHistory } from 'react-router-dom';
import path from '../../routes/path';
import webflowPaths from '../../routes/webflowPath';

const useStyles = makeStyles((theme) => ({
  footerBar: {
    backgroundColor: theme.palette.footer.main,
    position: "sticky",
    top: 0,
    zIndex: 5,
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    '@media (max-width: 600px)': {
      display: 'block'
    }
  },
  legalBar: {
    backgroundColor: theme.palette.footer.secondary,
    position: "sticky",
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: theme.spacing(8),
    paddingRight: theme.spacing(8),
    '@media (max-width: 600px)': {
      display: 'block',
      alignContent: 'center',
      paddingBottom: theme.spacing(2),
    }
  },
  legalText: {
    color: theme.palette.footer.text,
    display: 'block',
    '@media (max-width: 600px)': {
      display: 'none',
    }
  },
  legalTextMobile: {
    color: theme.palette.footer.text,
    display: 'none',
    '@media (max-width: 600px)': {
      display: 'block',
      textAlign: 'center',
    }
  },
  socialIcon: {
    color: theme.palette.footer.text
  },
  socialCtn: {
    alignContent: 'flex-end',
    justifyContent: 'normal',
    display: 'inline-flex',
    '@media (max-width: 600px)': {
      alignContent: 'center',
      justifyContent: 'center'
    }
  },
  logo: {
    color: theme.palette.footer.contrastText
  },
  logoCtn: {
    paddingLeft: theme.spacing(8),
  },
  link: {
    color: theme.palette.footer.text
  },
  linksCtn: {
    alignContent: 'flex-end',
    paddingRight: theme.spacing(8),
    paddingLeft: 'inherit',
    '@media (max-width: 600px)': {
      alignContent: 'inherit',
      paddingRight: 'inherit',
      paddingLeft: theme.spacing(8)
    }
  }
}));

function FooterLegal() {
  const classes = useStyles();
  const small = useMediaQuery('(max-width:600px)');
  const instaUrl = 'https://www.instagram.com/indoorphins.fit/';
  const fbUrl = 'https://www.facebook.com/indoorphins.fit';

  function navToUrl(url) {
    const win = window.open(url, '_blank');
    win.focus();
  }

  const instaIcon = (
    <IconButton>
      <Instagram className={classes.socialIcon} onClick={() => navToUrl(instaUrl)} />
    </IconButton>
  )

  const fbIcon = (
    <IconButton>
      <Facebook className={classes.socialIcon} onClick={() => navToUrl(fbUrl)} />
    </IconButton>
  )

  const iconContent = (
    <Grid container className={classes.socialCtn}>
        {fbIcon}
        {instaIcon}
    </Grid>
  )

  const legalContent = small ? null :
    (
      <Grid item>
        <Typography className={classes.legalText}>Copyright 2020</Typography>
      </Grid>
    );

  const mobileLegalContent = small ? (
      <Grid item>
        <Typography className={classes.legalTextMobile}>Copyright 2020</Typography>
      </Grid>
    ) : null;

  return (
    <React.Fragment>
      <Grid className={classes.legalBar}>
        {legalContent}
        <Grid item>
          {iconContent}
        </Grid>
        {mobileLegalContent}
      </Grid>
    </React.Fragment>
  )
}

export default function FooterNav(props) {
  const classes = useStyles();
  const history = useHistory();

  function navToPage(page) {
    console.log("Nav to page ", page)
    history.push(page);
  }

  function redirectToPage(url) {
    const win = window.open(url, '_blank');
    win.focus();
  }

  const logoContent = (
    <Grid item className={classes.logoCtn}>
      <Link variant='h4' className={classes.logo} underline='none' onClick={() => navToPage(path.courses)}>INDOORPHINS</Link>
    </Grid>
  )

  const linksContent = (
    <Grid container direction='column' className={classes.linksCtn}>
      <Grid item>
        <Link variant='h4' className={classes.link} underline='none' onClick={() => navToPage(path.courses)}>SCHEDULE</Link>
      </Grid>
      <Grid item>
        <Link variant='h4' className={classes.link} underline='none' onClick={() => navToPage(path.instructors)}>INSTRUCTORS</Link>
      </Grid>
      <Grid item>
        <Link variant='h4' className={classes.link} underline='none' onClick={() => redirectToPage(webflowPaths.faq)}>FAQ</Link>
      </Grid>
      <Grid item>
        <Link variant='h4' className={classes.link} underline='none' onClick={() => redirectToPage(webflowPaths.blog)}>BLOG</Link>
      </Grid>
      <Grid item>
        <Link variant='h4' className={classes.link} underline='none' onClick={() => redirectToPage(webflowPaths.contact)}>CONTACT</Link>
      </Grid>
    </Grid>
  )

  return (
    <React.Fragment>
      <Grid className={classes.footerBar}>
        {logoContent}
        {linksContent}
      </Grid>
      <FooterLegal />
    </React.Fragment>
  )
}