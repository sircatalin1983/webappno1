'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('list', {
      url: '/list/:id',
      template: '<list></list>'
    })
}
