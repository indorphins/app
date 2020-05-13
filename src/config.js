const dev = {
	REACT_APP_AWS_SERVER_DOMAIN:
		'http://indorphins-be-lb-661510815.us-east-1.elb.amazonaws.com',
};

const prod = {
	REACT_APP_AWS_SERVER_DOMAIN:
		'https://indorphins-be-lb-661510815.us-east-1.elb.amazonaws.com',
};

export const firebaseConfig = {
	apiKey: 'AIzaSyCloQJaObNRC25LtWvaO9jXYOfpCzlj2jM',
	authDomain: 'groupfit-auth.firebaseapp.com',
	databaseURL: 'https://groupfit-auth.firebaseio.com',
	projectId: 'groupfit-auth',
	storageBucket: 'groupfit-auth.appspot.com',
	messagingSenderId: '657572658567',
	appId: '1:657572658567:web:9a1d85d6b627dce06da722',
};

const config = process.env.NODE_ENV === 'production' ? prod : dev;

export default {
	...config,
};
