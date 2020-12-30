app.controller("TestCenterController", function ($scope, $routeParams, tcuiREST, $http, appModeService, $log,
                                                 $modal, $timeout, $rootScope, pushServiceTwo, authService, $location, clipboard) {

    var TESTCENTER_OFFLINE_STATUS = 'OFFLINE';
    var SMS_MODE = 'sms';

    $scope.vncHandsetLocking = false;

    $scope.modalVisible = false;
    $scope.testcenter = '';

    $scope.unlockPrivilege = 'UNLOCK_HANDSET'; // admin-like privilege that can unlock anybodys lock
    $scope.extendedSessionPrivilege = 'EXTENDED_SESSION'; // admin-like session length
    $scope.regularSessionTimeout = 600000; // 10 minutes
    $scope.extendedSessionTimeout = 28800000; // 8 hours


    // general nav fields
    $scope.testcenterId = $routeParams.testcenterId;
    $scope.handsets = [];
    $scope.activeMsisdn = "";
    $scope.activeHandset = "";
    $scope.activeHandsetName = "";
    $scope.lock = "";
    $scope.viewMode = appModeService.getMode();
    $scope.vncVisible = true;

    // wap/vnc fields
    $scope.vncInSession = false;

    $scope.vncHandset = "";
    $scope.vncTimeout = '';
    $scope.vncTimeoutCount = 0;
    $scope.vncStatus = {};
    $scope.vncStatusMessage = {};
    $scope.vncDisabled = false;

    $scope.smsSendingStatuses = [];
    $scope.smsHandsets = [];
    var inactivityTimeoutPromise;
    var balanceCheckPromise;

    // init websockets
    $scope.initAndStartWS = function () {
        $scope.idleCheck();
        if (!$scope.isUndefined(pushServiceTwo.getTopic)) {
            pushServiceTwo.setTopic('/tc_' + $scope.testcenterId);
        }
        pushServiceTwo.init();
        pushServiceTwo.receive().then(null, null, function (testcenter) {
            $scope.handsets = [];
            $scope.testcenter = testcenter;
            $("#app-title").text($scope.testcenter.name);
            var tempSelectedHandsets = [];
            angular.forEach(testcenter.handsets, function (handset) {
                // determine lock status
                if (handset.locked) {
                    // my lock
                    if (handset.lockedBy == authService.getUsername()) {
                        handset.myLock = true;
                    }
                    // can unlock
                    if (authService.getAdminUnlock()) {
                        handset.canUnlock = true;
                    }
                }
                angular.forEach($scope.selectedHandsets, function (selectedHandset) {
                    if (selectedHandset.id == handset.id) {
                        handset.selected = true;
                        tempSelectedHandsets.push(handset);
                    }
                });

                handset.vncOk = !$scope.isUndefined(testcenter.status) ? testcenter.status : 'NO';
                $scope.handsets.push(handset);

            });
            // updated selected handsets
            $scope.selectedHandsets = tempSelectedHandsets;
            // set active handset/msisdn to 1st from the list
            if ($scope.isUndefined(appModeService.getActiveHandset())) {
                $scope.activeHandset = $scope.handsets[0];
                appModeService.setActiveHandset($scope.handsets[0]);
            }
            // update existing active handset/msisdn
            else {
                angular.forEach(testcenter.handsets, function (handset) {
                    var h = appModeService.getActiveHandset();
                    if (handset.id == h.id) {
                        $scope.activeHandset = handset;
                        $scope.activeMsisdn = handset.simCard.msisdn;
                        appModeService.setActiveHandset(handset);
                        appModeService.setActiveMsisdn(handset.simCard.msisdn);
                        // handle current running VNC session
                        if ($scope.vncInSession == true) {
                            // check if handset unlocked - the push is too fast and
                            if ($scope.isUndefined($scope.activeHandset.lock) && $scope.vncHandsetLocking == false && $scope.modalVisible == false) {
                                $scope.vncInSession = false;
                                //$scope.openVncInfoPopup('Someone has unlocked this handset. Your session was forced to end');
                            }
                            // check if active handset has a lock different than your lock and if so close
                            if (!$scope.isUndefined($scope.activeHandset.lock) && $scope.activeHandset.lockedBy != authService.getUsername()) {
                                $scope.vncInSession = false;
                                //$scope.openVncInfoPopup('Someone has locked this handset. Your session was forced to end');
                            }
                        }
                    }
                });
            }
            $scope.smsHandsets = [];
            angular.forEach($scope.selectedHandsets, function (selectedHandset) {
                if (selectedHandset.locked == true && selectedHandset.myLock == true) {
                    $scope.smsHandsets.push(selectedHandset);
                }
            });
            switchToSMSTabWhenTestCenterIsOffline($scope.testcenter);
        });
    };

    $scope.startInactivityTimeout = function () {
        var timeout = authService.getExtendedSession() ? $scope.extendedSessionTimeout : $scope.regularSessionTimeout;
        inactivityTimeoutPromise = $timeout($scope.showSessionExpirationInfo, timeout);
    };

    $scope.showSessionExpirationInfo = function () {
        var absUrl = $location.absUrl();
        var returnUrl = encodeURIComponent(absUrl);
        var appPath = $('#appPath').val();
        window.location.href = appPath + '/sessionExpired?returnUrl=' + returnUrl;
    };

    $scope.idleCheck = function () {
        // $(function () {
        var awayCallback = function () {
            //console.log('away');
            $timeout.cancel(inactivityTimeoutPromise);
            $scope.startInactivityTimeout();
        };
        var awayBackCallback = function () {
            //setMessage("back");
            //console.log('back');
            //console.log('timer cancel');
            $timeout.cancel(inactivityTimeoutPromise);
        };
        var hiddenCallback = function () {
            //console.log('User is not looking at page');
            $timeout.cancel(inactivityTimeoutPromise);
            $scope.startInactivityTimeout();
        };
        var visibleCallback = function () {
            //console.log('User started looking at page again');
            //console.log('timer cancel');
            $timeout.cancel(inactivityTimeoutPromise);
        };

        var idle = new Idle({
            onHidden: hiddenCallback,
            onVisible: visibleCallback,
            onAway: awayCallback,
            onAwayBack: awayBackCallback,
            awayTimeout: 1000
        });
        // });
    };

    $scope.auth = function () {
        tcuiREST.User.getAuth(function (tcuiUser) {
            authService.setUsername(tcuiUser.user.username);
            var shouldContinueUnlockLoop = true;
            var shouldContinueExtendedSessionLoop = true;
            angular.forEach(tcuiUser.user.authorities, function (privilege) {
                if (shouldContinueUnlockLoop) {
                    if (privilege.role == $scope.unlockPrivilege) {
                        authService.setAdminUnlock(true);
                        shouldContinueUnlockLoop = false;
                    }
                }
                if (shouldContinueExtendedSessionLoop) {
                    if (privilege.role == $scope.extendedSessionPrivilege) {
                        authService.setExtendedSession(true);
                        shouldContinueExtendedSessionLoop = false;
                    }
                }
            });
            $scope.initAndStartWS();
        })
    };


    $scope.auth();

    $scope.$on('HIDE VNC', function (event, args) {
        $scope.vncVisible = false;
    });

    $scope.$on('SHOW VNC', function (event, args) {
        $scope.vncVisible = true;
    });

    // settings config
    $scope.settings = {
        refreshInterval: 10, // 10 seconds
        autoRefresh: true
    };

    // rownum for sms history
    // rownum for sms history
    $scope.rowOptions = [
        {value: "10", text: "10 Messages"},
        {value: "15", text: "15 Messages"},
        {value: "25", text: "25 Messages"},
        {value: "50", text: "50 Messages"}
    ];
    $scope.selectedRowOption = $scope.rowOptions[0];

    $scope.updateRowNum = function (rowNum) {
        $scope.selectedRowOption = rowNum;
        $rootScope.$broadcast('UPDATE_HISTORY_ROW_SIZE', $scope.selectedRowOption.value);
    };

    // sms send fields
    $scope.sms = {
        "from": "",
        "to": "",
        "application": "tcui",
        "message": "",
        "received": "",
        "direction": "",
        "online": false
    };

    $scope.smsMessageStatus = "status_initial";
    $scope.smsStatusText = "";
    $scope.smsPlaceholderText = "Enter phone number";
    $scope.shouldValidate = true;

    // navigation tab
    $scope.navTabClicked = function (mode) {
        if (mode == 'wap' && $scope.testcenter.status == 'OFFLINE') {
            return false;
        }
        $scope.viewMode = mode;
        appModeService.setMode(mode);
        // broadcast refresh event
        $rootScope.$broadcast('REFRESH_HISTORY');
    };

    // operator tab
    $scope.operatorTabClick = function (handset) {
        if ($scope.activeHandset != handset && UI && UI.rfb && UI.rfb_state === 'normal') {
            UI.disconnect();
            angular.element(document.getElementById('vnc-panel')).html('');
        }
        $scope.activeHandset = handset;
        appModeService.setActiveHandset(handset);
        if (appModeService.getActiveMsisdn() != handset.simCard.msisdn) {
            $scope.vncInSession = false;
            $scope.activeHandset = handset;
            $scope.activeMsisdn = handset.simCard.msisdn;
            appModeService.setActiveMsisdn($scope.activeMsisdn);
            // broadcast refresh event
            $rootScope.$broadcast('REFRESH_HISTORY');
        }
    };

    // copies msisdn to clipboard
    //scrollTop is IE fix for TES-61
    $scope.copyMsisdn = function (handset) {
        var tempScrollTop = $(window).scrollTop();
        clipboard.copyText(handset.simCard.msisdn);
        $(window).scrollTop(tempScrollTop);
    };

    /**
     * Validates if at least one sender is selected when sending sms
     * @returns {boolean}
     */
    $scope.operatorSelected = function () {
        return $scope.smsHandsets.length > 0;
    };

    $scope.selectedHandsets = [];


    $scope.updateSelection = function () {
        $scope.selectedHandsetsAfterUpdate = [];
        angular.forEach($scope.handsets, function (handset) {
            // disable selection for handsets not locked by me
            handset.selectionDisabled = !$scope.isUndefined(handset.lock) && !handset.lock.myLock;
            // check if lock status changed for selected handsets
            angular.forEach($scope.selectedHandsets, function (selectedHandset) {
                if (handset.id == selectedHandset.id) {
                    if (!$scope.isUndefined(handset.lock) && !handset.lock.myLock) {
                        handset.selected = false;
                    }
                    else if ($scope.isUndefined(handset.lock)) {
                        handset.selected = false;
                    }
                    else {
                        handset.selected = true;
                        $scope.selectedHandsetsAfterUpdate.push(handset);
                    }
                }
            });
        });

        // update selected handsets
        $scope.selectedHandsets = $scope.selectedHandsetsAfterUpdate;
    };

    $scope.toggleSelection = function (handset) {
        if (handset.selected) {
            $scope.selectedHandsets.push(handset);
        }
        else {
            $scope.allSelected = false;
            var index = 0;
            angular.forEach($scope.selectedHandsets, function (selectedHandset) {
                handset.selected = false;
                if (selectedHandset.id == handset.id) {
                    $scope.selectedHandsets.splice(index, 1);
                }
                index++;
            });
        }
        $scope.smsHandsets = [];
        var selectCounter = 0;
        angular.forEach($scope.selectedHandsets, function (selectedHandset) {
            selectCounter++;
            if (selectedHandset.locked == true && selectedHandset.myLock == true) {
                $scope.smsHandsets.push(selectedHandset);
            }
        });
        if (!$scope.isUndefined($scope.smsHandsets) && selectCounter == $scope.smsHandsets) {
            $scope.allSelected = false;
        }
        else {
            $scope.allSelected = true;
        }

        $rootScope.$broadcast('FILTER_HISTORY', $scope.selectedHandsets);
    };

    $scope.removeSelection = function (handset) {
        $scope.allSelected = false;
        var index = 0;
        angular.forEach($scope.selectedHandsets, function (selectedHandset) {
            handset.selected = false;
            if (selectedHandset.id == handset.id) {
                $scope.selectedHandsets.splice(index, 1);
            }
            index++;
        });
    };

    $scope.trimWhitespace = function () {
        if (!$scope.isUndefined($scope.sms.to)) {
            $scope.sms.to = $scope.sms.to.replace(/[\s]/g, '');
        }
        $scope.shouldValidate = true;
    };

    $scope.networkTypeShort = function (handset) {
        var handsetStatus = handset.handsetStatus;
        if (!handsetStatus) {
            return "";
        }
        if (handsetStatus.online != 'true') {
            return "";
        }
        var networkType = handsetStatus.networkType;
        if ($scope.isUndefined(networkType)) {
            return "N/A";
        } else {
            networkType = networkType.toUpperCase();
            switch (networkType) {
                case "EDGE":
                    return "E";
                case "GPRS":
                    return "G";
                case "HSPA":
                    return "H";
                case "HSPAP":
                    return "H+";
                case "LTE":
                    return "4G";
                case "3G":
                    return "3G";
                default:
                    return "N/A";
            }
        }
    };

    // reset sms form
    $scope.clearSms = function () {
        $scope.sms.to = "";
        $scope.sms.message = "";
        $scope.smsMessageStatus = "status_initial";
    };

    // send sms
    $scope.sendSms = function () {
        $scope.smsSendingStatuses = [];
        if (!$scope.operatorSelected()) {
            $scope.smsMessageStatus = "status_noop";
            $scope.textColor = 'red';
            return;
        }
        $scope.smsMessageStatus = "status_processing";
        $scope.smss = [];
        $.each($scope.smsHandsets, function (index, value) {
            $scope.sms.online = !$scope.isUndefined(value.handsetStatus) && !$scope.isUndefined(value.handsetStatus.online) && value.handsetStatus.online == 'true' ? true : false;
            $scope.smss[index] = angular.copy($scope.sms);
            $scope.smss[index].from = value.simCard.msisdn;
        });
        tcuiREST.SmsSend.send({dataType: 'json'}, $scope.smss, function (data) {
            if (data.error !== undefined && data.error !== null && data.error.length > 0) {
                $scope.smsSendingStatuses[0] = {status: "status_error", message: data.error};
            } else {
                $.each(data, function (index, value) {
                    if (value.handled == true) {
                        $scope.smsSendingStatuses[index] = {
                            status: "status_success",
                            message: value.from + " - Message sent"
                        };
                    } else {
                        $scope.smsSendingStatuses[index] = {status: "status_failure", message: value.error};
                    }

                    $scope.smsSendingStatuses[index].close = function () {
                        $scope.smsSendingStatuses.splice($scope.smsSendingStatuses.indexOf(this), 1);
                    };
                    $timeout(function () {
                        $scope.smsSendingStatuses.splice($scope.smsSendingStatuses.indexOf($scope.smsSendingStatuses[index]), 1);
                    }, 3000);

                });
                //$scope.sms.message = '';
                //$scope.sms.to = '';
                $scope.shouldValidate = false;
            }
        }, function (error) {
            $scope.smsSendingStatuses[0] = {"status_error": "There was a network error. Try again later."};
            $scope.smsMessageStatus = "status_error";
            $scope.smsStatusText = error.status;
            console.log(error);
        });
        $('.alert').show();
    };

    $scope.toggleLock = function (handset) {
        if (handset.locked) {
            $scope.determineUnlockPermission(handset)
        } else {
            $scope.addLock(handset);
        }
    };

    $scope.addLock = function (handset) {
        $scope.lock = {
            msisdn: handset.simCard.msisdn,
            operator: handset.simCard.operator.internalName
        };

        tcuiREST.Lock.save({dataType: 'json'}, $scope.lock, function () {
            $scope.smsHandsets = [];
            angular.forEach($scope.selectedHandsets, function (selectedHandset) {
                if (selectedHandset.locked == true && selectedHandset.myLock == true) {
                    $scope.smsHandsets.push(selectedHandset);
                }
            });
        }, function (error) {
            $log.error(error);
        });
    };

    $scope.removeLock = function (handset) {
        tcuiREST.Lock.delete({param: handset.simCard.msisdn}, function () {
                $scope.vncInSession = false;
                $scope.smsHandsets = [];
                angular.forEach($scope.selectedHandsets, function (selectedHandset) {
                    if (selectedHandset.locked == true && selectedHandset.myLock == true) {
                        $scope.smsHandsets.push(selectedHandset);
                    }
                });
            },
            function (error) {
                $log.error(error);
            });
    };

    $scope.restartVnc = function () {
        tcuiREST.Vnc.restart({handsetId: $scope.activeHandset.id}, function (data) {
            if (data.error !== undefined && data.error !== null && data.error.length > 0) {
                $scope.vncStatus = "status_error";
                $scope.vncStatusMessage = "Error occured. " + data.error;
            } else {
                $scope.vncTimeoutCount = 0;
                $scope.vncStatus = "status_success";
                $scope.vncStatusMessage = data.status;
                $scope.vncTimeout = data.timeout;
                $scope.vncDisabled = true;
                $scope.countUp();
            }
        }, function (error) {
            $scope.vncStatus = "status_failure";
            $scope.vncStatusMessage = "Unexpected error occurred. Try again later.";
            $log.error(error);
        });
    };

    $scope.countUp = function () {
        $timeout(function () {
            if ($scope.vncTimeoutCount < $scope.vncTimeout) {
                $scope.vncTimeoutCount++;
                $scope.countUp();
            } else {
                $scope.vncDisabled = false;
                $scope.vncStatusMessage = '';
            }
        }, 1000);
    };

    $scope.getBatteryIconValue = function (handset) {
        var handsetStatus = handset.handsetStatus;
        if (!handsetStatus) {
            return 0;
        }

        if (handsetStatus.online != 'true') {
            return 0;
        }

        var value = handsetStatus.batteryLevel;

        if ($scope.isUndefined(value)) {
            return 0;
        }
        var val = value.slice(0, -1); // remove %
        if (val >= 0 && val < 20) {
            return 3;
        }
        if (val >= 20 && val < 40) {
            return 6;
        }
        if (val >= 40 && val < 60) {
            return 10;
        }
        if (val >= 60 && val < 80) {
            return 14;
        }
        return 18;
    };

    $scope.isSignalStrengthActive = function (value, handset) {
        var handsetStatus = handset.handsetStatus;
        if (!handsetStatus) {
            return false;
        }
        var strength = handsetStatus.signalStrength;
        if (handsetStatus.online != 'true' || $scope.isUndefined(strength) || value > strength) {
            return false;
        }
        return true;
    };

    $scope.lockVisible = function (handset) {
        if (!handset.lock) {
            return true;
        }
        else if (handset.myLock) {
            return true;
        }
        else if (handset.canUnlock) {
            return true;
        }
        else return false;
    };

    $scope.determineUnlockPermission = function (handset) {
        // i locked the devices
        if (handset.myLock) {
            // perform unlock
            $scope.removeLock(handset);
        }
        // admin
        else if (handset.canUnlock) {
            $scope.openAdminUnlockPopup(handset);
        }
        // cannot unlock
        else {
            $scope.openForbidPopup('sm');
        }
    };

    // balance check flags
    $scope.checkBalanceInProgress = false;
    $scope.checkingBalanceForHanset = '';
    $scope.balanceIntervalIndex = 0;
    $scope.balanceCheckSuccess = null;
    $scope.balanceResultHandset = null;

    $scope.checkBalance = function (handset) {
        $scope.checkBalanceInProgress = true;
        $scope.checkingBalanceForHanset = handset.id;
        $scope.balanceResultHandset = handset.id;
        tcuiREST.Balance.checkBalance({msisdn: handset.simCard.msisdn}, function (data) {
                handset.check_balance_timestamp = data.sent;
                $scope.getBalance(handset);
            },
            function (error) {
                $log.error(error);
                $scope.checkBalanceInProgress = false;
                $scope.checkingBalanceForHanset = '';
            });
    };

    $scope.getBalance = function (handset) {
        var check_balance_intervals = [
            1, 2, 3, 4, 5, 10, 20, 30, 45
        ];
        $timeout.cancel(balanceCheckPromise);
        tcuiREST.Balance.getBalance({msisdn: handset.simCard.msisdn}, function (data) {
                if (data.creationTimestamp < handset.check_balance_timestamp && $scope.checkBalanceInProgress == true) {
                    var interval = check_balance_intervals[$scope.balanceIntervalIndex];
                    $scope.balanceIntervalIndex++;
                    //console.log('Time not updated, continuing in: ' + interval + ' seconds');
                    if ($scope.balanceIntervalIndex <= check_balance_intervals.length) {
                        balanceCheckPromise = $timeout(function () {
                            $scope.getBalance(handset);
                        }, interval * 1000);
                    }
                    else {
                        //console.log('balance check failed!');
                        $scope.balanceCheckSuccess = false;
                        $scope.checkBalanceInProgress = false;
                        $scope.checkingBalanceForHanset = '';
                        $scope.balanceIntervalIndex = 0;
                        $timeout.cancel(balanceCheckPromise);
                    }
                }
                else {
                    //console.log('balance check success!');
                    $scope.balanceCheckSuccess = true;
                    $scope.checkBalanceInProgress = false;
                    $scope.checkingBalanceForHanset = '';
                    $scope.balanceIntervalIndex = 0;
                    $timeout.cancel(balanceCheckPromise);
                }
            },
            function (error) {
                $log.error(error);
                $scope.balanceCheckSuccess = false;
                $scope.checkBalanceInProgress = false;
                $scope.checkingBalanceForHanset = '';
                $scope.balanceIntervalIndex = 0;
                $timeout.cancel(balanceCheckPromise);
            });
    };

    $scope.cancelCheckBalance = function () {
        $scope.balanceResultHandset = null;
        $scope.checkBalanceInProgress = false;
        $scope.checkingBalanceForHanset = '';
        $scope.balanceIntervalIndex = 0;
        $timeout.cancel(balanceCheckPromise);
    };

    $scope.openAdminUnlockPopup = function (handset) {
        $("#dialog-message p").html('');
        var confirmText = "<div>Please confirm that you want to remove the lock for user [" + handset.lock.user + "] on the handset for [" + handset.lock.operator + "] with MSISDN [" + handset.lock.msisdn + "]</div>";
        $("#dialog-message").prop('title', 'Confirm unlock');
        $("#dialog-message p").html(confirmText);
        $("#dialog-message").dialog({
            modal: false,
            width: 650,
            buttons: {
                OK: function () {
                    $(this).dialog("close");
                    $scope.removeLock(handset);
                },
                CANCEL: function () {
                    $(this).dialog("close");
                }

            }
        });
    };

    $scope.openVncInfoPopup = function (text) {
        $("#dialog-message p").html('');
        var confirmText = "<div>" + text + "</div>";

        $("#dialog-message").prop('title', 'Information');
        $("#dialog-message p").html(confirmText);
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

    $scope.openForbidPopup = function () {
        $("#dialog-message p").html('');
        $("#dialog-message").prop('title', 'Forbidden');
        $("#dialog-message p").html('You may not unlock this handset');
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

    $scope.isUndefined = function (value) {
        return angular.isUndefined(value) || value === null
    };

    // cancel polling when destroying the controller
    $scope.$on(
        "$destroy",
        function () {
            pushServiceTwo.stop(); // stops ws client
            $timeout.cancel(inactivityTimeoutPromise); // cancel session timeout
            $timeout.cancel(balanceCheckPromise); // cancel balance check timeout
            $scope.vncInSession = false;
            $scope.testcenter = '';
            $scope.handsets = [];
            $scope.selectedHandsets = [];
        }
    );

    function switchToSMSTabWhenTestCenterIsOffline(testcenter) {
        if (testcenter.status == TESTCENTER_OFFLINE_STATUS) {
            $scope.navTabClicked(SMS_MODE);
        }
    };
});
