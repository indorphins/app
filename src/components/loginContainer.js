import React from "react";
import { Grid, Paper, Typography, Zoom } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";


const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.common.background,
    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(2)
  },
  textContainer: {
    width: '45%',
  },
  paperContainer: {
    backgroundColor: theme.palette.common.white,
    borderColor: theme.palette.grey[500],
    border: '1px solid',
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
    paddingTop: theme.spacing(6),
    paddingBottom: theme.spacing(2),
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    width: '45%',
    '@media (max-width: 600px)': {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
      paddingTop: theme.spacing(3),
      width: "100%",
      borderRadius: 0,
    },
  },
  header: {
    marginBottom: theme.spacing(2)
  },
  logo: {
    fontSize: "2rem",
    paddingLeft: theme.spacing(1),
    color: theme.palette.secondary.color
  },
  link: {
    color: theme.palette.primary.main,
    textDecoration: "none",
  }
}));

export function Legal() {
  const classes = useStyles();

  return (
    <Grid container direction="row" justify="space-between">
      <Grid item>
        <a className={classes.link} href="/PP.html" target="_blank">Privacy Policy</a>
      </Grid>
      <Grid item>
        <a className={classes.link} href="/TOS.html" target="_blank">Terms of Service</a>
      </Grid>
    </Grid>
  )
}

export default function LoginContainer(props) {

  const classes = useStyles();

  return (
    <Grid className={classes.root}>
      <Grid 
				container
				spacing={0}
				direction="row"
				alignItems="center"
				justify="center"
				style={{ minHeight: '100vh' }}
      >
        <Grid item className={classes.textContainer}>
          <Grid container direction='column' >
            <Grid item>
              <Typography variant='h1' className={classes.header}>Bye Bye Zoom</Typography>
            </Grid>
            <Grid item>
              <Typography variant='body1'>Connect and move with friends and </Typography>
            </Grid>
            <Grid item>
              <Grid container direction='row' alignItems='center' justify='flex-start'>
                <Grid item>
                  <Typography variant='body1'>community on </Typography>
                </Grid>
                <Grid item>
                  <Typography variant='h5' className={classes.logo}>Indoorphins</Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Zoom in={true}>
          <Paper elevation={2} className={classes.paperContainer}>
            <Grid container direction="column" spacing={2}>
              <Grid item>
                {props.children}
              </Grid>
            </Grid>
          </Paper>
        </Zoom>
      </Grid>
    </Grid>
  );
}