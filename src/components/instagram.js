import React, { useEffect, useState } from 'react';
import InstagramIcon from './icon/instagram';
import { makeStyles } from '@material-ui/core';
import { Grid, Typography} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  link: {
    textDecoration: "none",
    cursor: "pointer",
    color: theme.palette.primary.main,
    display: "inline-block",
    width: "100%",
  },
  container: {
    cursor: 'pointer',
  },
  icon: {
    display: 'flex',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

export default function Instagram(props) {

  const classes = useStyles();
  const [ url, setUrl ] = useState(null);

  useEffect(() => {
    if (props.instagram) {
      setUrl(`https://www.instagram.com/${props.instagram}`);
    }
  }, [props])

  const navigate = function() {
    let win = window.open(url, '_blank');
    win.focus();
  }

  return (
    <Grid
      container
      direction="row"
      justify="flex-start"
      alignItems="center"
      alignContent="center"
      spacing={2}
      className={classes.container}
      onClick={navigate}
      title="Instagram"
    >
      <Grid item className={classes.icon}>
        <InstagramIcon />
      </Grid>
      <Grid item>
        <Typography variant="h5">
          {`@${props.instagram}`}
        </Typography>
      </Grid>
    </Grid>
  );
}
