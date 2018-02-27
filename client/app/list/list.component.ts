'use strict';
const angular = require('angular');
const uiRouter = require('angular-ui-router');
import routes from './list.routes';

export class ListComponent {
  $http;
  socket;
  
  loadingItems = true;

  myItems = [];
  newItem = '';

  originalItem = null;
  
  statusFilter = "all";

  idList = "";
//

  /*@ngInject*/
  constructor($http, $scope, socket, $state) {
    this.$http = $http;
    this.socket = socket;
    
    this.idList = $state.params['idList'];

    $scope.$on('$destroy', function() {
      socket.unsyncUpdates('item');
    });
  }

  $onInit() {
    var vm = this;

    this.loadingItems = true;

    this.setStatusFilter('all');

    this.$http.get('/api/items/' + this.idList + '/items').then(response => {
      this.myItems = response.data;
      this.socket.syncUpdates('item', this.myItems);
    });
    
    this.loadingItems = false;    
  }

  addItem() {
    if (this.newItem) {
      this.$http.post('/api/items', { title: this.newItem, info: "", idList: this.idList });
      this.newItem = '';
    }
  }

  editItem(item) {
    this.originalItem = item;
  }

  saveItem(item) {
    this.$http.put('/api/items/'+ item._id, { title: item.title} );
    this.originalItem = null;
  }

  deleteItem(item) {
    this.$http.delete('/api/items/' + item._id);
  }

  toggleCompleted(item) {
    var newVal = !item.completed;
    this.$http.put('/api/items/'+ item._id, { completed: newVal} );
    item.completed = newVal;
  }

  clearCompleted() {
    this.myItems.forEach(element => {
      if (element.completed)
        this.toggleCompleted(element);
    });
  }

  setStatusFilter(newStatus){
    this.statusFilter = newStatus === 'all' || newStatus === 'completed' || newStatus === 'active' ? newStatus : 'all';
  }

  filterByStatus (items) {
    var filteredItems = [];
    var i =0;

    for (let entry of this.myItems) {
      if (this.statusFilter === 'all') {
        filteredItems[i++] = entry;
      }
      if (this.statusFilter === 'completed' && entry.completed) {
        filteredItems[i++] = entry;
      }
      if (this.statusFilter === 'active' && !entry.completed) {
        filteredItems[i++] = entry;
      }
    }
    
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
