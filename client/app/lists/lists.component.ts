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
  myUserLists = [];

  Auth;
  loggedUser;

  /*@ngInject*/
  constructor($http, $scope, socket, Auth) {
    this.$http = $http;
    this.socket = socket;

    this.Auth = Auth;
    this.loggedUser = this.Auth.getCurrentUserSync();

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('list');
    });
  }

  $onInit() {
    var vm = this;
    this.$http.get('/api/userlists/' + this.loggedUser._id + '/items').then(response => {
      this.myUserLists = response.data;

      var index = 0;
      this.myLists = new Array(0);

      this.myUserLists.forEach(element => {
        if (element.idList) {
          this.$http.get('/api/lists/' + element.idList)
            .catch(error => {
            })
            .then(response => {
              if (response) {
                var list = response.data;
                this.myLists[index++] = list;
              }
            });
        }
      });
      
      this.socket.syncUpdates('list', this.myLists);
    });
  }

  addList() {
    if (this.newList) {
      this.$http.post('/api/lists', { name: this.newList, info: "" }).then(response => {
        var list = response.data;
        this.$http.post('/api/userlists', { idUser: this.loggedUser._id, idList: list._id, role: 'owner' });

        var newUserList = new Object;
        newUserList['idUser'] = this.loggedUser._id;
        newUserList['idList'] = list._id;
        newUserList['role'] = 'owner';
        
        this.myUserLists[this.myUserLists.length] = newUserList;        
      });
      this.newList = '';
    }
  }

  deleteList(list) {
    var newArray = [];
    var index = 0;

    this.myUserLists.forEach(element => {
      if (element.idList != list._id) {
        newArray[index++] = element;
      }
    });
    this.myUserLists = newArray;

    this.$http.delete('/api/userlists/' + list._id + '/items').then(response => {
      this.$http.delete('/api/lists/' + list.idList);
      //delete items from the lists
    });
  }

  filterByRole(itemList, role) {
    var returnValue = false;

    this.myUserLists.forEach(element => {
      if (element.role == role && element.idList === itemList._id && element.idUser === this.loggedUser._id)
        returnValue = true;
    });

    return returnValue;
  }

  openLink (link) {
    alert(link);
  }
}

export default angular.module('webappno1App.lists', [uiRouter])
  .config(routes)
  .component('lists', {
    template: require('./lists.html'),
    controller: ListsComponent
  })
  .name;
