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
    marginLeft: 'auto',
    marginRight: 'auto',
    '@media (max-width: 900px)': {
      display: 'none'
    }
  },
  paperContainer: {
    backgroundColor: theme.palette.grey[100],
    borderColor: theme.palette.grey[50],
    border: '1px solid',
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(2),
    marginLeft: theme.spacing(2),
    marginRight: 'auto',
    width: '40%',
    '@media (max-width: 900px)': {
      marginLeft: 'auto',
      width: '90%',
      paddingTop: theme.spacing(2),
    },
    '@media (max-width: 600px)': {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
      width: "100%",
      borderRadius: 0,
    },
  },
  header: {
    marginBottom: theme.spacing(1),
    fontSize: '4.2rem',
    fontWeight: 900,
    wordSpacing: '.75rem',
    letterSpacing: 1.5,
    color: theme.palette.primary.main
  },
  text: {
    fontWeight: 400,
    wordSpacing: '.5rem',
    letterSpacing: 1.5,
    color: theme.palette.primary.main
  },
  logo: {
    fontSize: "2rem",
    fontWeight: 900,
    paddingLeft: theme.spacing(2),
    color: theme.palette.secondaryColor.main,
  },
  logo2: {
    fontSize: "2rem",
    fontWeight: 900,
    color: theme.palette.secondary.color,
    display: 'none',
    paddingBottom: theme.spacing(1),
    '@media (max-width: 900px)': {
      display: 'flex'
    }
  },
  link: {
    color: theme.palette.primary.main,
    textDecoration: "none",
  },
  children: {
    width: '100%'
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
              <Typography className={classes.header}>Bye bye Zoom</Typography>
            </Grid>
            <Grid item>
              <Typography variant='h3' className={classes.text}>Connect and move with friends and </Typography>
            </Grid>
            <Grid item>
              <Grid container direction='row' alignItems='center' justify='flex-start'>
                <Grid item>
                  <Typography variant='h3' className={classes.text}>community on </Typography>
                </Grid>
                <Grid item>
                  <Typography variant='h5' className={classes.logo}>INDOORPHINS</Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Zoom in={true}>      
          <Paper elevation={2} className={classes.paperContainer}>
            <Grid container direction="column" alignItems='center' spacing={2}>
              <Grid item>
                <Typography variant='h5' className={classes.logo2}>INDOORPHINS</Typography>
              </Grid>
              <Grid item className={classes.children}>
                {props.children}
              </Grid>
            </Grid>
          </Paper>
        </Zoom>
      </Grid>
    </Grid>
  );
}