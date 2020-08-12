import React, { useEffect } from 'react';
import MUIRichTextEditor from 'mui-rte';
import { convertToRaw, ContentState, convertFromHTML } from 'draft-js';
import { convertToHTML } from 'draft-convert';
import { Box, Typography, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  header: {
    color: theme.palette.grey[600],
    fontSize: '1rem',
  }
}));

export default function Editor(props) {

  const classes = useStyles();
  const [html, setHtml] = React.useState(null);
  const blocksFromHTML = convertFromHTML("");
  const st = ContentState.createFromBlockArray(
    blocksFromHTML.contentBlocks,
    blocksFromHTML.entityMap,
  );
  const emptyContentState = JSON.stringify(convertToRaw(st));
  const[editorState, setEditorState] = React.useState(emptyContentState);

  const enabledControls = [
    "title",
    "bold", 
    "italic",
    "underline", 
    "strikethrough", 
    "undo", 
    "redo", 
    "numberList", 
    "bulletList", 
    "quote",
    "save"
  ];

  useEffect(() => {
    if (props.value && props.value !== "") {
      let blocksFromHTML = convertFromHTML(props.value);
      let st = ContentState.createFromBlockArray(
        blocksFromHTML.contentBlocks,
        blocksFromHTML.entityMap,
      );
      let content = JSON.stringify(convertToRaw(st))

      setEditorState(content);
    }
  }, [props.value]);
  

  const changeHandler = function(e) {
    let h = convertToHTML(e.getCurrentContent());
    setHtml(h);
    if (typeof props.onChange === "function") {
      props.onChange(h);
    }
  }

  const saveHandler = function(e) {
    if (typeof props.onSave === "function") {
      props.onSave(html);
    }
  }

  return (
    <Box>
      <Box>
        <Typography variant="subtitle2" className={classes.header}>
          {props.label}
        </Typography>
      </Box>
      <MUIRichTextEditor
        defaultValue={editorState}
        onChange={changeHandler}
        onSave={saveHandler}
        controls={enabledControls} 
      />
    </Box>
  );
}