angular.module('app.controllers')
  .controller('mainCtrl', ["$scope", "$routeParams", "goldenLayoutService", "spinalModelDictionary",
    function ($scope, $routeParams, goldenLayoutService, spinalModelDictionary) {
      $scope.my_test = "truc";
      goldenLayoutService.init();
    }
  ]);