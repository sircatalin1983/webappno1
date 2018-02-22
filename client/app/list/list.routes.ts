import { ListComponent } from "./list.component";

'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('list', {
      url: '/list/:idList',
      template: '<list></list>'
    })
}
