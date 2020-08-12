import React, { useEffect, useState } from 'react';
import { Box, Card, Grid, Typography, useMediaQuery } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import { Photo } from '@material-ui/icons';

import ContactInfo from './contactInfo';

const useStyles = makeStyles((theme) => ({
  photo: {
    minHeight: 400,
    maxHeight: 550,
    width: "100%",
    objectFit: "cover",
    borderRadius: "4px",
    '@media (max-width: 900px)': {
      minHeight: 350,
      maxHeight: 500,
    },
    '@media (max-width: 600px)': {
      minHeight: 300,
      maxHeight: 450,
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
  fullname: {
    display: "inline",
    marginRight: theme.spacing(1),
  },
  header: {
    display: "inline",
    fontStyle: "italic",
  },
  username: {
    display: "inline",
    fontStyle: "italic",
  },
  '@global': {
    html: {
      overflow: 'hidden',
      height: '100%',
    },
    body: {
      overflow: 'auto',
      height: '100%',
    },
    '#wysiwygContent > h2': {
      color: theme.palette.grey[500], 
      fontSize: "1.5rem"
    },
    '#wysiwygContent > p': {
      fontSize: "1.1rem",
      color: theme.palette.grey[500],
    },
    '#wysiwygContent > ol': {
      fontSize: "1.1rem",
      color: theme.palette.grey[500],
    },
    '#wysiwygContent > ul': {
      fontSize: "1.1rem",
      color: theme.palette.grey[500],
    },
    '#wysiwygContent > blockquote': {
      borderLeft: "3px solid grey",
      paddingLeft: "2em",
      fontStyle: "italic",
      fontWeight: "bold",
      color: theme.palette.grey[400],
    }
  },
  contactInfo: {
    backgroundColor: theme.palette.grey[200],
    width: "100%",
  }
}));

export default function (props) {

  const sm = useMediaQuery('(max-width:600px)');
  const med = useMediaQuery('(max-width:900px)');
  const classes = useStyles();
  const [fullname, setFullname] = useState('');

  useEffect(() => {
    if (props.firstName && props.lastName) {
      setFullname(props.firstName + " " + props.lastName);
    }
  }, [props]);

  let bioContent = null;

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

  if (props.bio) {
    bioContent = (
      <div id="wysiwygContent" className={classes.bio} dangerouslySetInnerHTML={{ __html: props.bio }}></div>
    );
  }

  let photoContent = (
    <Grid container direction="row" justify="center" alignContent="center" className={classes.nophoto}>
      <Grid item>
        <Photo className={classes.nophotoIcon} />
      </Grid>
    </Grid>
  )

  if (props.photo) {
    photoContent = (  
      <img className={classes.photo} alt={props.username} src={props.photo} />
    );
  }

  let layout = null;

  if (sm) {
    layout = {
      direction: "column",
      photoSize: 12,
      bioSize: 12,
      contactSize: 12,
      userData: 12,
    }
  } else if (med) {
    layout = {
      direction: "column",
      photoSize: 4,
      bioSize: 8,
      contactSize: 12,
      userData: 12,
    }
  } else {
    layout = {
      direction: "row",
      photoSize: 4,
      bioSize: 8,
      contactSize: 3,
      userData: 9,
    }
  }
  
  let userContent = (
    <Grid container direction={layout.direction} justify="flex-start" alignItems="flex-start" spacing={2}>
      <Grid item xs={layout.userData}>
        <Grid container direction="row" justify="flex-start" spacing={2}>
          <Grid item xs={layout.photoSize}>
            {photoContent}
          </Grid>
          <Grid item xs={layout.bioSize}>
            <Grid>
              {nameHeader}
            </Grid>
            <Grid>
              {bioContent}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid item container xs={layout.contactSize}>
        <Card className={classes.contactInfo}>
          <ContactInfo wrap={true} phone={props.phone} email={props.email} instagram={props.instagram} />
        </Card>
      </Grid> 
    </Grid>
  );

  return userContent
}