// util service to pass values between controllers
app.service('appModeService', function ($cookies) {
    var mode_key = 'mode';
    var mode = 'wap';
    var activeMsisdn;
    var activeHandset;

    var setMode = function (newMode) {
        $cookies.put(mode_key, newMode);
        mode = newMode;
    };

    var getMode = function () {
        var modeCookie = $cookies.get(mode_key);
        if (modeCookie && modeCookie !== '') {
            mode = modeCookie;
        }
        return mode;
    };

    var setActiveMsisdn = function (newMsisdn) {
        activeMsisdn = newMsisdn;
    };

    var getActiveMsisdn = function () {
        return activeMsisdn;
    };

    var setActiveHandset = function (newActiveHandset) {
        activeHandset = newActiveHandset;
    };

    var getActiveHandset = function () {
        return activeHandset;
    }

    return {
        getMode: getMode,
        setMode: setMode,
        getActiveMsisdn: getActiveMsisdn,
        setActiveMsisdn: setActiveMsisdn,
        getActiveHandset: getActiveHandset,
        setActiveHandset: setActiveHandset
    };
});
