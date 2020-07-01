import React, { useState } from 'react';
import {
	createCustomer,
	createSubscription,
	cancelSubscription,
	createPaymentIntent,
	createPaymentMethod,
	confirmPayment,
	getStripeUser,
	refundPayment,
	getPaymentMethods,
	deletePaymentMethod,
	getStateCode,
	redirectToSignUp,
	createClassSku,
} from '../api/stripe';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import CardSection from '../components/cardSection';

const SignupView = (props) => {
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [email, setEmail] = useState('');
	const [customerId, setCustomerId] = useState();
	const [subId, setSubId] = useState();
	const [paymentMethod, setPaymentMethod] = useState();
	const stripe = useStripe();
	const elements = useElements();

	const firstNameHandler = (event) => {
		setFirstName(event.target.value);
	};

	const lastNameHandler = (event) => {
		setLastName(event.target.value);
	};

	const emailHandler = (event) => {
		setEmail(event.target.value);
	};

	const formSubmittedHandler = async (event) => {
		event.preventDefault();
		// Create Customer
		createCustomer(email).then((response) => {
			if (response.success) {
				console.log('Success response customer is ', response);
				setCustomerId(response.data.customerId);
			}
		});
	};

	const createPMthodClient = async (cardElement) => {
		return stripe
			.createPaymentMethod({
				type: 'card',
				card: cardElement,
			})
			.then((result) => {
				if (result.error) {
					throw result.error;
				} else {
					// TODO pass payment method id to backend
					return result;
				}
			})
			.catch((error) => {
				console.log('Error creating subsciption w/ payment method : ', error);
			});
	};

	const fetchPaymentMethods = () => {
		getPaymentMethods()
			.then((response) => {
				console.log('Got my payment methods ', response);
			})
			.catch((error) => {
				console.log('fetch payment method error ', error);
			});
	};

	const deletePMethod = () => {
		deletePaymentMethod(paymentMethod)
			.then((response) => {
				console.log('delete payment method response ', response);
			})
			.catch((error) => {
				console.log('delete payment method error : ', error);
			});
	};

	const setupPaymentIntent = async (event) => {
		const instructorId = '734ded20-ab58-11ea-b0e6-4100bfcd763c';
		const paymentMethodId = 'pm_1GsbMsG2VM6YY0SV2GqwOajO';
		const classId = '1231234';

		createPaymentIntent(instructorId, paymentMethodId, classId)
			.then((result) => {
				console.log('Setup up payment intent result ', result);
				stripe.confirmCardPayment(result.data.client_secret).then((result) => {
					if (result.error) {
						// Show error to your customer (e.g., insufficient funds)
						console.log(result.error.message);
					} else {
						// The payment has been processed!
						if (result.paymentIntent.status === 'succeeded') {
							confirmPayment(classId).then((result) => {
								console.log('confirmed payment - add to class ', result);
							});
						}
					}
				});
			})
			.catch((error) => {
				console.log('setup payment intent error ', error);
			});
	};

	// Creates payment method and subsciption
	const paymentMethodHandler = async (event) => {
		const cardElement = elements.getElement(CardElement);
		createPMthodClient(cardElement)
			.then((result) => {
				console.log('Result from create p method client - ', result);
				createPaymentMethod(result.paymentMethod.id);
			})
			.then((result) => {
				console.log('Backend create p method result ', result);
				setPaymentMethod(result.data.id);
			})
			.catch((error) => {
				console.log('Error creating payment method ', error);
			});
	};

	const getStripeUserHandler = () => {
		getStripeUser()
			.then((response) => {
				console.log('Get user response is ', response);
			})
			.catch((err) => {
				console.log('failed to get user');
			});
	};

	const redirectToSignUpHandler = () => {
		redirectToSignUp()
			.then((response) => {
				if (response.success) {
					window.location.href = response.redirectUrl;
				}
			})
			.catch((err) => {
				console.log('Error redirecting ', err);
			});
	};

	const createSubHandler = () => {
		const classId = '123';
		createSubscription(classId)
			.then((result) => {
				console.log('Got result for create subscription: ', result);
			})
			.catch((err) => {
				console.log('Error creating subscription : ', err);
			});
	};

	return (
		<div id='signup-view'>
			<div
				id='signup-form-container'
				className=' max-w-xl mx-auto border-2 border-gray-400 rounded p-6 shadow'
			>
				<form
					id='signup-form'
					onSubmit={formSubmittedHandler}
					// className='inline-block'
				>
					<div id='email-container'>
						<div>Email:</div>
						<input
							type='text'
							placeholder='example@email.com'
							onChange={emailHandler}
							className='w-full h-7 p-3 border rounded color-gray-300 shadow'
						/>
					</div>
					<br />
					<div className='text-center'>
						<input
							type='submit'
							value='Create Account'
							className='bg-blue-500 p-2 px-5 rounded text-white shadow'
						/>
					</div>
				</form>
				<br />
				<div className=' mx-auto border-2 border-gray-400 rounded p-6 shadow'>
					<div>Sign Up for Weekly class for $420</div>
					{customerId ? <div>Customer ID: {customerId}</div> : null}
					{subId ? <div>Subscription ID: {subId}</div> : null}

					<CardSection />
					<button
						onClick={paymentMethodHandler}
						disabled={!stripe}
						className='border-gray-400 rounded border-2 p-2'
					>
						Create Payment Method
					</button>
					<button
						onClick={setupPaymentIntent}
						disabled={!stripe}
						className='border-gray-400 rounded border-2 p-2'
					>
						Create Payment
					</button>
					<br />
					<button
						onClick={fetchPaymentMethods}
						disabled={!stripe}
						className='border-gray-400 rounded border-2 p-2'
					>
						Get my Payment Methods
					</button>
					<button
						onClick={deletePMethod}
						disabled={!stripe}
						className='border-gray-400 rounded border-2 p-2'
					>
						Delete my payment method
					</button>
					<br />
					<button
						onClick={getStripeUserHandler}
						disabled={!stripe}
						className='border-gray-400 rounded border-2 p-2'
					>
						Get my stripe data
					</button>
					<button
						onClick={redirectToSignUpHandler}
						disabled={!stripe}
						className='border-gray-400 rounded border-2 p-2'
					>
						Create Instructor Account
					</button>
					<br />
					<button
						onClick={createClassSku}
						disabled={!stripe}
						className='border-gray-400 rounded border-2 p-2'
					>
						Create Class SKU
					</button>
					<button
						onClick={createSubHandler}
						disabled={!stripe}
						className='border-gray-400 rounded border-2 p-2'
					>
						Create Subscription
					</button>
				</div>
			</div>
		</div>
	);
};

export default SignupView;
