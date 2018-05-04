var angular = require("angular");

angular.module("app.controllers").controller("mainCtrl", [
  "$scope",
  "$routeParams",
  "goldenLayoutService",
  function($scope, $routeParams, goldenLayoutService) {
    goldenLayoutService.init();
  }
]);
