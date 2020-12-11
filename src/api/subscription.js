import config from '../config';
import callAPI from './helper';

const url = config.host + '/subscription';

/**
 * Fetch subscription product data
 */
export async function getProducts() {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }

  const u = url + '/products';

  return callAPI(u, options, true);
}

/**
 * Fetch user's latest subscription data
 */
export async function get() {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }

  return callAPI(url, options, true);
}

/**
 * Cancel user's subscription (issues refund if applicable)
 */
export async function cancel() {
  const options = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  }

  return callAPI(url, options, true);
}

/**
 * Create user's subscription
 */
export async function create(sku, price) {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      sku: sku,
      price: price
    }
  }

  return callAPI(url, options, true);
}