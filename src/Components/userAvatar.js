import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import Firebase from "../Firebase";

const useStyles = makeStyles((theme) => ({
  root: {
    cursor: "pointer",
  },
  avatar: {
    width: "2rem",
    height: "2rem",
    '@media (max-width: 600px)': {
      width: "1.5rem",
      height: "1.5rem",
    }
  }
}));

const getUserSelector = createSelector([state => state.user.data], (user) => {
  return user;
});

export default function() {

  const currentUser = useSelector(state => getUserSelector(state));
  const classes = useStyles();
  const history = useHistory();
  const [anchorEl, setAnchorEl] = useState(null);
  const [username, setUsername] = useState(null);
  const [profileImg, setProfileImg] = useState(null);

  useEffect(() => {
    if (currentUser.username) {
      setUsername(currentUser.username);
    } else {
      setUsername(null);
    }

    if (currentUser.photo_url) {
      setProfileImg(currentUser.photo_url);
    } else {
      setProfileImg(null);
    }
  }, [currentUser]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = function() {
    setAnchorEl(null);
  }

  const goToProfile = function() {
    setAnchorEl(null);
    history.push('/profile');
  };
  
  const doLogout = function() {
    setAnchorEl(null);
    Firebase.logout();
    history.push('/');
  }

  const goToLogin = function() {
    history.push('/login');
  }

  let noUserContent = (
    <Box className={classes.root}>
      <Button color="secondary" onClick={goToLogin}>Log in</Button>
    </Box>
  )

  let userContent;
  if (username) {

    let fl = username.charAt(0).toUpperCase();
    let avatar = (
      <Avatar className={classes.avatar}>
        <Typography>{fl}</Typography>
      </Avatar>
    );

    if (profileImg) {
      avatar = (
        <Avatar className={classes.avatar} alt={username} src={profileImg} />
      );
    } 

    userContent = (
      <Box className={classes.root}>
        <Box onClick={handleClick}>
          {avatar}
        </Box>
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={goToProfile}>Profile</MenuItem>
          <MenuItem onClick={doLogout}>Logout</MenuItem>
        </Menu>
      </Box>
    )
  }

  if (username) {
    return userContent;
  };

  return noUserContent;
};