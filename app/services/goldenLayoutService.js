window.angular
  .module("app.services")
  .factory("goldenLayoutService", [
    "$q",
    "$window",
    "$templateCache",
    "$rootScope",
    "$compile",
    function($q, $window, $templateCache, $rootScope, $compile) {
      var config = {
        content: [
          {
            type: "row",
            content: [
              {
                isClosable: false,
                title: "Folder Explorer",
                type: "component",
                width: 20,
                componentName: "SpinalHome",
                componentState: {
                  template: "sideBar.html",
                  controller: "sideBarCtrl"
                }
              },
              {
                isClosable: false,
                title: "File Explorer",
                type: "component",
                componentName: "SpinalHome",
                componentState: {
                  template: "FileExplorer.html",
                  controller: "FileExplorerCtrl"
                }
              }
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
          }
        ]
      };
      let myLayout = 0;
      let factory = {};
      factory.init = () => {
        if (myLayout == 0) {
          myLayout = new window.GoldenLayout(config, window.$("#g-layout"));
          myLayout.registerComponent("SpinalHome", function(container, state) {
            var element = container.getElement();
            if (state.template == "") {
              element.html();
              $compile(element.contents())($rootScope);
            } else {
              element.html(
                '<div class="gpanel-content" ng-controller="' +
                  state.controller +
                  '" ng-cloak>' +
                  $templateCache.get(state.template) +
                  "</div>"
              );
              $compile(element.contents())($rootScope);
            }
          });

          myLayout.init();
          window.angular.element($window).bind("resize", function() {
            myLayout.updateSize();
          });
          $rootScope.$emit("GoldenLayout_READY");
        }
      };

      factory.wait_ready = () => {
        return $q(function(resolve) {
          $rootScope.$on("GoldenLayout_READY", () => {
            resolve();
          });
        });
      };

      factory.createChild = config => {
        myLayout.root.contentItems[0].addChild(config);
      };

      factory.createDragSource = (element, config) => {
        myLayout.createDragSource(element, config);
      };

      factory.panels = [];
      factory.panels_watchers = [];
      factory.registerPanel = panel => {
        factory.panels.push(panel);
        for (var i = 0; i < factory.panels_watchers.length; i++) {
          factory.panels_watchers[i](factory.panels);
        }
      };
      factory.getPanels = () => {
        return factory.panels;
      };
      factory.watch_panel = fn => {
        if (factory.panels_watchers.length === 0) {
          factory.panels_watchers.push(fn);
          if (factory.panels.length != 0) {
            fn(factory.panels);
          }
          return;
        }
        let found = false;
        for (var i = 0; i < factory.panels_watchers.length; i++) {
          if (factory.panels_watchers[i] === fn) {
            found = true;
            break;
          }
        }
        if (found === false) factory.panels_watchers.push(fn);
      };

      return factory;
    }
  ])
  .factory("layout_uid", function() {
    let uid = 0;
    return {
      get: () => {
        let id = uid++;
        return id;
      }
    };
  });
