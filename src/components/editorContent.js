import React from 'react';
import { Grid, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root:{},
  content: {},
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
      color: theme.palette.text.secondary, 
      fontSize: "1.5rem"
    },
    '#wysiwygContent > p': {
      fontSize: "1.1rem",
      color: theme.palette.text.secondary,
    },
    '#wysiwygContent > ol': {
      fontSize: "1.1rem",
      color: theme.palette.text.secondary,
    },
    '#wysiwygContent > ul': {
      fontSize: "1.1rem",
      color: theme.palette.text.secondary,
    },
    '#wysiwygContent > blockquote': {
      borderLeft: "3px solid grey",
      paddingLeft: "2em",
      fontStyle: "italic",
      fontWeight: "bold",
      color: theme.palette.text.secondary,
    }
  }
}));

export default function EditorContent(props) {
  const { content } = props;
  const classes = useStyles();

  return (
    <Grid container className={classes.root}>
      <div 
        id="wysiwygContent"
        className={classes.content}
        dangerouslySetInnerHTML={{__html: content}}
      />
    </Grid>
  )
}