/*
 * jstree.directive [http://www.jstree.com]
 * http://arvindr21.github.io/jsTree-Angular-Directive
 *
 * Copyright (c) 2014 Arvind Ravulavaru
 * Licensed under the MIT license.
 *
 * Modified by Laurent HA TAM DAN
 * Copyright 2015 SpinalCom - www.spinalcom.com
 *
 */
var angular = require("angular");
var $ = require("jquery");
var ngJSTree = angular.module("jsTree.directive", []);

ngJSTree.directive("jsTree", [
  "$http",
  function($http) {
    var tree = {};
    var treeDir = {
      restrict: "EA",
      fetchResource: function(url, cb) {
        return $http.get(url).then(function(data) {
          if (cb) cb(data.data);
        });
      },

      managePlugins: function(s, e, a, config) {
        if (a.treePlugins) {
          config.plugins = a.treePlugins.split(",");
          config.core = config.core || {};
          config.core.check_callback = config.core.check_callback || true;

          if (config.plugins.indexOf("state") >= 0) {
            config.state = config.state || {};
            config.state.key = a.treeStateKey;
          }

          if (config.plugins.indexOf("search") >= 0) {
            var to = false;
            if (e.next().attr("class") !== "ng-tree-search") {
              e
                .after(
                  '<input type="text" placeholder="Search Tree" class="ng-tree-search"/>'
                )
                .next()
                .on("keyup", function(ev) {
                  if (to) {
                    clearTimeout(to);
                  }
                  to = setTimeout(function() {
                    tree.jstree(true).search(ev.target.value);
                  }, 250);
                });
            }
          }

          if (config.plugins.indexOf("checkbox") >= 0) {
            config.checkbox = config.checkbox || {};
            config.checkbox.keep_selected_style = false;
          }

          if (config.plugins.indexOf("contextmenu") >= 0) {
            if (a.treeContextmenu) {
              config.contextmenu =
                config.contextmenu ||
                {
                  // 'select_node': false,
                };
              if (typeof a.disableselectContextmenu != "undefined") {
                config.contextmenu.select_node = false;
              }
              if (a.treeContextmenuaction != undefined) {
                config.contextmenu.items = function(e) {
                  return s.$eval(a.treeContextmenuaction)(e);
                };
              } else {
                config.contextmenu.items = function(node) {
                  if (typeof s[a.treeContextmenu] == "function")
                    return s[a.treeContextmenu](node);
                  return s[a.treeContextmenu];
                };
              }
            }
          }

          if (config.plugins.indexOf("types") >= 0) {
            if (a.treeTypes) {
              config.types = s[a.treeTypes];
            }
          }

          if (config.plugins.indexOf("dnd") >= 0) {
            if (a.treeDnd) {
              config.dnd = s[a.treeDnd];
            }
          }
        }
        return config;
      },
      manageEvents: function(s, e, a) {
        if (a.treeEvents) {
          var evMap = a.treeEvents.split(";");
          for (var i = 0; i < evMap.length; i++) {
            if (evMap[i].length > 0) {
              // plugins could have events with suffixes other than '.jstree'
              var evt = evMap[i].split(":")[0];
              if (evt.indexOf(".") < 0) {
                evt = evt + ".jstree";
              }
              var cb = evMap[i].split(":")[1];
              tree.on(evt, s[cb]);
            }
          }
        }
      },
      manageBinds: function(s, e, a) {
        if (a.treeBinds) {
          var evMap = a.treeBinds.split(";");
          for (var i = 0; i < evMap.length; i++) {
            if (evMap[i].length > 0) {
              var evt = evMap[i].split(":")[0];
              var cb = evMap[i].split(":")[1];
              tree.on(evt, s[cb]);
            }
          }
        }
      },
      link: function(s, e, a) {
        // scope, element, attribute \O/
        $(function() {
          var config = {};

          // users can define 'core'
          config.core = {};
          if (a.treeCore) {
            config.core = $.extend(config.core, s[a.treeCore]);
          }

          // clean Case
          a.treeData = a.treeData ? a.treeData.toLowerCase() : "";
          a.treeSrc = a.treeSrc ? a.treeSrc.toLowerCase() : "";

          if (a.treeData == "html") {
            treeDir.fetchResource(a.treeSrc, function(data) {
              e.html(data);
              treeDir.init(s, e, a, config);
            });
          } else if (a.treeData == "json") {
            treeDir.fetchResource(a.treeSrc, function(data) {
              config.core.data = data;
              treeDir.init(s, e, a, config);
            });
          } else if (a.treeData == "scope") {
            s.$watch(
              a.treeModel,
              function(n) {
                if (n) {
                  config.core.data = s[a.treeModel];
                  $(e).jstree("destroy");
                  treeDir.init(s, e, a, config);
                }
              },
              true
            );
            // Trigger it initally
            // Fix issue #13
            config.core.data = s[a.treeModel];
            treeDir.init(s, e, a, config);
          } else if (a.treeAjax) {
            config.core.data = {
              url: a.treeAjax,
              data: function(node) {
                return {
                  id: node.id != "#" ? node.id : 1
                };
              }
            };
            treeDir.init(s, e, a, config);
          }
        });
      },
      init: function(s, e, a, config) {
        treeDir.managePlugins(s, e, a, config);
        tree = $(e).jstree(config);
        treeDir.manageEvents(s, e, a);
        treeDir.manageBinds(s, e, a);
      }
    };

    return treeDir;
  }
]);
