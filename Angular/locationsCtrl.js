(function() {
  'use strict';

  angular
    .module('webApp').controller('LocationsCtrl', locations);

  /** @ngInject */
  function locations($scope, ngDialog, locations, NgMap, Api, UserService) {
    var vm = this;
    vm.locations = locations.result;
    vm.stateList = ['Alabama','Alaska','American Samoa','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','District of Columbia','Federated States of Micronesia','Florida','Georgia','Guam','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Marshall Islands','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Northern Mariana Islands','Ohio','Oklahoma','Oregon','Palau','Pennsylvania','Puerto Rico','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virgin Island','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];
    vm.newLocationInvalid = false;
    vm.isLoaded = false;
    vm.locationSelectedIds = [];

    vm.loadLocations = function(){
      Api.query({section: 'clients', id: UserService.getUser().id, cmd: 'locations', with_deleted: $scope.inactiveIsShowing ? 1 : 0}).then(
        function(res){
          if (res.error) {
            console.log('Error: ', res);
            return;
          }
          console.log(res);
          vm.locations = res.result;
        },
        function(err){
          console.log(err);
        }
      )
    }
    vm.newLocationOpen = function (){
      $scope.value = true;
      ngDialog.open({ 
        template: 'views/popups/newLocation.html', 
        className: 'ngdialog-theme-default ngdialog-with-map',
        scope: $scope,
        controller: ['$scope', function($scope) {
          $scope.location = {};
        }]
      });
    };

    vm.saveNewLocation = function(location, form){
      if (form.$valid) {
        vm.newLocationInvalid = false;
        ngDialog.close();
        Api.save({section: 'clients', id: UserService.getUser().id, cmd: 'locations'}, location).then(
          function(res) {
            if (res.error) {
              console.log('Error: ', res);
              return;
            }
            console.log(res);
            vm.loadLocations();
          },
          function(err){
            console.log(err);
          }
        );
      }
        else vm.newLocationInvalid = true;
    }
    vm.editLocationOpen = function (locationId){
      ngDialog.open({
        template: 'views/popups/editLocation.html', 
        className: 'ngdialog-theme-default ngdialog-with-map',
        appendClassName: 'tall-popup',
        scope: $scope,
        controller: function popupLocation($scope, location) {
          console.log(location);
          $scope.location = location.result;
        },
        resolve: {
          location: function() {
            console.log(locationId);
            return Api.get({section: 'locations', id: locationId});
          }
        }
      });
    };
    vm.editLocationClose = function(location, form){
      if (form.$valid) {
        vm.newLocationInvalid = false;
        ngDialog.close();
        location.role = 'Manager';
        Api.update({section: 'locations', id: location.id}, location).then(
          function(res) {
            if (res.error) {
              console.log('Error: ', res);
              return;
            }
            console.log(res);
            vm.loadLocations();
          },
          function(err){
            console.log(err);
          }
        );
      }
        else vm.newLocationInvalid = true;
    }

    vm.showHideInactives = function(){
      if (!vm.isLoaded) {
        vm.isLoaded = true;
        Api.query({section: 'clients', id: UserService.getUser().id, cmd: 'locations', with_deleted: $scope.inactiveIsShowing ? 1 : 0}).then(
          function(res) {
            if (res.error) {
              console.log('Error: ', res);
              vm.isLoaded = false;
              return;
            }
            console.log(res);
            vm.locations = res.result;
            vm.locationSelectedIds = [];
            vm.isLoaded = false;
          },
          function(err){
            console.log(err);
            vm.isLoaded = false;
          }
        );
      };
    };

    vm.deactivateLocations = function(){
      if (!vm.isLoaded) {
        console.log(vm.locationSelectedIds);
        vm.isLoaded = true;
        Api.remove({section: 'locations', 'locations[]': vm.locationSelectedIds}).then(
          function(res) {
            if (res.error) {
              console.log('Error: ', res);
              vm.isLoaded = false;
              return;
            }
            console.log(res);
            vm.locationSelectedIds = [];
            vm.isLoaded = false;
            vm.loadLocations();

          },
          function(err){
            console.log(err);
            vm.isLoaded = false;
          }
        );
      };
    }
  }
})();
