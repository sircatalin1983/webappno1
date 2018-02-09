'use strict';
const angular = require('angular');
const uiRouter = require('angular-ui-router');
import routes from './list.routes';

export class ListComponent {
  $http;
  socket;
  
  myItems = [];
  newItem = '';

  //used during loading 
  loadingItems = true;

  //used during edit  
  editedItem = null;    //edited item
  originalItem = null;  //original item to restore to after edit
  
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

    this.loadingItems = false;
  }

  addItem() {
    if (this.newItem) {
      this.$http.post('/api/items', { title: this.newItem, info: "" });
      this.newItem = '';
    }
  }

  editItem(item) {
    this.editedItem = item;
    this.originalItem = angular.extend({}, item);
  }

  undoItem(item) {
    this.editedItem = null;
    item = this.originalItem;
  }
  
  saveItem(item, event) {
    
  }

  deleteItem(item) {
    this.$http.delete('/api/items/' + item._id);
  }

  toggleCompleted(item) {
    var newVal = !item.completed;
    this.$http.put('/api/items/'+ item._id, { completed: newVal} );
    item.completed = newVal;
  }
}

export default angular.module('webappno1App.list', [uiRouter])
  .config(routes)
  .component('list', {
    template: require('./list.html'),
    controller: ListComponent
  })
  .name;
