import { createMuiTheme } from '@material-ui/core/styles';

const colors = {
  black: "#191b22",
  black1: "#1a1a1a",
  black2: "#1f1f1f",
  skyblue: "#b3d7ff",
  royalblue: "#011f6b",
  offwhite: "#f5f5f0",
  salmon: "#ff877e",
  cream: "#ffc772",
}

const lightPalette = {
  type: 'light',
  primary: {
    main: colors.cream,
    contrastText: colors.black,
  },
  secondary: {
    main: colors.salmon,
    contrastText: colors.offwhite,
  },
  header: {
    background: colors.black,
  },
  text: {
    primary: '#616161',
    secondary: '#9e9e9e',
    disabled: '#e0e0e0',
    hint: '#eeeeee',
  },
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  }
}; 

const lightTypography = {
  direction: 'ltr',
  fontSize: 16,
  h1: {
    fontSize: '2.5rem',
    fontWeight: 300,
    color: lightPalette.grey[700],
  },
  h2: {
    fontSize: '2.2rem',
    fontWeight: 300,
    color: lightPalette.grey[700],
  },
  h3: {
    fontSize: '1.8rem',
    fontWeight: 300,
    color: lightPalette.grey[600],
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 300,
    color: lightPalette.grey[800],
  },
  h5: {
    fontSize: '1.3rem',
    fontWeight: 300,
    color: lightPalette.grey[800],
  },
  h6: {
    fontSize: '1.1rem',
    fontStyle: 'italic',
    fontWeight: 100,
    color: lightPalette.grey[900],
  }
};

const darkPalette = {
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
    primary: '#eeeeee',
    secondary: '#bdbdbd',
    disabled: '#757575',
    hint: '#616161',
  },
  grey: {
    900: '#fafafa',
    800: '#f5f5f5',
    700: '#eeeeee',
    600: '#e0e0e0',
    500: '#bdbdbd',
    400: '#9e9e9e',
    300: '#757575',
    200: '#616161',
    100: '#424242',
    50: '#212121',
  }
}; 

const darkTypography = {
  direction: 'ltr',
  fontSize: 16,
  h1: {
    fontSize: '2.5rem',
    fontWeight: 300,
    color: darkPalette.grey[700],
  },
  h2: {
    fontSize: '2.2rem',
    fontWeight: 300,
    color: darkPalette.grey[700],
  },
  h3: {
    fontSize: '1.8rem',
    fontWeight: 300,
    color: darkPalette.grey[600],
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 300,
    color: darkPalette.grey[800],
  },
  h5: {
    fontSize: '1.3rem',
    fontWeight: 300,
    color: darkPalette.grey[800],
  },
  h6: {
    fontSize: '1.1rem',
    fontStyle: 'italic',
    fontWeight: 100,
    color: darkPalette.grey[900],
  }
}

export const light = createMuiTheme({
  palette: lightPalette,
  spacing: 8,
  typography: lightTypography,
});


export const dark = createMuiTheme({
  palette: darkPalette,
  spacing: 8,
  typography: darkTypography,
});