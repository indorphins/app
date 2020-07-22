import React, { useEffect, useState } from 'react';
import { Box, Card, Grid, Typography, useMediaQuery } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import { Photo } from '@material-ui/icons';

import ContactInfo from './contactInfo';

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
    '@media (max-width: 900px)': {
      minWidth: 400,
      paddingLeft: theme.spacing(0),
      paddingRight: theme.spacing(0),
    },
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
  }
}));

export default function(props) {

  const med = useMediaQuery('(max-width:700px)');
  const classes = useStyles();
  const [fullname, setFullname] = useState('');
  const [direction, setDirection] = useState("row");

  useEffect(() => {
    if (med) {
      setDirection("column");
    } else {
      setDirection("row");
    }
  }, [med]);

  useEffect(() => {
    if (props.firstName && props.lastName) {
      setFullname(props.firstName +  " " + props.lastName);
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
      <div id="wysiwygContent" className={classes.bio} dangerouslySetInnerHTML={{__html: props.bio}}></div>
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
          <Card className={classes.contactInfo}>
            <ContactInfo wrap={true} phone={props.phone} email={props.email} instagram={props.instagram} />
          </Card>
        </Grid> 
      </Grid>
    </Grid>
  );

  return userContent
};