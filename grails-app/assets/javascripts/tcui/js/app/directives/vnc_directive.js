/**
 * Adds VNC applet to page
 */
app.directive("addVnc", function ($timeout, $interpolate, $compile, tcuiREST) {
    return function (scope, element) {
        element.bind("click", function () {
            // handset already locked
            if (scope.activeHandset.lock) {
                showVnc(tcuiREST, scope, $timeout);
            }
            // handset not locked
            else {
                scope.vncHandsetLocking = true;
                scope.lock = {
                    msisdn: scope.activeHandset.simCard.msisdn,
                    operator: scope.activeHandset.simCard.operator.internalName
                };
                tcuiREST.Lock.save({dataType: 'json'}, scope.lock, function () {
                    scope.vncHandsetLocking = false;
                    showVnc(tcuiREST, scope, $timeout);
                }, function (error) {
                    scope.openVncInfoPopup('Problem when trying to lock the handset, please try again');
                    console.log(error);
                });
            }
        });
    };
});

var showVnc = function (tcuiREST, scope, timeout) {
    tcuiREST.Handset.getHandsetById({handsetId: scope.activeHandset.id}, function (handset) {

        scope.activeHandset = handset;
        scope.vncInSession = true;

        $("#vnc-panel").load("html/vnc-viewer.html", function () {
            $("#noVNC_host").val(handset.hostname);
            $("#noVNC_port").val(handset.vncport);
            $("#noVNC_password").val(handset.password);

            $("#noVNC_screen").mouseout(function () {
                UI.rfb.get_keyboard().set_focused(false);
            }).mouseover(function () {
                UI.rfb.get_keyboard().set_focused(true);
            });
        });

        timeout(function () {
            if (UI.load()) {
                UI.connect();
            }
        }, 300);

    });
};

/**
 * Removes VNC applet from page
 */
app.directive("removeVnc", function () {
    return function (scope, element) {
        element.bind("click", "", function () {
            // remove vnc from html
            scope.vncInSession = false;
            angular.element(document.getElementById('vnc-panel')).html('');
            if (UI && UI.rfb) {
                UI.disconnect();
            }
        });
    };
});
