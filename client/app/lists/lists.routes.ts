import { ListsComponent } from "./lists.component";

'use strict';

export default function ($stateProvider) {
  'ngInject';
  $stateProvider
    .state('lists', {
      url: '/lists',
      template: '<lists></lists>'
    });
}
