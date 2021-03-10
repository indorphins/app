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
  white: "#ffffff",
  darkGrey: '#757575',
  borderGrey: '#D7D7D7',
  footerGrey: '#111',
  lightGrey: '#F2F2F4',
  pureBlack: '#000'
}

const lightPalette = {
  type: 'light',
  common: {
    white: colors.offwhite,
    black: colors.black,
    background: colors.white,
    border: colors.borderGrey,
    footerGrey: colors.footerGrey,
    backgroundGrey: colors.lightGrey
  },
  primary: {
    main: colors.black,
    contrastText: colors.offwhite,
  },
  secondary: {
    main: colors.white,
    contrastText: colors.black2,
  },
  primaryColor: {
    main: colors.cream,
    contrastText: colors.offwhite
  },
  secondaryColor: {
    main: colors.salmon,
    contrastText: colors.offwhite
  },
  textField: {
    main: colors.offwhite,
    contrastText: colors.black
  },
  header: {
    background: colors.white,
  },
  footer: {
    main: colors.footerGrey,
    secondary: colors.pureBlack,
    text: colors.white,
    contrastText: colors.darkGrey
  },
  text: {
    primary: '#212121',
    secondary: '#212121',
    disabled: '#e0e0e0',
    hint: '#eeeeee',
    salmon: colors.salmon,
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
  fontFamily: '"Lato", sans-serif',
  h1: {
    fontSize: '2.5rem',
    fontWeight: 900,
    color: lightPalette.grey[900],
  },
  h2: {
    fontSize: '2.2rem',
    fontWeight: 900,
    color: lightPalette.grey[900],
  },
  h3: {
    fontSize: '1.8rem',
    fontWeight: 500,
    color: lightPalette.grey[900],
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 900,
    color: lightPalette.grey[900],
  },
  h5: {
    fontSize: '1.3rem',
    fontWeight: 300,
    color: lightPalette.grey[900],
  },
  h6: {
    fontSize: '1.1rem',
    fontStyle: 'italic',
    fontWeight: 100,
    color: lightPalette.grey[900],
  },
  body1: {
    fontWeight: 300,
  },
  subtitle2: {
    fontStyle: "italic",
  }
};

const darkPalette = {
  type: 'dark',
  common: {
    white: colors.offwhite,
    black: colors.black,
    background: colors.black2,
    border: colors.borderGrey,
    footerGrey: colors.footerGrey,
    backgroundGrey: colors.lightGrey
  },
  primary: {
    main: colors.offwhite,
    contrastText: colors.black2
  },
  secondary: {
    main: colors.black,
    contrastText: colors.offwhite,
  },
  primaryColor: {
    main: colors.cream,
    contrastText: colors.white
  },
  secondaryColor: {
    main: colors.salmon,
    contrastText: colors.white
  },
  textField: {
    main: colors.offwhite,
    contrastText: colors.black
  },
  background: {
    paper: colors.black1,
    default: colors.black2
  },
  header: {
    background: colors.white,
  },
  footer: {
    main: colors.footerGrey,
    secondary: colors.pureBlack,
    text: colors.white,
    contrastText: colors.darkGrey
  },
  text: {
    primary: '#eeeeee',
    secondary: '#bdbdbd',
    disabled: '#757575',
    hint: '#616161',
    salmon: colors.salmon
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
  },
}; 

const darkTypography = {
  direction: 'ltr',
  fontSize: 16,
  fontFamily: '"Lato", sans-serif',
  h1: {
    fontSize: '2.5rem',
    fontWeight: 900,
    color: darkPalette.grey[700],
  },
  h2: {
    fontSize: '2.2rem',
    fontWeight: 900,
    color: darkPalette.grey[700],
  },
  h3: {
    fontSize: '1.8rem',
    fontWeight: 500,
    color: darkPalette.grey[600],
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 900,
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
  },
  body1: {
    fontWeight: 300,
  },
  subtitle2: {
    fontStyle: "italic",
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