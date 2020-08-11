import React from 'react';
import InstagramIcon from './icon/instagram';
import { makeStyles, useTheme } from '@material-ui/core';
import { Grid, Typography} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  contactLabel: {
    color: theme.palette.text.secondary,
  },
  icon: {
    color: theme.palette.primary.main,
    fontSize: "1.5rem",
  },
  link: {
    textDecoration: "none",
    cursor: "pointer",
    color: theme.palette.primary.main,
    display: "inline-block",
    width: "100%",
  },
  iconCnt: {
    display: 'flex',
  },
  container: {
    padding: theme.spacing(1),
  },
}));

export const Instagram = (props) => {

  const classes = useStyles();
  const theme = useTheme();
  const iconColor = theme.palette.primary.main;
  const url = `https://www.instagram.com/${props.instagram}`;

  return (
    <a title="View Instagram profile" className={classes.link} target="_blank" rel="noopener noreferrer" href={url}>
      <Grid container direction="row" justify="flex-start" alignItems="center" alignContent="center" spacing={1} className={classes.container} >
        <Grid item className={classes.iconCnt}>
          <InstagramIcon color={iconColor} width="28px" height="28px" className={classes.icon} />
        </Grid>
        <Grid item>
          <Typography className={classes.contactLabel}>
            {`@${props.instagram}`}
          </Typography>
        </Grid>
      </Grid>
    </a>
  )
};