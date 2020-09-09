import React from 'react';
import { Typography, Grid, makeStyles, Tooltip } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  milestone: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    borderColor: theme.palette.grey[500],
    border: "solid 2px",
  },
  number: {
    minWidth: 60,
    textAlign: "center",
    '@media (max-width: 900px)': {
      minWidth: 40,
    },
  },
  hit: {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.common.white,
  },
  style1: {
    borderRadius: "20% / 50%"
  },
  style2: {
    borderRadius: "50% / 35%"
  },
  style3: {
    borderRadius: "10% / 50%"
  },
  style4: {
    borderRadius: "65% / 40%"
  },
  style5: {
    borderRadius: "75% / 15%"
  },
  style6: {
    borderRadius: "20% / 20%"
  },
  style7: {
    borderRadius: "80% / 30%"
  },
  style8: {
    borderRadius: "90% / 50%"
  },
  style9: {
    borderRadius: "100% / 10%"
  },
  style10: {
    borderRadius: "25% / 25%"
  },
}));

export default function Milestone(props) {
  const classes = useStyles();

  let contentStyle = `${classes.milestone}`;

  if (props.hit) {
    contentStyle += ` ${classes.hit}`;
  }
  
  if (props.format) {
    // switch (props.format) {
    //   case 1:
    //     contentStyle += ` ${classes.style1}`;
    //     break;
    //   case 2:
    //     contentStyle += ` ${classes.style2}`;
    //   case 3:
    //     contentStyle += ` ${classes.style3}`;
    //     break;
    //   case 4:
    //     contentStyle += ` ${classes.style4}`;
    //     break;
    //   case 5:
    //     contentStyle += ` ${classes.style5}`;
    //     break;
    //   case 6:
    //     contentStyle += ` ${classes.style6}`;
    //     break;
    //   case 7:
    //     contentStyle += ` ${classes.style7}`;
    //     break;
    //   case 8:
    //     contentStyle += ` ${classes.style8}`;
    //     break;
    //   case 9:
    //     contentStyle += ` ${classes.style9}`;
    //     break;
    //   case 10:
    //     contentStyle += ` ${classes.style10}`;
    //     break;
    //   default:
    //     break;
    // }
  }

  return (
    <Grid container direction='column' alignItems='center' justify='center' spacing={2}>
      <Grid item className={contentStyle}>
        <Tooltip title={props.tooltip} placement='top'>
          <Grid container direction="column" justify='center' alignItems="center" spacing={1}>
            <Grid item>
              <Typography variant='h3' className={classes.number} style={{color: "inherit"}}>
                {props.iconText}
              </Typography>
            </Grid>
            <Grid item>
              {props.children}
            </Grid>
          </Grid>      
        </Tooltip>
      </Grid>
      <Grid item>
        <Typography variant='body2' align='center'>{props.label}</Typography>
      </Grid>
    </Grid>
  )
}