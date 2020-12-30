app.controller("SmsHistoryController", function ($scope, $routeParams, tcuiREST, $modal, $filter, $timeout, $rootScope, $log, appModeService, Pagination) {

    $scope.tcId = $routeParams.testcenterId;

    $scope.messagesPerPage = {
        value: 10
    };

    $scope.messagesPerPageForVnctab =  8;

    $scope.pagination = Pagination.getNew($scope.messagesPerPage.value);

    $scope.smsMessages = [];
    $scope.smsList = [];
    $scope.smsVncList = [];
    
    $scope.previousRefresh = new Date();
    $scope.textQuery = '';
    $scope.textQueryVnc = '';
    $scope.smsError = '';
    $scope.appMode = 'wap';
    // used to cancel timeout when destroying the controller
    var timeoutPromise;

    $scope.msisdn = '';
    $scope.vncPaging = '0';

    // settings config
    $scope.settingsConfig = {
        refreshInterval: 10, // 10 seconds
        autoRefresh: true
    };

    // search config
    $scope.searchConfig = {
        application: 'ALL',
        direction: 'ALL',
        dtFrom: '',
        dtTo: '',
        partner: '',
        dateFilter: 'TODAY'
    };
    
    $scope.searchConfigVnc = {
        application: 'ALL',
        direction: 'ALL',
        dtFrom: '',
        dtTo: '',
        partner: '',
        dateFilter: 'TODAY'
    };

    $scope.applications = ['ALL', 'TCUI', 'DITESTO'];
    $scope.directions = ['ALL', 'IN', 'OUT'];
    $scope.dateFilter = ['TODAY','7 DAYS', 'ALL'];
    
    $scope.selectDateFilter = function (date) {
        $scope.searchConfig.dateFilter = date;
        $scope.filterListAdvanced();
    };

    $scope.selectApplication = function (app) {
        $scope.searchConfig.application = app;
        $scope.filterListAdvanced();
    };

    $scope.selectDirection = function (direction) {
        $scope.searchConfig.direction = direction;
        $scope.filterListAdvanced();
    };
    
    $scope.selectDateFilterVnc = function (date) {
        $scope.searchConfigVnc.dateFilter = date;
        $scope.filterListAdvanced();
    };

    $scope.selectApplicationVnc = function (app) {
        $scope.searchConfigVnc.application = app;
        $scope.filterListAdvanced();
    };
    
    $scope.updateVncTextQuery = function(query) {
    	$scope.textQueryVnc = query;
    	$scope.filterListAdvanced();
    };

    $scope.selectDirectionVnc = function (direction) {
        $scope.searchConfigVnc.direction = direction;
        $scope.filterListAdvanced();
    };

    // listen for events to refresh history
    $scope.$on('REFRESH_HISTORY', function (event,args) {
        $scope.msisdn = appModeService.getActiveMsisdn();
        $scope.fetchMessages();
    });

    $scope.$on('FILTER_HISTORY', function (event,args) {
        $scope.searchConfig.partner = args;
        $scope.filterListAdvanced();
    });

    $scope.$on('UPDATE_HISTORY_ROW_SIZE', function (event,args) {
        console.log('update row size!');
        $scope.messagesPerPage.value = args;
    });

    $scope.fetchMessages = function () {
        $scope.smsError = '';
        
        tcuiREST.Sms.getSmsHistory({testcenterId: $scope.tcId},function (smslist) {
            $scope.previousRefresh = new Date();
            if (smslist.length) {
                $scope.smsMessages = smslist.reverse();                
                $scope.filterListAdvanced();
            }
            else {
                $scope.smsError = "No messages to display";
            }
        },
        function (error) {
            $log.error(error);
            $scope.smsError = "No messages to display";
        });
    };

    $scope.poll = function () {
        if ($scope.settingsConfig.autoRefresh) {
            $scope.fetchMessages();
            $scope.previousRefresh = new Date();
        }
        timeoutPromise = $timeout($scope.poll, $scope.settingsConfig.refreshInterval * 1000);
    };

    // start polling for new sms
    $scope.poll();

    $scope.determineDateFilter = function (config) {
        var now = new Date();
        var to = new Date();
        to.setHours(23,59,59,59);
        if (config.dateFilter == 'TODAY')
        {
            var midnight = new Date();
            // since midnight
            midnight.setHours(0,0,0);
            // one day ago
            //sinceMidnight.setDate(now.getDate() -1)
            config.dtFrom = midnight;
            config.dtTo = to;
        }
        if (config.dateFilter == '7 DAYS'){
            var sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(now.getDate() - 7);
            sevenDaysAgo.setHours(0,0,0);
            config.dtFrom = sevenDaysAgo;
            config.dtTo = to;
        }
        if (config.dateFilter == 'ALL' ){
        	config.dtFrom = '';
        	config.dtTo = '';
        }
    };

    
    // advanced search filter
    $scope.filterListAdvanced = function () {

        var criteria = {};
        $scope.applicationValues = {'ALL': null, 'TCUI': 'tcui', 'DITESTO': 'ditesto' };
        $scope.directionValues = {'ALL': null, 'IN': 'incoming', 'OUT': 'outgoing' };
        
        var config = appModeService.getMode() == 'wap' ? $scope.searchConfigVnc : $scope.searchConfig;

        // application
        if ($scope.validParameter(config.application)) {
            criteria.application = $scope.applicationValues[config.application];
        }
        // direction
        if ($scope.validParameter(config.direction)) {
            criteria.direction = $scope.directionValues[config.direction];
        }

        if (appModeService.getMode() == 'wap') {
        	$scope.filterVncSmsMessages(criteria);
        }
        else {
        	$scope.filterSmsMessages(criteria);
        }
    };
    
    $scope.filterSmsMessages = function(criteria) {
    	$scope.partners = $scope.searchConfig.partner;
        if($scope.partners != null && $scope.partners.length > 0){
            $scope.smsList = $filter('partners')($scope.smsMessages, $scope.partners);
            $scope.smsList = $filter('filter')($scope.smsList, criteria);
        }
        else {
            $scope.smsList = $filter('filter')($scope.smsMessages, criteria);
        } 
        // date range
        if ($scope.smsList != null && $scope.smsList != undefined && $scope.smsList.length > 0) {
            if(!$scope.isUndefined($scope.searchConfig.dateFilter)){
                $scope.determineDateFilter($scope.searchConfig);
            }
            $scope.smsList = $filter('daterange')($scope.smsList, $scope.searchConfig.dtFrom, $scope.searchConfig.dtTo);           
        }
        $scope.smsList.forEach(function(el) {
        	el.message = el.message.replace(/'/g, "\\'");
        });
        //console.log("filtered sms messages count: " + $scope.smsList.length);
    };
    
    $scope.filterVncSmsMessages = function(criteria) {
    	$scope.smsVncList = $filter('msisdn')($scope.smsMessages, appModeService.getActiveMsisdn());
        $scope.smsVncList = $filter('filter')($scope.smsVncList, criteria);
        // date range
        if ($scope.smsVncList != null && $scope.smsVncList != undefined && $scope.smsVncList.length > 0) {
            if(!$scope.isUndefined($scope.searchConfigVnc.dateFilter)){
                $scope.determineDateFilter($scope.searchConfigVnc);
            }
            $scope.smsVncList = $filter('daterange')($scope.smsVncList, $scope.searchConfigVnc.dtFrom, $scope.searchConfigVnc.dtTo);           
        }
        
        if ($scope.validTextSearchParameter($scope.textQueryVnc)) {
        	$scope.smsVncList = $filter('filter')($scope.smsVncList, {message: $scope.textQueryVnc});
        }
        
        $scope.smsVncList.forEach(function(el) {
        	el.message = el.message.replace(/'/g, "\\'");
        });
        
    	var currentPage = $scope.pagination.page;
        $scope.pagination = Pagination.getNew($scope.messagesPerPageForVnctab, $scope.calculatePaging($scope.smsVncList.length, $scope.messagesPerPageForVnctab));
        $scope.vncPaging = $scope.calculatePaging($scope.smsVncList.length, $scope.messagesPerPageForVnctab);
        
        if(currentPage < $scope.vncPaging) {
        	$scope.pagination.page = currentPage;
        }else {
        	$scope.pagination.page = 0;
        }
    };

    // util method that checks params
    $scope.validParameter = function (value) {
        return value !== undefined && value != null && value != '' && value != 'ALL';
    };
    
    $scope.validTextSearchParameter = function(value) {
    	return value !== undefined && value != null && value != '';
    };

    // cancel polling when destroying the controller
    $scope.$on(
        "$destroy",
        function () {
            $timeout.cancel(timeoutPromise);
        }
    );
    
    $scope.calculatePaging = function(smsLength, messagesPerPage) {
    	return Math.ceil(smsLength / messagesPerPage);
    };     

});
