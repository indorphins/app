import { createMuiTheme } from '@material-ui/core/styles';

const colors = {
  pink: "#fab4cd",
  pinkishblack: "#262425",
  black: "#191b22",
  black1: "#1a1a1a",
  black2: "#1f1f1f",
  skyblue: "#b3d7ff",
  royalblue: "#011f6b",
  offwhite: "#f5f5f0",
  salmon: "#ff877e",
  cream: "#ffc772",
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

export const light = createMuiTheme({
  palette: {
    type: 'light',
    primary: {
      main: colors.cream,
      contrastText: colors.offwhite,
    },
    secondary: {
      main: colors.salmon,
      contrastText: colors.offwhite,
    },
    header: {
      background: colors.black,
    }
  },
  spacing: 8,
  typography: typography,
});


export const dark = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: colors.salmon,
      contrastText: colors.black,
    },
    secondary: {
      main: colors.cream,
      contrastText: colors.black,
    },
    background: {
      paper: colors.black1,
      default: colors.black2
    },
    header: {
      background: colors.black,
    },
    text: {
      primary: light.palette.grey[300],
      secondary: light.palette.grey[400],
      disabled: light.palette.grey[600],
      hint: light.palette.grey[800],
    }
  },
  spacing: 8,
  typography: typography,
});