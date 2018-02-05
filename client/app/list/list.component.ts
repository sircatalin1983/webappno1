'use strict';
const angular = require('angular');
const uiRouter = require('angular-ui-router');
import routes from './list.routes';

export class ListComponent {
  $http;
  socket;
  
  myItems = [];
  newItem = '';

  /*@ngInject*/
  constructor($http, $scope, socket) {
    this.$http = $http;
    this.socket = socket;

    $scope.$on('$destroy', function() {
      socket.unsyncUpdates('item');
    });
  }

  $onInit() {
    var vm = this;

    this.$http.get('/api/items').then(response => {
      this.myItems = response.data;
      this.socket.syncUpdates('item', this.myItems);
    });
  }

  addItem() {
    if (this.newItem) {
      this.$http.post('/api/items', { name: this.newItem, info: "fff"});
      this.newItem = '';
    }
  }

  editItem() {
  }

  deleteItem(list) {
    this.$http.delete('/api/items/' + list._id);
  }

  toogleCompleted() {

  }
}

export default angular.module('webappno1App.list', [uiRouter])
  .config(routes)
  .component('list', {
    template: require('./list.html'),
    controller: ListComponent
  })
  .name;
