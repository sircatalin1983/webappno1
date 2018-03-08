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

  myUserLists;

  newMember;

  loggedUser;

  ownerView = false;
  /*@ngInject*/
  constructor($http, $scope, socket, $state, Auth) {
    this.$http = $http;
    this.socket = socket;

    this.loggedUser = Auth.getCurrentUserSync();
    this.idList = $state.params['idList'];

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('item');
      socket.unsyncUpdates('userlist');
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

    this.$http.get('/api/userlists/' + this.idList + '/users').then(response => {
      this.myUserLists = response.data;
      this.socket.syncUpdates('userlist', this.myUserLists);

      this.myUserLists.forEach(element => {
        if (element.role === 'owner' && this.loggedUser._id === element.idUser) {
          this.ownerView = true;
        }

        this.$http.get('/api/users/' + element.idUser).then(userdata => {
          var user = userdata.data;
          element.name = user.name;
          element.role = user.role;
        });
      });

    });

    this.loadingItems = false;
  }

  addItem() {
    if (this.newItem) {
      this.$http.post('/api/items', { title: this.newItem, info: "", idList: this.idList });
      this.newItem = '';
    }
  }

  addMember() {
    console.log('start')

    var newUser;
    if (this.newMember) {

      console.log('start');
      /*
            this.$http.get('/api/users/' + this.newMember + '/userbyname').then(userdata => {
              var user = userdata.data;
              //console.log('user1: ' + user.name);
      
              for (var x in user) {
                //console.log('user1: ' + x);
              }
      
            });
      */

      this.$http.get('/api/users/' + this.loggedUser._id).then(userdata => {
        var user = userdata.data;
        console.log('fdas ' + user.name);
      });


      this.$http.get('/api/users/' + this.newMember + '/userbykeyword').then(userdata => {
        var user = userdata.data;
        console.log('user2: ' + user);
        for (var x in userdata.data) {
          console.log('userdata: ' + x);
          console.log('userdata: ' + userdata.data[x]);
        }
        /*
                console.log('userdatx: ' + userdata.data);
                console.log('userdatx: ' + userdata.status);
                console.log('userdatx: ' + userdata.headers);
                console.log('userdatx: ' + userdata.config);
                console.log('userdatx: ' + userdata.statusText);
                console.log('userdatx: ' + userdata.xhrStatus);
        //*/
      });
    }

    /*
          this.usersOfSystem.forEach(user => {
            if (this.newMember.toLowerCase() === user['name'].toLowerCase() || this.newMember.toLowerCase() === user['email'].toLowerCase()) {
              newUser = user;
            }
          });
    */
    /*
          if (newUser) {
            this.myUserLists.forEach(userList => {
              if (userList.idUser == newUser._id) {
                alert('User already in the list!');
              } else {
                this.$http.post('/api/userlists', { idUser: newUser._id, idList: this.idList, role: 'user' });
              }
            });
          } else {
            alert('User do not exists!');
          }
    */
    this.newMember = '';
  }

  editItem(item) {
    this.originalItem = item;
  }

  saveItem(item) {
    this.$http.put('/api/items/' + item._id, { title: item.title });
    this.originalItem = null;
  }

  deleteItem(item) {
    this.$http.delete('/api/items/' + item._id);
  }

  toggleCompleted(item) {
    var newVal = !item.completed;
    this.$http.put('/api/items/' + item._id, { completed: newVal });
    item.completed = newVal;
  }

  clearCompleted() {
    this.myItems.forEach(element => {
      if (element.completed)
        this.toggleCompleted(element);
    });
  }

  setStatusFilter(newStatus) {
    this.statusFilter = newStatus === 'all' || newStatus === 'completed' || newStatus === 'active' ? newStatus : 'all';
  }

  filterByStatus(items) {
    var filteredItems = [];
    var i = 0;

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
