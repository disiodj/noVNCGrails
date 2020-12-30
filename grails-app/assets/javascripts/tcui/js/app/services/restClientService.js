// REST client service
app.factory('tcuiREST', ['$resource',
    function ($resource) {
        return {
            Testcenter: $resource(window.location.pathname + "rest/testcenters/:testcenterId/:option",
                {testcenterId: '@testcenterId', option: '@option'}, {
                    getTestCenterById: {
                        method: 'GET',
                        params: {}
                    },
                    getTestCenterByIdForUpdate: {
                        method: 'GET',
                        params: {option: 'update'}
                    },
                    getAllTestCenters: {
                        method: 'GET',
                        params: {},
                        isArray: true
                    },
                    update: {
                        method: 'PUT',
                        params: {}
                    }
                }),
            Handset: $resource(window.location.pathname + "rest/handsets/:handsetId", {handsetId: '@handsetId'}, {
                getHandsetById: {
                    method: 'GET',
                    params: {}
                },
                getAllHandsets: {
                    method: 'GET',
                    params: {},
                    isArray: true
                }
            }),
            Sms: $resource(window.location.pathname + "rest/sms/:testcenterId", {testcenterId: '@testcenterId'}, {
                getSmsHistory: {
                    method: 'GET',
                    params: {},
                    isArray: true
                }
            }),
            SmsSend: $resource(window.location.pathname + "rest/smssend", {}, {
                send: {
                    method: 'POST',
                    isArray: true
                }
            }),
            Vnc: $resource(window.location.pathname + "rest/vnc/restart/:handsetId", {handsetId: '@handsetId'}, {
                restart: {
                    method: 'GET',
                    isArray: false
                }
            }),
            Lock: $resource(window.location.pathname + "rest/locks/:param", {param: '@param'}, {
                getLockByIdOrOperatorName: {
                    method: 'GET',
                    params: {}
                },
                getAllLocks: {
                    method: 'GET',
                    params: {},
                    isArray: true
                }
            }),
            User: $resource(window.location.pathname + "rest/users/auth", {}, {
                getAuth: {
                    method: 'GET',
                    isArray: false
                }
            }),
            Balance: $resource(window.location.pathname + "rest/balance/:msisdn/:option", {msisdn: '@msisdn', option: '@option'}, {
                checkBalance: {
                    method: 'GET',
                    params: {option: 'check'},
                    isArray: false
                },
                getBalance: {
                    method: 'GET',
                    params: {option: 'get'},
                    isArray: false
                }
            })
        };
    }
]);
