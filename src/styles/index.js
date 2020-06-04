import React from 'react';
import { Box, CssBaseline } from '@material-ui/core';
import { ThemeProvider, createMuiTheme, responsiveFontSizes, makeStyles } from '@material-ui/core/styles';

const colors = {
  pink: "#fab4cd",
  pinkishblack: "#262425",
  black: "#121212",
  black1: "#1a1a1a",
  black2: "#1f1f1f"
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
  }
}

let lightTheme = createMuiTheme({
  palette: {
    type: 'light',
    primary: {
      main: colors.pinkishblack,
      contrastText: colors.pink,
    },
    secondary: {
      main: colors.pink,
      contrastText: colors.pinkishblack,
    }
  },
  spacing: 8,
  typography: typography,
});
lightTheme = responsiveFontSizes(lightTheme);

let darkTheme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: colors.black,
      contrastText: colors.pink,
    },
    secondary: {
      main: colors.pink,
      contrastText: colors.black,
    },
    background: {
      paper: colors.black1,
      default: colors.black2
    }
  },
  spacing: 8,
  typography: typography,
});

const useStyles = makeStyles(theme => ({
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
      color: "#8e8e8e",
      fontSize: "1.5rem"
    },
    '#wysiwygContent > p': {
      fontSize: "1.1rem",
      color: "#8e8e8e",
    },
    '#wysiwygContent > ol': {
      fontSize: "1.1rem",
      color: "#8e8e8e",
    },
    '#wysiwygContent > ul': {
      fontSize: "1.1rem",
      color: "#8e8e8e",
    },
    '#wysiwygContent > blockquote': {
      borderLeft: "3px solid grey",
      paddingLeft: "2em",
      fontStyle: "italic",
      fontWeight: "bold",
      color: "#8e8e8e",
    }
  }
}));

export default function(props) {

  let theme = darkTheme
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
  }

  Object.assign(theme, {
    overrides: overrides
  });

  return (
    <Box>
      <ThemeProvider theme={theme}>
        <CssBaseline/>
        <Box className={classes.root}>
          {props.children}
        </Box>
      </ThemeProvider>
    </Box>
  );
}