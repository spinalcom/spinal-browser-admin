var angular = require("angular");

angular.module("app.spinalcom").factory("spinalModelDictionary", [
  "$q",
  "ngSpinalCore",
  "config",
  "authService",
  function($q, ngSpinalCore, config, authService) {
    let factory = {};
    factory.model = 0;
    factory.users = 0;
    let wait_init = [];

    function reject(params) {
      for (var i = 0; i < wait_init.length; i++) {
        wait_init[i].reject(params);
      }
    }

    function resolve(params) {
      for (var i = 0; i < wait_init.length; i++) {
        wait_init[i].resolve(params);
      }
    }

    factory.init = () => {
      return authService.wait_connect().then(
        () => {
          var deferred = $q.defer();
          if (factory.users == 0) {
            wait_init.push(deferred);
            if (wait_init.length === 1) {
              // let user = authService.get_user();
              ngSpinalCore
                .load_root()
                .then(
                  m => {
                    factory.model = m;
                    return ngSpinalCore.load("/etc/users");
                  },
                  () => {
                    let msg = "not able to load : /";
                    console.error(msg);
                    reject(msg);
                  }
                )
                .then(
                  u => {
                    factory.users = u;
                    resolve(factory.model);
                  },
                  () => {
                    let msg = "not able to load : " + "/etc/users";
                    console.error(msg);
                    reject(msg);
                  }
                );
            }
          } else deferred.resolve(factory.model);
          return deferred.promise;
        },
        () => {
          let msg = "not able to load : /";
          console.error(msg);
          reject(msg);
        }
      );
    };
    return factory;
  }
]);
