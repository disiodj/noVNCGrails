var app = angular.module('tcui', ['ngRoute', 'ngCookies', 'ngResource', 'ui.bootstrap', 'ui.utils', 'datePicker',
    'ngSanitize', 'xeditable', 'nsPopover', 'angularUtils.directives.dirPagination', 'simplePagination', 'angular-clipboard']);

app.value('appname', 'Dimoco');

app.constant('version', '0.01');

console.log("Initializing TCUI application");

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'testcenters',
        controller: 'TestCenterListController'
    });
    $routeProvider.when('#/', {
        templateUrl: 'testcenters',
        controller: 'TestCenterListController'
    });

    $routeProvider.when('#', {
        templateUrl: 'testcenters',
        controller: 'TestCenterListController'
    });

    $routeProvider.when('/testcenters/:testcenterId', {
        templateUrl: 'testcenter',
        controller: 'TestCenterController'
    });


}]);

// Unlock user locks' when on home page
app.run(['$rootScope', '$location', 'tcuiREST', '$window', function ($rootScope, $location, $tcuiREST, $window) {
    $rootScope.$on('$routeChangeSuccess', function (e, current, pre) {
        if ($location.path() == '/') {
            cleanLocksBeforeUnload();
        }
    });

    /*$window.onbeforeunload = function () {
     cleanLocksBeforeUnload();
     var start = +new Date;
     while ((+new Date - start) < 700);
     };
     */

    function cleanLocksBeforeUnload() {
        jQuery.ajax({
            url: window.location.pathname + 'rest/users/locks',
            type: "DELETE",
            data: {},
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        });
    }

}]);

// handle expired sessions
app.factory("sessionInjector", ['$log', '$rootScope', function ($log, $rootScope) {
    return {
        request: function (config) {
            return config;
        },
        response: function (response) {
            if (typeof response.data === "string" && response.data.indexOf("login") > -1) {
                // TODO BPE: see what we are going to do with this
            }
            return response;
        }
    };
}])
;

app.config(function ($httpProvider) {
    $httpProvider.defaults.headers.post = {'Content-Type': 'application/json;'};
    // session injector to handle expired session
    $httpProvider.interceptors.push("sessionInjector");
});

// design for editable options
app.run(function (editableOptions) {
    editableOptions.theme = 'bs3';
});

console.warn("Running TCUI application");
