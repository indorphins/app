const dev = {
  REACT_APP_AWS_SERVER_DOMAIN='http://indorphins-be-lb-661510815.us-east-1.elb.amazonaws.com'
}

const prod = {
  REACT_APP_AWS_SERVER_DOMAIN='https://indorphins-be-lb-661510815.us-east-1.elb.amazonaws.com'
}

const config = process.env.NODE_ENV === 'production'
  ? prod
  : dev;

export default {
  // Add common config values here
  ...config
};