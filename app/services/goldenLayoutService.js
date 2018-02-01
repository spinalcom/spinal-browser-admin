angular.module('app.services')
  .factory('goldenLayoutService', ['$q', '$window', '$templateCache', '$rootScope', '$compile',
    function ($q, $window, $templateCache, $rootScope, $compile) {
      var config = {
        content: [{
          type: 'row',
          content: [{
              isClosable: false,
              title: "Folder Explorer",
              type: 'component',
              width: 20,
              componentName: 'SpinalHome',
              componentState: {
                template: 'sideBar.html',
                controller: 'sideBarCtrl'
              }
            },
            {
              isClosable: false,
              title: "File Explorer",
              type: 'component',
              componentName: 'SpinalHome',
              componentState: {
                template: 'FileExplorer.html',
                controller: 'FileExplorerCtrl'
              }
            },
            // {
            //   isClosable: false,
            //   title: "Inspector",
            //   type: 'component',
            //   componentName: 'SpinalHome',
            //   componentState: {
            //     template: 'inspector.html',
            //     controller: 'InspectorCtrl'
            //   }
            // }

          ]
        }]
      };
      let myLayout = 0;
      let factory = {};
      factory.init = () => {
        if (myLayout == 0) {
          myLayout = new GoldenLayout(config, $("#g-layout"));
          myLayout.registerComponent('SpinalHome', function (container, state) {
            var element = container.getElement();
            if (state.template == '') {

              element.html();
              $compile(element.contents())($rootScope);
            } else {
              element.html("<div class=\"gpannel-content\" ng-controller=\"" + state.controller + "\" ng-cloak>" +
                $templateCache.get(state.template) + "</div>");
              $compile(element.contents())($rootScope);
            }
          });

          myLayout.init();
          angular.element($window).bind('resize', function () {
            myLayout.updateSize();
          });
          $rootScope.$emit("GoldenLayout_READY");
        }
      };

      factory.wait_ready = () => {
        return $q(function (resolve, reject) {
          $rootScope.$on("GoldenLayout_READY", () => {
            resolve();
          });
        });
      };



      factory.createChild = (config) => {
        myLayout.root.contentItems[0].addChild(config);
      };

      factory.createDragSource = (element, config) => {
        myLayout.createDragSource(element, config);
      };


      factory.pannels = [];
      factory.pannels_watchers = [];
      factory.registerPannel = (pannel) => {
        factory.pannels.push(pannel);
        console.log("registerPannel");
        console.log(factory.pannels);
        for (var i = 0; i < factory.pannels_watchers.length; i++) {
          factory.pannels_watchers[i](factory.pannels);
        }
      };
      factory.getPannels = () => {
        return factory.pannels;
      };
      factory.watch_pannel = (fn) => {
        if (factory.pannels_watchers.length === 0) {
          factory.pannels_watchers.push(fn);
          if (factory.pannels.length != 0) {
            fn(factory.pannels);
          }
          return;
        }
        let found = false;
        for (var i = 0; i < factory.pannels_watchers.length; i++) {
          if (factory.pannels_watchers[i] === fn) {
            found = true;
            break;
          }
        }
        if (found === false)
          factory.pannels_watchers.push(fn);
      };

      return factory;
    }
  ])
  .factory('layout_uid', function () {
    let uid = 0;
    return ({
      get: () => {
        let id = uid++;
        return id;
      }
    });
  });