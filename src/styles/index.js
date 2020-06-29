import React, { useEffect, useState } from 'react';
import { Box, CssBaseline } from '@material-ui/core';
import { ThemeProvider, createMuiTheme, responsiveFontSizes, makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import { store, actions } from '../store';

const colors = {
  pink: "#fab4cd",
  pinkishblack: "#262425",
  black: "#121212",
  black1: "#1a1a1a",
  black2: "#1f1f1f",
  skyblue: "#b3d7ff",
  royalblue: "#011f6b",
  offwhite: "#f5f5f0",
}

const typography = {
  direction: 'ltr',
  fontSize: 14,
  h1: {
    fontSize: '2.2rem',
    fontWeight: 900,
    marginBottom: '0.5em',
  },
  h2: {
    fontSize: '1.6rem',
    fontWeight: 500,
    marginBottom: '0.3em',
  },
  h3: {
    fontSize: '1.3rem',
  },
  h4: {
    fontSize: '1.1rem',
    fontWeight: 500,
  },
  h5: {
    fontSize: '1.1rem',
    fontWeight: 300,
  },
  h6: {
    fontSize: '1.1rem',
    fontStyle: 'italic',
  }
}

let lightTheme = createMuiTheme({
  palette: {
    type: 'light',
    primary: {
      //main: colors.pinkishblack,
      //contrastText: colors.pink,
      main: colors.royalblue,
      contrastText: colors.offwhite,
    },
    secondary: {
      main: colors.skyblue,
      contrastText: colors.offwhite,
    }
  },
  spacing: 8,
  typography: typography,
});


let darkTheme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: colors.black,
      contrastText: lightTheme.palette.grey[400],
    },
    secondary: {
      main: lightTheme.palette.grey[400],
      contrastText: colors.black,
    },
    background: {
      paper: colors.black1,
      default: colors.black2
    },
    text: {
      primary: lightTheme.palette.grey[300],
      secondary: lightTheme.palette.grey[400],
      disabled: lightTheme.palette.grey[600],
      hint: lightTheme.palette.grey[800],
    }
  },
  spacing: 8,
  typography: typography,
});

const useStyles = makeStyles((theme) => ({
  root: {},
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

const getThemeSelector = createSelector([state => state.theme], (theme) => {
  return theme;
});

export default function(props) {

  const currentTheme = useSelector(state => getThemeSelector(state));
  const [theme, setTheme] = useState(responsiveFontSizes(lightTheme));
  const classes = useStyles();
  const overrides = {
    MuiTextField: {
      root: {
        marginTop: theme.spacing(2),
      }
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
      }
    },
    MuiGridListTileBar: {
      root: {
        background: "rgba(0, 0, 0, 0.5)",
        borderBottomLeftRadius: "4px",
        borderBottomRightRadius: "4px",
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
        border: "1px solid gray",
        borderRadius: "0.3rem",
      },
      editor: {
        borderTop: "1px solid gray",
        padding: theme.spacing(1),
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
        <CssBaseline/>
        <Box className={classes.root}></Box>
        {props.children}
      </ThemeProvider>
    </React.Fragment>
  );
}