angular.module('app.spinalcom')
  .factory('authService', ["$q", "ngSpinalCore", "config", "$http",
    function ($q, ngSpinalCore, config, $http) {
      let factory = {};
      let user = {
        username: "",
        password: ""
      };
      let is_Connected = false;
      factory.save_user = (username, password) => {
        user.username = username;
        user.password = password;
        window.localStorage.setItem("spinalhome_cfg", btoa(JSON.stringify(user)));
      };
      factory.get_user = () => {
        let _user = window.localStorage.getItem("spinalhome_cfg");
        if (_user) {
          user = JSON.parse(atob(_user));
        }
        return user;
      };
      factory.logout = (username, password) => {
        if (user.username != "") {
          factory.save_user("", "");
          location.reload();
        }
      };

      factory.login = (username, password) => {
        let deferred = $q.defer();
        let url = "/get_admin_id";
        $http.get(url + "?u=" + username + "&p=" + password)
          .then(function (data) {
            var u = parseInt(data.data);
            var i = 0;
            if (u == -1) {
              let msg = ("Login Error: username / password pair not found.");
              // $mdToast.show(loginError_toast)
              deferred.reject(msg);
              for (i = 0; i < wait_connectList.length; i++) {
                wait_connectList[i].reject();
              }
              wait_connectList = [];
              return;
            }
            ngSpinalCore.connect("http://" + u + ":" + password +
              "@" + config.spinalhub_url + ":" + config.spinalhub_port + "/");
            factory.save_user(username, password);
            is_Connected = true;
            deferred.resolve();
            for (i = 0; i < wait_connectList.length; i++) {
              wait_connectList[i].resolve();
            }
            wait_connectList = [];
          }, function (data) {
            let msg = ('Connection Error: Imposible to connect to the server.');
            // $mdToast.show(connectionError_toast)
            deferred.reject(msg);
            for (var i = 0; i < wait_connectList.length; i++) {
              wait_connectList[i].reject();
            }
            wait_connectList = [];
          });
        return deferred.promise;
      };

      factory.is_Connected = () => {
        return is_Connected;
      };
      let wait_connectList = [];
      factory.wait_connect = () => {
        let deferred = $q.defer();
        if (is_Connected == true) {
          deferred.resolve();
        } else
          wait_connectList.push(deferred);
        return deferred.promise;
      };

      return factory;
    }
  ]);