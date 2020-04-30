import React from 'react';
import { createUseStyles } from 'react-jss';
import userBgImg from '../assets/pipPlaceholder.png';

// Create your Styles. Remember, since React-JSS uses the default preset,
// most plugins are available without further configuration needed.
const useStyles = createUseStyles({
	gridStyle: {
		display: 'grid',
		gridTemplateColumns: '3fr 1fr',
		height: '98vh',
	},

	callContainerStyle: {
		margin: '0',
		position: 'absolute',
		top: '50%',
		msTransform: 'translateY(-50%)',
		transform: 'translateY(-50%)',
		backgroundColor: 'black',
		width: 'calc(100vw - 60vh)',
		height: '100vh',
		display: 'flex',
		textAlign: 'center',
		alignItems: 'center',
	},

	pipStyle: {
		height: '33vh',
		width: '59vh',
	},

	pipLabelStyle: {
		position: 'absolute',
		fontFamily: 'Avenir Next',
		bottom: '15px',
		textAlign: 'center',
		height: '40px',
		width: '100%',
		width: '100%',
		fontSize: '40px',
		color: 'white',
	},

	labelContainerStyle: {
		height: 'inherit',
		width: '100%',
		position: 'absolute',
		opacity: '1',
	},

	pipVidStyle: {
		width: '100%',
		height: '100%',
		background: `transparent url(${userBgImg}) no-repeat 0 0`,
		webkitBackgroundSize: 'cover',
		mozBackgroundSize: 'cover',
		oBackgroundSize: 'cover',
		backgroundSize: 'cover',
	},

	logoStyle: {
		position: 'absolute',
		top: '0',
		width: '45px',
		marginLeft: '50px',
		marginTop: '50px',
	},
});

export default useStyles;
