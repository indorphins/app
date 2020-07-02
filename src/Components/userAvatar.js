import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Avatar, Button, Box, Menu, MenuItem, Typography, Zoom } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';

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

export default function(props) {

  const currentUser = props.user;
  const classes = useStyles();
  const history = useHistory();
  const [anchorEl, setAnchorEl] = useState(null);
  const [username, setUsername] = useState(null);
  const [profileImg, setProfileImg] = useState(null);

  useEffect(() => {
    setUsername(currentUser.username);
    setProfileImg(currentUser.photo_url);
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
          <Zoom in={true}>
            {avatar}
          </Zoom>
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