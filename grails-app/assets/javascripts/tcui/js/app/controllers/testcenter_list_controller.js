app.controller("TestCenterListController", function ($scope, $routeParams, tcuiREST, $modal, $log, pushService, appModeService, $location) {


    $("#app-title").text("Testcenters");

    console.log('Testcenter list');

    $scope.testcenterError = false;
    $scope.testcenters = [];

    pushService.setTopic('/testcenters');

    // init websocket client
    pushService.init();

    pushService.receive().then(null, null, function (testcenters) {
        $scope.testcenters = testcenters;
    });

    // destroy websocket client
    $scope.$on("$destroy", function () {
        pushService.stop();
    });

    $scope.openTestcenter = function (testcenterId, mode) {
        appModeService.setMode(mode);
        $location.path('/testcenters/' + testcenterId);
    };

    $scope.showTestcenterInfo = function (testcenter) {
        $("#dialog-message p").html('');
        var testcenterInfo = "<table class='tc_infos'>"
            + "<tr><td class='key'>Name</td><td class='value'>"+$scope.normalizeTcInfo(testcenter.name)+"</td></tr>"
            + "<tr><td class='key'>Hostname</td><td class='value'>"+$scope.normalizeTcInfo(testcenter.hostname)+"</td></tr>"
            + "<tr><td class='key'>Ssh Port</td><td class='value'>"+$scope.normalizeTcInfo(testcenter.sshPort)+"</td></tr>"
            + "<tr><td class='key'>Contact Name</td><td class='value'>"+$scope.normalizeTcInfo(testcenter.contactName)+"</td></tr>"
            + "<tr><td class='key'>Contact Email</td><td class='value'>"+$scope.normalizeTcInfo(testcenter.contactEmail)+"</td></tr>"
            + "<tr><td class='key'>Contact Phone</td><td class='value'>"+$scope.normalizeTcInfo(testcenter.contactPhone)+"</td></tr>"
            + "<tr><td class='key'>Contact Messenger</td><td class='value'>"+$scope.normalizeTcInfo(testcenter.contactMessenger)+"</td></tr>"
            + "<tr><td class='key'>Contact Address</td><td class='value'>"+$scope.normalizeTcInfo(testcenter.contactAddress)+"</td></tr>"
            + "<tr><td class='key'>Contact Company</td><td class='value'>"+$scope.normalizeTcInfo(testcenter.contactCompany)+"</td></tr>"
            + "<tr><td class='key'>Contact Office Hours</td><td class='value'>"+$scope.normalizeTcInfo(testcenter.contactOfficeHours)+"</td></tr>"
            + "</table>";

        $("#dialog-message p").html(testcenterInfo);
        $("#dialog-message").dialog({
            modal: false,
            width: 650,
            buttons: {
                OK: function () {
                    $(this).dialog("close");
                }
            }
        });
    };

    $scope.normalizeTcInfo = function(value) {
        return angular.isUndefined(value) || value === null ? "N/A" : value;
    }
});
