import config from '../config';
import Firebase from '../Firebase';
import callAPI from './helper';
import log from '../log';

const urlBase = config.host;

export async function getAccountLinkURL(url) {
  let token;

  try {
    token = await Firebase.getToken();
  } catch(err) {
    log.error("AUTH:: error fetching firebase token", err);
    return null;
  }

  return urlBase + '/user/account?callbackURL=' + encodeURIComponent(window.location.origin + url) + '&token=' + token;
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
  classId,
  recurring
) {
  const url = urlBase + `payment`;
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      instructor_id: instructorId,
      payment_method: paymentMethodId,
      class_id: classId,
      recurring: recurring
    }),
  };
  return callAPI(url, options, true);
}

/**
 * Finds the logged in user's Transaction for input paymentId.
 * Confirms transaction was a success and updates its status to reflect.
 * Note: stripe JS SDK is used before this to confirm the payment on their end.
 * Returns payment intent's client secret upon success.
 * @param {String} paymentId
 */
export async function confirmPayment(paymentId) {
  const url = urlBase + `confirmPayment`;
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      payment_id: paymentId,
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
  const url = urlBase + `refund`;
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
 * Creates a subscription for the user into the classId
 * @param {String} classId
 */
export async function createSubscription(classId) {
  const url = urlBase + '/class/' + classId + '/subscription';
  const options = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    }
  };
  return callAPI(url, options, true);
}

/**
 * Cancels a subscription tied to the logged in user - work in progress
 * @param {String} subscriptionId
 */
export async function cancelSubscription(classId) {
  const url = urlBase + '/class/' + classId + '/subscription';
  const options = {
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  return callAPI(url, options, true);
}

/**
 * Attaches a stripe payment method ID and details to the user
 * ID is created with Stripe Card element and JS SDK on front end.
 * Returns the new payment method record.
 * @param {String} paymentMethodId
 */
export async function addPaymentMethod(data) {
  const url = urlBase + '/user/paymentmethod/';
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };

  return callAPI(url, options, true);
}

/**
 * Fetches all payment methods + details for logged in user
 * Returns an array of all payment method IDs
 */
export async function getPaymentMethods() {
  const url = urlBase + '/user/paymentmethod/';
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
  const url = urlBase + '/user/paymentmethod/' + paymentMethodId;
  const options = {
    method: 'delete',
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
 * Returns the first default payment method in an array of payment methods
 * @param {Array} paymentMethods 
 */
export function getDefaultPaymentMethod(paymentMethods) {
  let paymentMethod = null;
  paymentMethods.forEach(pMethod => {
    if (pMethod.default) {
      paymentMethod = pMethod;
    }
  })
  return paymentMethod;
}