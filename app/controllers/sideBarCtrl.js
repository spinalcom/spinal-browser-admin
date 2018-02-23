angular.module('app.sidebar', ['jsTree.directive', 'app.services', 'app.spinalcom'])
  .controller('sideBarCtrl', ["$scope", "$rootScope", "spinalFileSystem", "$mdDialog", "$injector",
    function ($scope, $rootScope, spinalFileSystem, $mdDialog, $injector) {
      $scope.injector = $injector;
      $scope.fsdir = [];
      $scope.all_dir = {};
      let selected_node = 0;
      var newFolder_prompt = $mdDialog.prompt()
        .title('Input the name of the new folder')
        .placeholder('Folder Name')
        .initialValue('New Folder')
        .required(true)
        .ok('Ok')
        .cancel('Cancel');

      $scope.DnD_callback = (op, node, par, pos, more) => {
        if (((op === "move_node" || op === "copy_node") && node.type && node.type == "root") || par.id == "#") {
          return false;
        }

        if (node.original.model == par.original.model)
          return false;

        if ((op === "move_node" || op === "copy_node") && more && more.core) {
          if (confirm('Are you sure you want to move the folder ?')) {
            // UPDATE SPINALCORE MODELS HERE
            let m_parent = FileSystem._objects[par.original.model];
            let m_node;
            let n_par = spinalFileSystem.folderExplorer_dir[node.original.parent];
            let n_parent = FileSystem._objects[n_par.model];
            let n;
            for (var i = 0; i < n_parent.length; i++) {
              if (n_parent[i]._ptr.data.value == node.original.model) {
                m_node = n_parent[i];
                break;
              }
            }

            if (!m_parent || !m_node)
              return false;

            if (m_parent != n_parent) {
              let node_name = m_node.name.get();
              let base_node_name = node_name;
              let x = 0;
              while (m_parent.has(node_name)) {
                node_name = base_node_name + '(' + x + ')';
                x++;
              }
              if (node_name != m_node.name.get())
                m_node.name.set(node_name);
            }
            if (op == "move_node" || ((m_parent == n_parent) && op == "copy_node")) {
              for (i = 0; i < n_parent.length; i++) {
                let f = n_parent[i];
                if (f == m_node) {
                  n_parent.splice(i, 1);
                  if (i < pos)
                    pos--;
                  break;
                }
              }
            }
            // if ((m_parent == n_parent) && op == "copy_node") return false;
            m_parent.insert(pos, [m_node]);
            return true;
          }
          return false;
        }
        return true;

      };


      $scope.contextMenu = (node) => {
        let apps = spinalDrive_Env.get_applications('FolderExplorer', node);
        let create_action_callback = (node, app) => {
          return function (obj) {
            let share_obj = {
              node: node,
              model_server_id: node.original.model,
              scope: $scope
            };
            app.action(share_obj);
          };
        };
        let res = {};
        for (var i = 0; i < apps.length; i++) {
          let app = apps[i];
          res[app.name] = {
            label: app.label,
            icon: app.icon,
            action: create_action_callback(node, app)
          };
        }
        return res;
      };

      $scope.treeCore = {
        "themes": {
          "name": "default-dark"
        },
        "check_callback": $scope.DnD_callback
      };
      let listener_destructor = spinalFileSystem.subcribe('SPINAL_FS_ONCHANGE', (events, args) => {
        spinalFileSystem.getFolderJson($scope.all_dir).then((res) => {
          $scope.fsdir = res.tree;
          $scope.all_dir = res.all_dir;
        });
      });
      $scope.$on('$destroy', listener_destructor);

      $scope.select_node = (e, data) => {
        selected_node = data.node.original;
        spinalFileSystem.select_node($scope.all_dir, data);
      };
      $scope.onChangeNodeTree = (e, data) => {
        spinalFileSystem.onChangeNodeTree($scope.all_dir, data);
      };
      $scope.onbdlclick = (event) => {
        var node = $(event.target).closest("li");
        spinalFileSystem.onbdlclick($scope.all_dir, node[0].id);
      };

      spinalFileSystem.init();
      spinalFileSystem.getFolderJson($scope.all_dir).then((res) => {
        $scope.fsdir = res.tree;
        $scope.all_dir = res.all_dir;
      });
    }
  ]);