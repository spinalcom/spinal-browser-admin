angular.module('app.directives')
  .directive("navbar", [
    function () {
      return {
        restrict: 'E',
        templateUrl: 'app/templates/navbar.html',
        controller: 'navbarCtrl',
      };
    }
  ])
  .directive("menuGlayout", ['goldenLayoutService', '$timeout',
    function (goldenLayoutService, $timeout) {
      return {
        restrict: 'E',
        scope: {
          layoutInfo: '=info'
        },
        replace: true,
        template: '<li ng-repeat=\"layout in layoutInfo\"  id=\"{{layout.id}}\"><a >{{layout.name}}</a></li>',
        link: (scope, element, attrs) => {
          goldenLayoutService.wait_ready().then(() => {
            let create_callback = (goldenLayoutService, layout) => {
              return () => {
                goldenLayoutService.createChild(layout.cfg);
              };
            };
            goldenLayoutService.watch_pannel((pannels) => {
              console.log("in watch_pannel :");
              console.log(pannels);
              $timeout(() => {
                for (var i = 0; i < pannels.length; i++) {
                  let layout = pannels[i];
                  if (!layout.shown) {
                    layout.shown = true;
                    goldenLayoutService.createDragSource($("#" + layout.id)[0], layout.cfg);
                    $("#" + layout.id).click(create_callback(goldenLayoutService, layout));
                  }
                }
              }, 200);
              scope.layoutInfo = pannels;
            });
          });
        }
      };
    }
  ])
  .directive('ngRightClick', ['$parse', function ($parse) {
    return function (scope, element, attrs) {
      var fn = $parse(attrs.ngRightClick);
      element.bind('contextmenu', function (event) {
        scope.$apply(function () {
          event.preventDefault();
          fn(scope, {
            $event: event
          });
        });
      });
    };
  }]);