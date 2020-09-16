import React, { useEffect, useState } from 'react';
import { Box, CssBaseline } from '@material-ui/core';
import { ThemeProvider, responsiveFontSizes, makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import { store, actions } from '../store';
import { light, dark } from './theme';

let lightTheme = light;
let darkTheme = dark;

const useStyles = makeStyles((theme) => ({
  root: {},
  '@global': {
    // '@font-face': {
    //   fontFamily: "Lato",
    //   src: 'url(/font/Lato-Black.ttf) format("truetype")',
    //   fontWeight: 900,
    //   fontStyle: 'normal'
    // },    
    // '@font-face': {
    //   fontFamily: "Lato",
    //   src: 'url(/font/Lato-BlackItalic.ttf) format("truetype")',
    //   fontWeight: 900,
    //   fontStyle: 'italic'
    // },
    // '@font-face': {
    //   fontFamily: "Lato",
    //   src: 'url(/font/Lato-Bold.ttf) format("truetype")',
    //   fontWeight: 700,
    //   fontStyle: 'normal'
    // },
    // '@font-face': {
    //   fontFamily: "Lato",
    //   src: 'url(/font/Lato-BoldItalic.ttf) format("truetype")',
    //   fontWeight: 700,
    //   fontStyle: 'italic'
    // },
    // '@font-face': {
    //   fontFamily: "Lato",
    //   src: 'url(/font/Lato-Italic.ttf) format("truetype")',
    //   fontWeight: 400,
    //   fontStyle: 'italic',
    // },
    '@font-face': {
      fontFamily: "Lato",
      src: 'url(/font/Lato-Regular.ttf) format("truetype")',
      fontWeight: 400,
      fontStyle: 'normal'
    },  
    // '@font-face': {
    //   fontFamily: "Lato",
    //   src: 'url(/font/Lato-Light.ttf) format("truetype")',
    //   fontWeight: 300,
    //   fontStyle: 'normal'
    // },  
    // '@font-face': {
    //   fontFamily: "Lato",
    //   src: 'url(/font/Lato-LightItalic.ttf) format("truetype")',
    //   fontWeight: 300,
    //   fontStyle: 'italic'
    // },  
    // '@font-face': {
    //   fontFamily: "Lato",
    //   src: 'url(/font/Lato-Thin.ttf) format("truetype")',
    //   fontWeight: 100,
    //   fontStyle: 'normal'
    // },  
    // '@font-face': {
    //   fontFamily: "Lato",
    //   src: 'url(/font/Lato-ThinItalic.ttf) format("truetype")',
    //   fontWeight: 100,
    //   fontStyle: 'italic'
    // },  
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

const getThemeSelector = createSelector([state => state.theme], (theme) => {
  return theme;
});

export default function Styles(props) {

  const currentTheme = useSelector(state => getThemeSelector(state));
  const [theme, setTheme] = useState(responsiveFontSizes(lightTheme));
  const classes = useStyles();
  const overrides = {
    MuiLink: {
      root: {
        marginTop: theme.spacing(2),
        cursor: 'pointer',
      }
    },
    MuiButton: {
      root: {
        fontWeight: "bold",
      },
      containedSecondary: {
        "&:hover": {
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
        },
      },
      containedPrimary: {
        "&:hover": {
          backgroundColor: theme.palette.secondary.main,
          color: theme.palette.secondary.contrastText,
        },
      },
    },
    MuiFab: {
      primary: {
        '&:hover': {
          backgroundColor: theme.palette.secondary.main,
          color: theme.palette.secondary.contrastText,
        }
      },
    },
    MuiGridListTileBar: {
      root: {
        background: "rgba(0, 0, 0, 0.5)",
      },
      subtitle:{
        color: theme.palette.secondary.main
      },
      rootSubtitle: {
        height: "auto",
        paddingTop: theme.spacing(0.5),
        paddingBottom: theme.spacing(0.5),
      }
    },
    MUIRichTextEditor: {
      root: {
        width: "100%",
        border: "1px solid " + theme.palette.grey[400],
        borderRadius: "0.3rem",
        '&:hover': {
          border: "1px solid " + theme.palette.grey[800],
        },
        '&:focus': {
          border: "1px solid " + theme.palette.grey[800],
        }
      },
      editor: {
        borderTop: "1px solid " + theme.palette.grey[400],
        padding: 0,
        minHeight: "40px",
      },
      editorContainer: {
        margin: 0,
        padding: theme.spacing(1),
        minHeight: "40px",
      }
    },
    MuiTab: {
      disabled:{
        color: theme.palette.text.disabled,
      },
      selected: {
        fontWeight: "bold",
        color: theme.palette.secondary.main,
      },
      textColorSecondary: {
        color: theme.palette.secondary.main,
      },
    }
  }

  Object.assign(theme, {
    overrides: overrides
  });

  useEffect(() => {
    async function init() {
      store.dispatch(actions.theme.setLightMode());
    }

    init();
  }, [])

  useEffect(() => {

    if (currentTheme === 'light' && theme !== 'light') {
      setTheme(responsiveFontSizes(lightTheme));
    }
    
    if (currentTheme === 'dark' && theme !== 'dark') {
      setTheme(responsiveFontSizes(darkTheme));
    }

  }, [currentTheme]);

  return (
    <React.Fragment>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box className={classes.root}></Box>
        {props.children}
      </ThemeProvider>
    </React.Fragment>
  );
}