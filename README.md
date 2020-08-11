# Indorphins App

[![Indorphins](https://circleci.com/gh/indorphins/app.svg?style=shield&circle-token=0247954f6bd2949f393c5e61054a6d4661cde2f7)](https://app.circleci.com/pipelines/github/indorphins/app)


React based video chat application

## Setup

Tested and built against Node v14.1.

```
npm i
npm start
```

Runs the app in the development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Produciton Build

Site depends on application config being deployed at the site root as `config.js`.

```
npm i
npm i -g webpack webpack-cli
webpack --config webpack.config.js
```

## CICD

Builds deploy automatically to develop and production environments through CircleCI. All releases require a tagged version and pull request to either the develop or master branch depending on the target environment.