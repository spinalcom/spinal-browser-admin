window.angular.module("app.spinalcom").service("spinalFileSystem", [
  "$q",
  "spinalModelDictionary",
  "$rootScope",
  "$timeout",
  "goldenLayoutService",
  function(
    $q,
    spinalModelDictionary,
    $rootScope,
    $timeout,
    goldenLayoutService
  ) {
    // let this = {};
    this.current_dir = 0;
    this.model = 0;
    this.id = 1;
    this.folderExplorer_dir = {};
    let listener_list = {};
    this.curr_window = 0;

    this.emit_subcriber = (name, arg) => {
      let listeners = listener_list[name];
      if (listeners) {
        for (var i = 0; i < listeners.length; i++) {
          if (listeners[i]) listeners[i](arg);
        }
      }
    };
    this.subcribe = (name, listener) => {
      let listeners = listener_list[name];
      if (!listeners) {
        listener_list[name] = [];
        listeners = listener_list[name];
      }
      listeners.push(listener);
      return () => {
        let indexOfListener = listeners.indexOf(listener);
        if (indexOfListener !== -1) {
          listeners[indexOfListener] = null;
        }
      };
    };
    this.unsubcribe = (name, listener) => {
      let listeners = listener_list[name];
      let indexOfListener = listeners.indexOf(listener);
      if (indexOfListener !== -1) {
        listeners[indexOfListener] = null;
      }
    };

    this.init = () => {
      return spinalModelDictionary.init().then(
        m => {
          if (this.model == 0) {
            this.model = m;
            this.current_dir = m;
            this.model.bind(() => {
              this.emit_subcriber("SPINAL_FS_ONCHANGE");
            });
          }
        },
        () => {
          //nothing for now
        }
      );
    };

    this.ptrRdy_defer = (ptr, promise, isnew = false) => {
      if (!ptr.data.value || window.FileSystem._tmp_objects[ptr.data.value]) {
        setTimeout(() => {
          this.ptrRdy_defer(ptr, promise, true);
        }, 200);
        return;
      }
      if (window.FileSystem._objects[ptr.data.value]) {
        promise({
          model: window.FileSystem._objects[ptr.data.value],
          firstTime: isnew
        });
      } else {
        ptr.load(m => {
          promise({
            model: m,
            firstTime: true
          });
        });
      }
    };

    this.waitPtrRdyAndLoad = ptr => {
      return new Promise(resolve => {
        this.ptrRdy_defer(ptr, resolve);
      });
    };

    this.load_dir = f => {
      let deferred = $q.defer();
      this.waitPtrRdyAndLoad(f._ptr).then(res => {
        let m = res.model;
        let firstTime = res.firstTime;
        if (m) {
          if (firstTime)
            m.bind(() => {
              this.emit_subcriber("SPINAL_FS_ONCHANGE");
            }, false);
          deferred.resolve(m);
        } else deferred.reject();
      });
      return deferred.promise;
    };

    this.deferGetFolderJson_rec = (
      prom_arr,
      all_dir,
      dir,
      arr,
      name,
      parent,
      opened
    ) => {
      let deferred = $q.defer();
      setTimeout(() => {
        deferred.resolve(
          this.getFolderJson_rec(all_dir, dir, arr, name, parent, opened)
        );
      }, 100);
      return deferred.promise;
    };

    // {
    //   id          : "string" // required
    //   parent      : "string" // required
    //   text        : "string" // node text
    //   icon        : "string" // string for custom
    //   state       : {
    //     opened    : boolean  // is the node open
    //     disabled  : boolean  // is the node disabled
    //     selected  : boolean  // is the node selected
    //   },
    //   li_attr     : {}  // attributes for the generated LI node
    //   a_attr      : {}  // attributes for the generated A node
    // }
    this.getFolderJson_rec = (
      all_dir,
      dir,
      arr = [],
      name = "root",
      parent = "#",
      opened = true
    ) => {
      let current;
      var prom_arr = [];
      // search if not existing

      if (!dir._server_id || window.FileSystem._tmp_objects[dir._server_id]) {
        return this.deferGetFolderJson_rec(
          prom_arr,
          all_dir,
          dir,
          arr,
          name,
          parent,
          opened
        );
      }

      for (var key in all_dir) {
        let n = all_dir[key];
        if (n.model == dir._server_id && n.text == name && n.parent == parent) {
          current = n;
          break;
        }
      }

      if (!current) {
        // current not found
        current = {
          model: dir._server_id,
          id: this.id,
          parent: parent,
          text: name,
          state: {
            opened: opened
          }
        };
        this.id++;
        if (
          opened == true ||
          (typeof all_dir[current.id] != "undefined" &&
            all_dir[current.id].state.opened == true)
        ) {
          current.state.opened = true;
        }
      }

      arr.push(current);
      all_dir[current.id] = current;
      this.folderExplorer_dir[current.id] = current;
      let create_callback = (all_dir, arr, f, current) => {
        return m => {
          return this.getFolderJson_rec(
            all_dir,
            m,
            arr,
            f.name.get(),
            current.id,
            false
          );
        };
      };
      for (var i = 0; i < dir.length; i++) {
        let f = dir[i];
        if (f._info.model_type.get() == "Directory") {
          prom_arr.push(
            this.load_dir(f).then(create_callback(all_dir, arr, f, current))
          );
        }
      }
      return $q.all(prom_arr).then(() => {
        return {
          tree: arr,
          all_dir: all_dir
        };
      });
    };

    this.onChangeNodeTree = (all_dir, data) => {
      all_dir[data.node.original.id].state = data.node.state;
      this.folderExplorer_dir[data.node.original.id].state = data.node.state;
    };

    this.onbdlclick = () => {};
    this.openFolder = (all_dir, node) => {
      if (this.curr_window && window.FileSystem._objects[node.original.model]) {
        this.curr_window.change_curr_dir(
          window.FileSystem._objects[node.original.model],
          this.create_path_with_node(node)
        );
      }
    };
    this.openFolderInNewLayer = (all_dir, node) => {
      goldenLayoutService.createChild({
        isClosable: true,
        title: "File Explorer",
        type: "component",
        componentName: "SpinalHome",
        componentState: {
          template: "FileExplorer.html",
          module: "app.FileExplorer",
          controller: "FileExplorerCtrl"
        }
      });
      $timeout(() => {
        if (
          this.curr_window &&
          window.FileSystem._objects[node.original.model]
        ) {
          this.curr_window.change_curr_dir(
            window.FileSystem._objects[node.original.model],
            this.create_path_with_node(node)
          );
        }
      });
    };
    this.newFolder = (all_dir, data, name) => {
      let f = window.FileSystem._objects[data.original.model];
      if (f) {
        let folder_name = name;
        let base_folder_name = folder_name.replace(/\([\d]*\)/g, "");
        let x = 0;
        while (f.has(folder_name)) {
          folder_name = base_folder_name + "(" + x + ")";
          x++;
        }
        f.add_file(folder_name, new window.Directory());
      }
    };
    this.FileExplorer_focus = scope => {
      this.curr_window = scope;
    };

    this.get_node_by_id = id => {
      for (var key in this.folderExplorer_dir) {
        if (this.folderExplorer_dir[key].id == id)
          return this.folderExplorer_dir[key];
      }
      return 0;
    };
    this.create_path_with_node = data => {
      let path = [];
      let parents = Array.from(data.parents).reverse();
      // parent =
      for (var i = 0; i < parents.length; i++) {
        let parent = parents[i];
        if (parent == "#") continue;
        let node_parent = this.get_node_by_id(parent);
        if (node_parent) {
          path.push({
            name: node_parent.text,
            _server_id: node_parent.model
          });
        }
      }
      path.push({
        name: data.text,
        _server_id: data.model
      });
      return path;
    };

    this.select_node = (all_dir, data) => {
      if (
        this.curr_window &&
        window.FileSystem._objects[data.node.original.model]
      ) {
        this.curr_window.change_curr_dir(
          window.FileSystem._objects[data.node.original.model],
          this.create_path_with_node(data.node)
        );
      }
    };

    this.deleteFolder = (all_dir, node) => {
      let f = window.FileSystem._objects[node.original.model];
      if (f) {
        let parent = all_dir[node.original.parent];
        if (window.FileSystem._objects[parent.model]) {
          let m_parent = window.FileSystem._objects[parent.model];
          for (var i = 0; i < m_parent.length; i++) {
            if (
              m_parent[i]._ptr.data.value == f._server_id &&
              node.original.text == m_parent[i].name.get()
            ) {
              m_parent.remove_ref(m_parent[i]);
              break;
            }
          }
        }
      }
    };

    this.handle_FE_progressBar = (model, item) => {
      if (model._info.model_type.get() === "Path") {
        if (model._info.remaining.get() != 0) {
          let percent =
            (model._info.to_upload.get() - model._info.remaining.get()) /
            model._info.to_upload.get();
          item.upload_pecent = percent * 100;
        }
      } else if (
        model._info.model_type.get() === "BIM Project" ||
        model._info.model_type.get() === "Digital twin"
      ) {
        if (model._info.state) {
          switch (model._info.state.num.get()) {
            case 0:
              item.upload_pecent = 10;
              break;
            case 1:
              item.upload_pecent = 18;
              break;
            case 2:
              item.upload_pecent = 36;
              break;
            case 3:
              item.upload_pecent = 54;
              break;
            case 4:
              item.upload_pecent = 72;
              break;
            case 5:
              item.upload_pecent = 80;
              break;
            case 6:
              item.upload_pecent = 90;
              break;
            case 7:
              break;
            case 8:
              item.upload_pecent = 100;
              item.error = true;
              break;
            // no default
          }
        }
      }
    };
    let wait_tmp_serverid_loop = (scope, deferred, model) => {
      if (
        !model._server_id ||
        window.FileSystem._tmp_objects[model._server_id]
      ) {
        setTimeout(() => {
          wait_tmp_serverid_loop(scope, deferred, model);
        }, 100);
      } else {
        let item = {
          name: model.name.get(),
          model_type: model._info.model_type.get(),
          _server_id: model._server_id,
          owner: scope.user.username
        };
        window.SpinalDrive_App._getOrCreate_log(model).then(logs => {
          if (logs.length === 0) {
            let tab = {
              date: Date.now(),
              name: scope.user.username,
              action: "1st visit"
            };
            window.SpinalDrive_App._pushLog(logs, tab);
          }

          item.created_at = logs[0].date;
          item.log = logs;

          this.handle_FE_progressBar(model, item);
          deferred.resolve(item);
        });
      }
    };
    let create_file_explorer_obj = (scope, model) => {
      let deferred = $q.defer();
      wait_tmp_serverid_loop(scope, deferred, model);
      return deferred.promise;
    };

    this.getFolderFiles = scope => {
      return this.init().then(() => {
        if (!scope.curr_dir) {
          scope.curr_dir = this.model;
          scope.fs_path.push({
            name: "home",
            _server_id: this.model._server_id
          });
        }

        let q = [];
        for (var i = 0; i < scope.curr_dir.length; i++) {
          let f = scope.curr_dir[i];
          q.push(create_file_explorer_obj(scope, f));
        }
        return $q.all(q);
      });
    };

    this.getFolderJson = all_dir => {
      return this.init().then(() => {
        return this.getFolderJson_rec(all_dir, this.model);
      });
    };

    this.FE_selected_drag = [];
    this.FE_init_dir_drag = 0;
    this.FE_fspath_drag = [];
    this.FE_visited_scope = [];
    this.addScopeVisted = scope => {
      for (var i = 0; i < this.FE_visited_scope.length; i++) {
        if (this.FE_visited_scope[i] == scope) return;
      }
      this.FE_visited_scope.push(scope);
    };

    this.fileSelected = model_id => {
      this.lastfileSelected = model_id;
      if (this.lastinspector)
        this.lastinspector.set_model(this.lastfileSelected);
    };
    this.setlastInspector = scope => {
      this.lastinspector = scope;
    };

    return this;
  }
]);
