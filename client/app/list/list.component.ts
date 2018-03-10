'use strict';
const angular = require('angular');
const uiRouter = require('angular-ui-router');
import routes from './list.routes';

export class ListComponent {
  $http;
  $document;

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
  constructor($http, $scope, socket, $state, Auth, $document) {
    this.$http = $http;
    this.socket = socket;

    this.$document = $document;

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

      this.myUserLists.forEach(element => {
        if (element.role === 'owner' && this.loggedUser._id === element.idUser) {
          this.ownerView = true;
        }

        this.$http.get('/api/users/' + element.idUser).then(userdata => {
          var user = userdata.data;
          element.name = user.name;
        });
      });

      this.socket.syncUpdates('userlist', this.myUserLists);
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
    var alreadyInList = false;

    if (this.newMember) {
      this.$http.get('/api/users/' + this.newMember + '/userbykeyword').then(userdata => {
        var user = userdata.data;
        if (user) {
          newUser = user;        

          this.myUserLists.forEach(userList => {
            if (userList.idUser == newUser._id) {
              alreadyInList = true;
            }
          });  

          if (alreadyInList) {
            alert('User already in the list!');
          } else {
            this.$http.post('/api/userlists', { idUser: newUser._id, idList: this.idList, role: 'user' }).then(userlist => {
              this.myUserLists.forEach(element => {
                if (element.idUser === newUser._id) {
                  element.name = newUser.name;
                }
              });
            });
          }
        } else {
          alert('User doesn\'t exists!');
        }          
      });
    }
   
    this.newMember = '';
  }

  deleteMember(userList){
    var newArray = [];
    var index = 0;

    this.myUserLists.forEach(element => {
      if (element.idUser != userList.idUser) {
        newArray[index++] = element;
      }
    });
    this.myUserLists = newArray;

    this.$http.delete('/api/userlists/' + userList.idUser);
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

  filterByRole (item, role) {
    if (item.role === role ) return true;
    return false;
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
