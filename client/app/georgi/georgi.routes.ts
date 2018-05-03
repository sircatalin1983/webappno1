'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('georgi', {
      url: '/georgi',
      template: '<georgi></georgi>'
    });
}
