'use strict';

var App = angular.module('App', ['ngRoute', 'ngMaterial', 'ngResource']);

App.config(['$routeProvider',
  function ($routeProvider) {
      $routeProvider.
          when('/users/:userId', {
              templateUrl: 'components/user-detail/user-detailTemplate.html',
              controller: 'UserDetailController'
          }).
          when('/login-register', {
              templateUrl: 'components/login-register/login-registerTemplate.html',
              controller: 'LoginRegisterController'
          }).
          when('/about', {
              templateUrl: 'components/info-pages/aboutTemplate.html',
              controller: 'AboutController'
          }).
          otherwise({
              redirectTo: '',
          });
  }]);


App.controller('MainController', ['$scope', '$resource', '$rootScope', '$location', '$http',
  function ($scope, $resource, $rootScope, $location, $http) {
      $scope.main = {};
      $scope.main.title = 'Howard SWE Website';
      $scope.main.displayHomepage = true;
      $scope.main.currentUser = {};

      $scope.main.getCurrentUser = function(){
        return JSON.parse(window.localStorage.getItem("currentlyLogged"));
      };
      
      $scope.main.isLogged = function(){
        if(window.localStorage.getItem("currentlyLogged") === null){
            return false;
        }
        return true;
      };



      $scope.logout = function(){
        //TODO
        window.localStorage.clear();
        $scope.main.currentUser = {};

        // make the logging http POST request
        var LogOff = $resource("/admin/logout");
        $scope.userDetail = LogOff.save({}, function(){
          window.localStorage.removeItem("currentlyLogged");
          // Redirect the view to login page
          $location.path('/login-register');
        },
        function(){
          // console.log("Logout failed...");
        });
      };



  }]);