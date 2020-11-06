import Lato900Woff from './lato-v17-latin-900.woff2';
import Lato900TTF from './Lato-Black.ttf';
import Lato700Woff from './lato-v17-latin-700.woff2';
import Lato700TTF from './Lato-Bold.ttf';
import LatoWoff from './lato-v17-latin-regular.woff2';
import LatoTTF from './Lato-Regular.ttf';
import Lato300Woff from './lato-v17-latin-300.woff2';
import Lato300TTF from './Lato-Light.ttf';
import Lato100Woff from './lato-v17-latin-100.woff2';
import Lato100TTF from './Lato-Thin.ttf';

const lato900 = {
  fontFamily: 'Lato',
  fontStyle: 'normal',
  fontDisplay: 'swap',
  fontWeight: 900,
  src: `
    local('Lato900Woff'),
    local('lato-v17-latin-900'),
    url(${Lato900Woff}) format('woff2'),
    url(${Lato900TTF}) format('truetype');
  `,
};

const lato700 = {
  fontFamily: 'Lato',
  fontStyle: 'normal',
  fontDisplay: 'swap',
  fontWeight: 'bold 700',
  src: `
    local('Lato700Woff'),
    local('lato-v17-latin-700'),
    url(${Lato700Woff}) format('woff2'),
    url(${Lato700TTF}) format('truetype');
  `,
};

const latoReg = {
  fontFamily: 'Lato',
  fontStyle: 'normal',
  fontDisplay: 'swap',
  fontWeight: 'normal 500',
  src: `
    local('LatoWoff'),
    local('lato-v17-latin-regular'),
    url(${LatoWoff}) format('woff2'),
    url(${LatoTTF}) format('truetype');
  `,
};

const lato300 = {
  fontFamily: 'Lato',
  fontStyle: 'normal',
  fontDisplay: 'swap',
  fontWeight: 300,
  src: `
    local('Lato300Woff'),
    local('lato-v17-latin-300'),
    url(${Lato300Woff}) format('woff2'),
    url(${Lato300TTF}) format('truetype');
  `,
};


const lato100 = {
  fontFamily: 'Lato',
  fontStyle: 'normal',
  fontDisplay: 'swap',
  fontWeight: 100,
  src: `
    local('Lato100Woff'),
    local('lato-v17-latin-100'),
    url(${Lato100Woff}) format('woff2'),
    url(${Lato100TTF}) format('truetype');
  `,
};


export default function Fonts() {
  return [lato100, lato300, latoReg, lato700, lato900];
}