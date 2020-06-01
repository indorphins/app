import React, { useEffect } from 'react';
import MUIRichTextEditor from 'mui-rte';
import { EditorState, convertToRaw, ContentState, convertFromHTML } from 'draft-js';
import { convertToHTML } from 'draft-convert';
import { MuiThemeProvider, useTheme, makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';


export default function(props) {

  const useStyles = makeStyles((theme) => ({
    root: {
      marginTop: theme.spacing(2)
    }
  }));
  
  const defaultTheme = useTheme();
  const classes = useStyles();
  const [html, setHtml] = React.useState(null);
  const emptyContentState = JSON.stringify(convertToRaw(EditorState.createEmpty().getCurrentContent()));
  const[editorState, setEditorState] = React.useState(emptyContentState);

  const enabledControls = [
    "title",
    "bold", 
    "italic",
    "underline", 
    "strikethrough", 
    "highlight", 
    "undo", 
    "redo", 
    "link",
    "numberList", 
    "bulletList", 
    "quote",
    "save"
  ];

  useEffect(() => {
    if (props.value) {
      console.log("got initial value", props.value)
      const blocksFromHTML = convertFromHTML(props.value);
      console.log(blocksFromHTML);
      const st = ContentState.createFromBlockArray(
        blocksFromHTML.contentBlocks,
        blocksFromHTML.entityMap,
      );
      const content = JSON.stringify(convertToRaw(st))

      setEditorState(content);
    }
  }, [props.value]);
  

  Object.assign(defaultTheme, {
    overrides: {
      MUIRichTextEditor: {
        root: {
          marginBottom: defaultTheme.spacing(2),
          width: "70%",
          border: "1px solid gray",
          borderRadius: "0.3rem",
        },
        editor: {
          borderTop: "1px solid gray",
          padding: defaultTheme.spacing(1),
        }
      },
      MuiTextField: {
				root: {
					marginTop: defaultTheme.spacing(2),
				}
			},
    }
  });

  const changeHandler = function(e) {
    let h = convertToHTML(e.getCurrentContent());
    setHtml(h);
    if (typeof props.onChange === "function") {
      props.onChange(h);
    }
  }

  const saveHandler = function(e) {
    console.log(html);
    if (typeof props.onSave === "function") {
      props.onSave(html);
    }
  }

  return (
    <MuiThemeProvider theme={defaultTheme}>
      <Box className={classes.root}>
        <Box>
          <Typography variant="subtitle2">
            {props.label}
          </Typography>
        </Box>
        <MUIRichTextEditor defaultValue={editorState} onChange={changeHandler} onSave={saveHandler} controls={enabledControls} />
      </Box>
    </MuiThemeProvider>
  );
}