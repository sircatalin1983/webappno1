'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './georgi.routes';

export class GeorgiComponent {
  /*@ngInject*/
  constructor() {
    this.message = 'Hello';
  }
}

export default angular.module('webappno1App.georgi', [uiRouter])
  .config(routes)
  .component('georgi', {
    template: require('./georgi.html'),
    controller: GeorgiComponent,
    controllerAs: 'georgiCtrl'
  })
  .name;
