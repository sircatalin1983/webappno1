'use strict';
const angular = require('angular');
const uiRouter = require('angular-ui-router');
import routes from './lists.routes';
import { ENOMEM } from 'constants';

export class ListsComponent {
  $http;
  socket;
  
  myLists = [];
  newList = '';

  Auth;  
  loggedUser;
  
  /*@ngInject*/
  constructor($http, $scope, socket, Auth) {
    this.$http = $http;
    this.socket = socket;
    
    this.Auth = Auth;
    this.loggedUser = this.Auth.getCurrentUserSync();

    $scope.$on('$destroy', function() {
      socket.unsyncUpdates('list');
    });   

    //var user = null;
    //console.log('test' + $scope.getCurrentUser._id);  
    //user = $scope.getCurrentUser().then()(function(result){
      //console.log('test' + user._id);  
      //return result;
   /// });
  }

  $onInit() {
    var vm = this;
/*
    this.$http.get('/api/lists/' + this.loggedUser._id + '/lists').then(response => {
      this.myLists = response.data;
      this.socket.syncUpdates('list', this.myLists);
    });
    */

    this.$http.get('/api/userlists/' + this.loggedUser._id + '/items').then(response => {
      var myUserLists = response.data;

      myUserLists.forEach(element => {
        if (element.idList) {
          //this.deleteList(element);

          this.$http.get('/api/lists/' + element.idList)
          .catch(error => {
            console.log(error);
          })
          .then(response => {
            if(response) {
              var list = response.data;
              this.myLists.push(list);
            }
          });
        }
      });

      this.myLists = response.data;
      this.socket.syncUpdates('list', this.myLists);
    });
  }

  addList() {
    if (this.newList) {
      this.$http.post('/api/lists', { name: this.newList, info: "" }).then(response => {
        var list = response.data;
        this.$http.post('/api/userlists', { idUser: this.loggedUser._id, idList: list._id, role: 'owner' });
      });
      this.newList = '';
    }
  }

  deleteList(list) {
    this.$http.delete('/api/lists/' + list._id).then(function(response){
      console.log(response);
    })
    .catch(error => {
      console.log(error);
    });

    this.$http.delete('/api/userlists/' + list._id + '/items').then(function(response){
      console.log(response);
    })
    .catch(error => {
      console.log(error);
    });
  }

  filterByRole (item, role) {
    return role === item.role ? true : true;
  }
}

export default angular.module('webappno1App.lists', [uiRouter])
  .config(routes)
  .component('lists', {
    template: require('./lists.html'),
    controller: ListsComponent
  })
  .name;
