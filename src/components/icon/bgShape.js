/* eslint max-len: 0*/
import React from 'react';
import { Grid, makeStyles } from '@material-ui/core';

const styles = makeStyles((theme) => ({
  root: {
    position: "absolute",
    top: 0,
    right: 0,
    width: "50%",
    height: "auto",
    zIndex: -9,
    '@media (max-width: 960px)': {
      width: "100%",
    },
  },
}));

export default function BgShape(props) {

  const classes = styles();
  const { color, opacity } = props;

  return (
    <Grid className={classes.root}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 977.231 551.886">
        <path id="BG_Shape" data-name="BG Shape" d="M996.131,0H18.9L138.321,372.833l857.81,179.053Z" transform="translate(-18.9)" fill={color} opacity={opacity} />
      </svg>
    </Grid>
  );
}