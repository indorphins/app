/* eslint no-dupe-keys: 0*/
import React, { useEffect, useState } from 'react';
import { Box, CssBaseline } from '@material-ui/core';
import { ThemeProvider, responsiveFontSizes, makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import { store, actions } from '../store';
import { light, dark } from './theme';

import Fonts from './fonts';

let lightTheme = light;
let darkTheme = dark;

const useStyles = makeStyles((theme) => ({
  root: {},
  '@global': {
    "@keyframes dropbounce": {
      "0%": { transform: "translateY(-100%)" },
      "59%": { transform: "translateY(0)" },
      "60%": { transform: "translate(9px, -12px) rotate(7deg)" },
      "70%": { transform: "translate(18px, 0px) rotate(7deg)" },
      "80%": { transform: "translate(0px, -10px) rotate(-7deg)" },
      "90%": { transform: "translate(-7px, 0px) rotate(-7deg)" },
      "100%": { transform: "translate(0px, 0px) rotate(0deg)" },
    },
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
    MuiCssBaseline: {
      '@global': {
        '@font-face': Fonts(),
      },
    },
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
    },
    MuiTooltip: {
      tooltip: {
        color: theme.palette.primary.contrastText,
      }
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