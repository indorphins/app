import React from 'react';
import { Badge, Button, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const styles = makeStyles((theme) => ({
  selected: {
    color: theme.palette.common.black,
    minWidth: 0,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    whiteSpace: "nowrap",
    fontSize: '1rem',
    '@media (max-width: 900px)': {
      fontSize: ".8rem",
    },
  },
  unselected: {
    color: theme.palette.grey[600],
    fontWeight: 400,
  },
  badge: {
    fontSize: '.6rem',
    fontWeight: "bold",
    color: theme.palette.secondaryColor.contrastText,
    backgroundColor: theme.palette.secondaryColor.main,
  },
  navBar: {
    justifyContent: 'center',
    display: 'flex',
    background: theme.palette.common.background
  }
}));

function TabItem(props) {

  const classes = styles();

  let style = classes.selected;

  if (props.value !== props.tab) {
    style = `${classes.selected} ${classes.unselected}`
  }

  if (props.badge) {

    return (
      <Badge badgeContent={props.badge} classes={{badge:classes.badge}}>
        <Button onClick={props.onClick} className={style}>
          {props.label}
        </Button>
      </Badge>
    )

  } else {

    return (
      <Button onClick={props.onClick} className={style}>
        {props.label}
      </Button>
    )
  }
}

// Takes in a setPage and navTab prop 
export default function ProfileNav(props) {
  const classes = styles();
  const { setPage, tab } = props;

  const navProfile = () => {
    setPage('Profile');
  }

  const navMembership = () => {
    setPage('Membership');
  }

  return (
    <Grid className={classes.navBar}>
      <TabItem
        tab={tab}
        value="Profile"
        label="Profile"
        onClick={navProfile}
      />
      <TabItem
        tab={tab}
        value="Membership"
        label="Membership"
        onClick={navMembership}
      />
    </Grid>
  )
}