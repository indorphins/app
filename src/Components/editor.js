import React, { useEffect } from 'react';
import MUIRichTextEditor from 'mui-rte';
import { EditorState, convertToRaw, ContentState, convertFromHTML } from 'draft-js';
import { convertToHTML } from 'draft-convert';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

export default function(props) {

  const [html, setHtml] = React.useState(null);
  const emptyContentState = JSON.stringify(convertToRaw(EditorState.createEmpty().getCurrentContent()));
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
    if (props.value) {
      const blocksFromHTML = convertFromHTML(props.value);
      const st = ContentState.createFromBlockArray(
        blocksFromHTML.contentBlocks,
        blocksFromHTML.entityMap,
      );
      const content = JSON.stringify(convertToRaw(st))

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
        <Typography variant="subtitle2">
          {props.label}
        </Typography>
      </Box>
      <MUIRichTextEditor defaultValue={editorState} onChange={changeHandler} onSave={saveHandler} controls={enabledControls} />
    </Box>
  );
}