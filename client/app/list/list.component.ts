'use strict';
const angular = require('angular');
const uiRouter = require('angular-ui-router');
import routes from './list.routes';

export class ListComponent {
  $http;
  socket;
  
  myItems = [];
  newItem = '';

  loadingItems = true;

  originalItem = null;
  
  statusFilter = false;

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

    this.loadingItems = true;
    this.setStatusFilter('all');

    this.$http.get('/api/items').then(response => {
      this.myItems = response.data;
      this.socket.syncUpdates('item', this.myItems);
    });

    this.loadingItems = false;    
  }

  addItem() {
    if (this.newItem) {
      this.$http.post('/api/items', { title: this.newItem, info: "" });
      this.newItem = '';
    }
  }

  editItem(item) {
    this.originalItem = item;
  }

  saveItem(item) {
    alert(item.title);
  }

  deleteItem(item) {
    this.$http.delete('/api/items/' + item._id);
  }

  onBlur (item) {
    this.saveItem(item);
    this.originalItem = null;
  }

  toggleCompleted(item) {
    var newVal = !item.completed;
    this.$http.put('/api/items/'+ item._id, { completed: newVal} );
    item.completed = newVal;
  }

  setStatusFilter(newStatus){
    this.statusFilter = newStatus === 'all' || newStatus === 'completed' || newStatus === 'active' ? newStatus : 'all';
  }

  filterByStatus (items) {
    var filteredItems = this.myItems.filter(function(item){
      if (this.statusFilter === 'all') {
        return true;
      }
      if (this.statusFilter === 'completed' && item.completed) {
        return true;
      }
      if (this.statusFilter === 'active' && !item.completed) {
        return true;
      }
    });
    return filteredItems;
  };
}

export default angular.module('webappno1App.list', [uiRouter])
  .config(routes)
  .component('list', {
    template: require('./list.html'),
    controller: ListComponent
  })
  .name;
