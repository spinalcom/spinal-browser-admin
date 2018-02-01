angular.module('app.route')
  .config(["$routeProvider", "$locationProvider",
    function ($routeProvider, $locationProvider) {
      $routeProvider
        .when("/home", {
          templateUrl: "app/templates/main.html",
          authenticate: true,
          controller: 'mainCtrl'
        })
        .when("/login", {
          templateUrl: "app/templates/login.html",
          authenticate: false,
          controller: 'loginCtrl'
        })

        .otherwise({
          redirectTo: '/home'
        });
    }
  ]);