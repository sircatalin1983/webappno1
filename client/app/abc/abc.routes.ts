'use strict';

export default function routes($stateProvider) {
  'ngInject';
  $stateProvider
    .state('abc', {
      url: '/abc',
      template: '<abc></abc>'
    });
}
