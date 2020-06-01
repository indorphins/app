import React, { useEffect } from 'react';
import { BrowserRouter} from 'react-router-dom';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider, createMuiTheme, responsiveFontSizes, makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import log from './log';
import Firebase from './Firebase';
import Routes from './routes/index';
import * as User from './api/user';
import { store, actions } from './store';

const getUserSelector = createSelector([state => state.user.data], (user) => {
  return user;
});

export default function App() {

	const currentUser = useSelector(state => getUserSelector(state));

	const colors = {
		pink: "#fc0373",
		black: "#000000",
	}

	let mainTheme = createMuiTheme({
		palette: {
			type: 'light',
			primary: {
				main: colors.black,
				contrastText: colors.pink,
			},
			secondary: {
				main: colors.pink,
				contrastText: colors.black,
			},
			background: {
				default: colors.black,
			}
		},
		spacing: 8,
		typography: {
			direction: 'ltr',
			fontSize: 14,
			h1: {
				fontSize: '2.2rem',
				fontWeight: 900,
			},
			h2: {
				fontSize: '1.6rem',
				fontWeight: 500,
			},
			h3: {
			  fontSize: '1.3rem',
			}
		},
	});

	mainTheme = responsiveFontSizes(mainTheme);

	Object.assign(mainTheme, {
		overrides: {
			MuiTextField: {
				root: {
					marginTop: mainTheme.spacing(2),
				}
			},
			MuiLink: {
				root: {
					marginTop: mainTheme.spacing(2),
					cursor: 'pointer',
				}
			},
			MuiButton: {
				root: {
					fontWeight: "bold",
				}
			}
		}
	});

	const useStyles = makeStyles(mainTheme => ({
		'@global': {
			html: {
				overflow: 'hidden',
				background: mainTheme.background,
				height: '100%',
			},
			body: {
				overflow: 'auto',
				height: '100%',
			}
		}
	}));

  async function listener(firebaseUserData) {

    // user logged out or session expired
    if (!firebaseUserData) {
			log.debug("AUTH:: firebase user null");
			if (currentUser.id) {
				await store.dispatch(actions.user.clear());
			}
      return;
		}

		log.debug("AUTH:: got firebase user data", firebaseUserData);
		let user;

    // try to fetch indorphins user data
    try {
      user = await User.get();
    } catch(err) {
      return log.error("AUTH:: Call User.get", err);
    }

    if (user && user.data) {
      log.debug("AUTH:: got indorphins user data", user.data);

      try {
        return await store.dispatch(actions.user.set(user.data));
      } catch (err) {
        return log.error("AUTH:: save user to store", err);
      }
    }

    // TODO: if we don't have a user then we should redirect to the signup flow to get a username
    // before creating the user but for now we will just auto populate the username
    let firstname = firebaseUserData.displayName.split(" ")[0];
    let lastname = firebaseUserData.displayName.split(" ")[1];

    try {
      user = await User.create(
        firebaseUserData.displayName, 
        firstname, 
        lastname,
        firebaseUserData.email,
        firebaseUserData.phoneNumber
      )
    } catch(err) {
      return log.warn("AUTH:: error creating user account from firebase token", err);
    }

    if (!user.data) {
      return log.warn("AUTH:: user creation failed");
    }

    log.debug("AUTH:: user automatically created from firebase login", user.data);

    try {
      await store.dispatch(actions.user.set(user.data));
    } catch (err) {
      return log.error("AUTH:: save user to store", err);
    }
	}

	useEffect(() => {
		Firebase.clearListeners();
		Firebase.addListener(listener);
	});
	
	const classes = useStyles();

  return (
		<Grid>
			<CssBaseline/>
			<ThemeProvider theme={mainTheme}>
				<Grid className={classes.root}>
					<BrowserRouter>
						<Routes />
					</BrowserRouter>
				</Grid>
			</ThemeProvider>
		</Grid>
  );
};
