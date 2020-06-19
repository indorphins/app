import { loadStripe } from '@stripe/stripe-js';
import callAPI from './helper';
const TEST_CLIENT_ID = 'ca_H6FI1hBlXQUv8wAMFBvSxGTNZUy7RiT1'; // Replace with final client id once

// Makes call to backend to get redirect url to instructor stripe account sign up page
export async function redirectToSignUp() {
	const url =
		process.env.REACT_APP_AWS_SERVER_DOMAIN + '/stripe/accountRedirect';
	const options = {
		method: 'post',
	};
	return callAPI(url, options, true);
}

/**
 * Creates a Stripe payment intent for the logged in user's stripe account
 * To pay the instructor in order to book and join the class. Takes in the
 * Instructor ID, class ID and payment method ID.
 * Returns the payment intents' client secret needed to confirm payment.
 * @param {String} instructorId
 * @param {String} paymentMethod
 * @param {String} classId
 */
export async function createPaymentIntent(
	instructorId,
	paymentMethodId,
	classId
) {
	const url = process.env.REACT_APP_AWS_SERVER_DOMAIN + `/stripe/payment`;
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			instructor_id: instructorId,
			payment_method: paymentMethodId,
			class_id: classId,
		}),
	};
	return callAPI(url, options, true);
}

/**
 * Finds the logged in user's Transaction for input classId.
 * Confirms transaction was a success and updates its status to reflect.
 * Note: stripe JS SDK is used before this to confirm the payment on their end.
 * Returns payment intent's client secret upon success.
 * @param {String} classId
 */
export async function confirmPayment(classId) {
	const url =
		process.env.REACT_APP_AWS_SERVER_DOMAIN + `/stripe/confirmPayment`;
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			class_id: classId,
		}),
	};

	return callAPI(url, options, true);
}

/**
 * Refunds the logged in user's payment for input class ID if
 * the user has already paid for the class.
 * Returns the stripe payment's client secret upon success.
 * @param {String} classId
 */
export async function refundPayment(classId) {
	const url = process.env.REACT_APP_AWS_SERVER_DOMAIN + `/stripe/refund`;
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			class_id: classId,
		}),
	};

	return callAPI(url, option, true);
}

/**
 * Creates a Stripe customer with the logged in user and input email
 * Returns the Stripe User upon creation in db
 * @param {String} email
 */
export async function createCustomer(email) {
	const url = process.env.REACT_APP_AWS_SERVER_DOMAIN + '/stripe/customer';
	const options = {
		method: 'post',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			email: email,
		}),
	};

	return callAPI(url, options, true);
}

/**
 * Creates a subscription for the user into the classId
 * @param {String} classId
 */
export async function createSubscription(classId) {
	const url = process.env.REACT_APP_AWS_SERVER_DOMAIN + '/stripe/subscription';
	const options = {
		method: 'post',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			class_id: classId,
		}),
	};
	return callAPI(url, options, true);
}

/**
 * Cancels a subscription tied to the logged in user - work in progress
 * @param {String} subscriptionId
 */
export async function cancelSubscription(classId) {
	const url = process.env.REACT_APP_AWS_SERVER_DOMAIN + '/stripe/subscription';
	const options = {
		method: 'delete',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			class_id: classId,
		}),
	};
	return callAPI(url, options, true);
}

/**
 * Attaches a stripe payment method ID and details to the user
 * ID is created with Stripe Card element and JS SDK on front end.
 * Returns the new payment method record.
 * @param {String} paymentMethodId
 */
export async function createPaymentMethod(paymentMethodId) {
	const url = process.env.REACT_APP_AWS_SERVER_DOMAIN + '/stripe/paymentMethod';
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			payment_method_id: paymentMethodId,
		}),
	};

	return callAPI(url, options, true);
}

/**
 * Fetches all payment methods + details for logged in user
 * Returns an array of all payment method IDs
 */
export async function getPaymentMethods() {
	const url =
		process.env.REACT_APP_AWS_SERVER_DOMAIN + '/stripe/paymentMethods';
	const options = {
		method: 'get',
		headers: {
			'Content-Type': 'application/json',
		},
	};

	return callAPI(url, options, true);
}

/**
 * Removes the payment method associated with input ID from the logged in user
 * Returns success message
 * @param {String} paymentMethodId
 */
export async function deletePaymentMethod(paymentMethodId) {
	const url = process.env.REACT_APP_AWS_SERVER_DOMAIN + '/stripe/paymentMethod';
	const options = {
		method: 'delete',
		headers: {
			'Content-Type': 'application/json',
			authorization: `Bearer ${bearerToken}`,
		},
		body: JSON.stringify({
			payment_method_id: paymentMethodId,
		}),
	};

	return callAPI(url, options, true);
}

/**
 * Fetches the stripe user associated with auth token
 */
export async function getStripeUser() {
	const url = process.env.REACT_APP_AWS_SERVER_DOMAIN + '/stripe/customer';
	const options = {
		method: 'get',
		headers: {
			'Content-Type': 'application/json',
		},
	};

	return callAPI(url, options, true);
}

/**
 * Creates a stripe sku with two prices (one-time/recurring) for classId
 * @param {String} classId
 */
export async function createClassSku(classId) {
	const url = process.env.REACT_APP_AWS_SERVER_DOMAIN + '/stripe/classSku';
	const options = {
		method: 'post',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			class_id: classId,
		}),
	};

	return callAPI(url, options, true);
}
