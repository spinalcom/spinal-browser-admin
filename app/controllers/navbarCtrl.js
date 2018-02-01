angular.module('app.controllers')
  .controller('navbarCtrl', ["$scope", "authService", "$location", "goldenLayoutService",
    function ($scope, authService, $location, goldenLayoutService) {
      $scope.username = "";
      $scope.connected = false;

      authService.wait_connect().then(() => {
        $scope.username = authService.get_user().username;
        $scope.connected = true;

      });

      $scope.logout = () => {
        $location.path('/login');
      };

      // get in SpinalDrive_Env
      $scope.layouts = [{
          id: "drag-folder-explorer",
          name: "Folder Explorer",
          cfg: {
            isClosable: true,
            title: "Folder Explorer",
            type: 'component',
            width: 20,
            componentName: 'SpinalHome',
            componentState: {
              template: 'sideBar.html',
              module: 'app.sidebar',
              controller: 'sideBarCtrl'
            }
          }
        },

        {
          id: "drag-file-explorer",
          name: "File Explorer",
          cfg: {
            isClosable: true,
            title: "File Explorer",
            type: 'component',
            componentName: 'SpinalHome',
            componentState: {
              template: 'FileExplorer.html',
              module: 'app.FileExplorer',
              controller: 'FileExplorerCtrl'
            }
          }
        },

        {
          id: "drag-inspector",
          name: "Inspector",
          cfg: {
            isClosable: true,
            title: "Inspector",
            type: 'component',
            componentName: 'SpinalHome',
            componentState: {
              template: 'inspector.html',
              controller: 'InspectorCtrl'
            }
          }
        },

      ];

      for (var i = 0; i < $scope.layouts.length; i++) {
        goldenLayoutService.registerPannel($scope.layouts[i])
      }

    }
  ]);