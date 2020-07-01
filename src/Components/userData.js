import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography, useMediaQuery } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core';
import { EmailOutlined, PhoneOutlined, Photo } from '@material-ui/icons';
import InstagramIcon from './icon/instagram';

const useStyles = makeStyles((theme) => ({
  photo: {
    height: 350,
    minWidth: 300,
    maxWidth: 550,
    width: "100%",
    objectFit: "cover",
    borderRadius: "4px",
    '@media (max-width: 1100px)': {
      height: 300,
    },
    '@media (max-width: 850px)': {
      height: 400,
    },
  },
  nophoto: {
    height: 350,
    width: "100%",
    background: "#e4e4e4;",
  },
  nophotoIcon: {
    fontSize: "4rem",
    color: "#c7c7c7",
  },
  loader: {
    width: "100%",
    minHeight: 300,
  },
  metadata: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(6),
    paddingRight: theme.spacing(6),
    minWidth: 650,
    '@media (max-width: 1200px)': {
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(3),
      minWidth: 550,
    },
    '@media (max-width: 900px)': {
      minWidth: 400,
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
  },
  fullname: {
    display: "inline",
    marginRight: theme.spacing(1),
    color: theme.palette.text.secondary,
  },
  header: {
    display: "inline",
    fontStyle: "italic",
    color: theme.palette.text.secondary,
  },
  username: {
    display: "inline",
    fontStyle: "italic",
  },
  contact: {
    background: theme.palette.primary.main,
    padding: theme.spacing(1.5),
    minWidth: 225,
    maxWidth: 300,
    '@media (max-width: 900px)': {
      maxWidth: "100%",
      width: "100%",
    }
  },
  contactLabel: {
    color: theme.palette.text.secondary,
  },
  icon: {
    color: theme.palette.secondary.main,
    fontSize: "1.2rem",
    marginRight: theme.spacing(1),
  },
  link: {
    textDecoration: "none",
    cursor: "pointer",
    color: theme.palette.primary.main,
    display: "inline-block",
  }
}));

export default function (props) {

  const med = useMediaQuery('(max-width:700px)');
  const classes = useStyles();
  const [fullname, setFullname] = useState('');
  const [direction, setDirection] = useState("row");
  const theme = useTheme();
  const iconColor = theme.palette.secondary.main;

  useEffect(() => {
    if (med) {
      setDirection("column");
    } else {
      setDirection("row");
    }
  }, [med]);

  useEffect(() => {
    if (props.firstName && props.lastName) {
      setFullname(props.firstName + " " + props.lastName);
    }
  }, [props]);

  let bioContent = null;
  let phoneContent = null;
  let instaContent = null;
  let emailContent = null;
  let mailTo = "mailto:" + props.email;
  let pMethodContent = null;

  let nameHeader = (
    <Typography className={classes.fullname} variant="h1">
      {props.header}
    </Typography>
  )

  if (fullname) {
    nameHeader = (
      <Box>
        <Typography className={classes.fullname} variant="h1">
          {fullname}
        </Typography>
        <Typography className={classes.header} variant="h2">
          <span>(</span>
          {props.header}
          <span>)</span>
        </Typography>
      </Box>
    );
  }

  if (props.email) {
    emailContent = (
      <a title="Send me an email" className={classes.link} target="_blank" rel="noopener noreferrer" href={mailTo}>
        <Grid container>
          <Grid item>
            <EmailOutlined className={classes.icon} />
          </Grid>
          <Grid item>
            <Typography className={classes.contactLabel}>
              {props.email}
            </Typography>
          </Grid>
        </Grid>
      </a>
    );
  }

  if (props.bio) {
    bioContent = (
      <div id="wysiwygContent" className={classes.bio} dangerouslySetInnerHTML={{ __html: props.bio }}></div>
    );
  }

  if (props.phone) {
    phoneContent = (
      <Grid container>
        <Grid item>
          <PhoneOutlined className={classes.icon} />
        </Grid>
        <Grid item>
          <Typography className={classes.contactLabel}>
            {props.phone}
          </Typography>
        </Grid>
      </Grid>
    );
  }

  if (props.instagram) {
    let url = `https://www.instagram.com/${props.instagram}`;
    instaContent = (
      <a title="View my Instagram profile" className={classes.link} target="_blank" rel="noopener noreferrer" href={url}>
        <Grid container>
          <Grid item>
            <InstagramIcon color={iconColor} width="24px" height="24px" className={classes.icon} />
          </Grid>
          <Grid item>
            <Typography className={classes.contactLabel}>
              {props.instagram}
            </Typography>
          </Grid>
        </Grid>
      </a>
    );
  }

  let photoContent = (
    <Grid item xs>
      <Grid container direction="row" justify="center" alignContent="center" className={classes.nophoto}>
        <Grid item>
          <Photo className={classes.nophotoIcon} />
        </Grid>
      </Grid>
    </Grid>
  )

  if (props.photo) {
    photoContent = (
      <Grid item xs>
        <img className={classes.photo} alt={props.username} src={props.photo} />
      </Grid>
    );
  }

  if (props.paymentMethod) {
    // I think it looks better to not show payment info here and only on edit profile form
    // pMethodContent = (
    //   <Grid>
    //     <Typography className={classes.contactLabel}>
    //       {`Payment Method: ${props.paymentMethod.type.toUpperCase()} Card ending in ${props.paymentMethod.last4}`}
    //     </Typography>
    //   </Grid>
    // )
  }

  let userContent = (
    <Grid>
      <Grid container direction={direction} justify="space-evenly" alignItems="flex-start">
        {photoContent}
        <Grid className={classes.metadata} item xs>
          <Grid>
            {nameHeader}
          </Grid>
          <Grid>
            {bioContent}
          </Grid>
        </Grid>
        <Grid item xs>
          <Grid container direction="row" justify="flex-start" alignItems="center">
            {emailContent}
            {phoneContent}
            {instaContent}
            {pMethodContent}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );

  return userContent
};