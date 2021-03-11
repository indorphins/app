import config from '../config';

const baseUrl = config.homepage_url; 

const paths = {
  home: baseUrl,
  faq: baseUrl + '/faq',
  blog: baseUrl + '/blog',
  contact: baseUrl + '/contact'
};

let params = Object.assign({}, paths);

export default params;