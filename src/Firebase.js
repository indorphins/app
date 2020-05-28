import * as firebase from "firebase/app";
import "firebase/auth";

import config from './config';

const firebaseConfig = config.firebase;

class Firebase {
	constructor() {
		firebase.initializeApp(firebaseConfig);

		this.app = firebase.app();
		this.auth = firebase.auth(this.app);
		this.listeners = [];
		this.federated = {
			google: new firebase.auth.GoogleAuthProvider(),
		};

		this.federated.google.addScope('profile');
		this.federated.google.addScope('email');

		let self = this;
		this.auth.onAuthStateChanged(function(user) {
			self.listeners.forEach(function(func) {
				func(user);
			});
		});

		this.logout = this.logout.bind(this);
		this.loginWithGoogle = this.loginWithGoogle.bind(this);
	}

	addListener = function(func) {
		this.listeners.push(func);
	};

	clearListener = function() {
		this.listeners = [];
	};

	getUser = function() {
		return this.auth.currentUser;
	};

	logout = function() {
		this.auth.signOut();

		this.listeners.forEach(function(func) {
			func(null);
		});
	};

	sendVerifyEmail = function() {
		let user = this.getUser();
		return user.sendEmailVerification().catch(function(error) {
			throw error;
		});
	};

	verifyEmail = function(code) {
		return this.auth.applyActionCode(code).catch(function(error) {
			throw error;
		});
	};

	sendPasswordResetEmail = function(email) {
		return this.auth.sendPasswordResetEmail(email).catch(function(error) {
			throw error;
		});
	};

	confirmPasswordReset = function(code, password) {
		return this.auth
			.confirmPasswordReset(code, password)
			.catch(function(error) {
				throw error;
			});
	};

	signInWithEmailPassword = function(email, password) {
		return this.auth
			.signInWithEmailAndPassword(email, password)
			.catch(function(error) {
				throw error;
			});
	};

	loginWithGoogle = function() {
		let provider = this.federated.google;
		return firebase.auth().signInWithPopup(provider);
	};

	/**
	 * Returns user's firebase id token
	 */
	getToken = async function() {
		return this.auth.currentUser
			.getIdToken(/* forceRefresh */ true)
			.then(function(idToken) {
				return idToken;
			})
			.catch(function(error) {
				console.log('Firebase - getToken - error: ', error);
				throw error;
			});
	};
}

const singleton = new Firebase();

window.logout = singleton.logout;

export default singleton;
