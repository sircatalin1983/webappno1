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

  usersOfList = [];

  usersOfSystem: Object[];

  myUserLists;

  newMember;

  loggedUser;

  ownerView = false;
  /*@ngInject*/
  constructor($http, $scope, socket, $state, User, Auth) {
    this.$http = $http;
    this.socket = socket;

    this.loggedUser = Auth.getCurrentUserSync();
    this.idList = $state.params['idList'];

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('item');
      socket.unsyncUpdates('userlist');
    });

    this.usersOfSystem = User.query();
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

      //set the owner view to allow only owner to add/remove members
      this.myUserLists.forEach(element => {
        if (element.role === 'owner' && this.loggedUser._id === element.idUser) {
          this.ownerView = true;
        }
      });

      this.myUserLists.forEach(element => {
        /*merge
        if (element.role === 'owner' && this.loggedUser._id === element.idUser) {
          element.name = this.loggedUser.name;
        }
        //*/
        this.$http.get('/api/users/' + element.idUser + '/user').then(user => {
          element.name = user;
          
        });
        console.log(element._id + ' name: ' + element.name);
      });


      //        console.log('element.idUser: ' + element.idUser);
      /*
      this.$http.get('/api/users/' + element.idUser + '/user').then(response => { 
        console.log('x: ' + response);
      });
      //*/
      /*
              this.usersOfSystem.forEach(userOfSystem => {
                if (element.role === 'owner' && userOfSystem['_id'] === element.idUser) {
                  console.log('xcv1: ' + this.owner);
                  this.owner = userOfSystem;
                }
                if (element.role === 'user' && userOfSystem['_id'] === element.idUser) {
                  console.log('xcv2: ' + this.owner);
                  this.usersOfList[index++] = userOfSystem;
                }
              });
              //*/




      var index = 0;
      this.myUserLists.forEach(element => {
        //        console.log('element.idUser: ' + element.idUser);

               //*/
        /*
                this.usersOfSystem.forEach(userOfSystem => {
                  if (element.role === 'owner' && userOfSystem['_id'] === element.idUser) {
                    console.log('xcv1: ' + this.owner);
                    this.owner = userOfSystem;
                  }
                  if (element.role === 'user' && userOfSystem['_id'] === element.idUser) {
                    console.log('xcv2: ' + this.owner);
                    this.usersOfList[index++] = userOfSystem;
                  }
                });
                //*/
      });

      //console.log('owneeeer1: ' + this.owner);
      //console.log('owneeeerXXD2: ' + this.myUserLists[0].role);
      //console.log('owneeeer3: ' + this.usersOfSystem);
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
    var newUser;
    if (this.newMember) {
      this.usersOfSystem.forEach(user => {
        if (this.newMember.toLowerCase() === user['name'].toLowerCase() || this.newMember.toLowerCase() === user['email'].toLowerCase()) {
          newUser = user;
        }
      });

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

      this.newMember = '';
    }
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
