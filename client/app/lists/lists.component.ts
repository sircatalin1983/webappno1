'use strict';
const angular = require('angular');
const uiRouter = require('angular-ui-router');
import routes from './lists.routes';
import { ENOMEM } from 'constants';

export class ListsComponent {
  $http;
  socket;
  
  newList = '';
  myLists = [];
  
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

    console.log(' lists: ' + this.myLists );
    console.log(' numar: ' + this.myLists.length );
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
      var index = 0;
      this.myLists = new Array(0);

      myUserLists.forEach(element => {
        if (element.idList) {
          //this.deleteList(element);
          console.log(' idList: ' + element.idList + ' idUser: ' + element.idUser + ' role: ' + element.role);

          this.$http.get('/api/lists/' + element.idList)
          .catch(error => {
            console.log('errox ' + error);
          })
          .then(response => {
            if(response) {
              var list = response.data;
              this.myLists[index++] = list;

              console.log(' list: ' + list._id);
              //console.log(' lists: ' + this.myLists );
              console.log(' numar: ' + this.myLists.length );
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
    console.log(list._id);

    this.$http.delete('/api/userlists/' + list._id + '/items').then(response => {
      console.log(response);
    })
    .catch(error => {
      var txt = '';
      for (var x in error) {
        console.log('eee: ' + error[x]);
      } 
      
    });

    /*
    this.$http.delete('/api/userlists/' + list._id + '/items').then(function(response){
      console.log(response);
    })
    .catch(error => {
      console.log(error);
    });

    this.$http.delete('/api/lists/' + list._id).then(function(response){
      console.log(response);
    })
    .catch(error => {
      console.log(error);
    });
    */
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
