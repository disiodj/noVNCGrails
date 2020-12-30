// auth service holding basic info about auth user
app.service('authService', function () {
    var username = '';
    var adminUnlock;
    var extendedSession;

    var setUsername = function (newUsername) {
        username = newUsername;
    };

    var getUsername = function () {
        return username;
    };

    var setAdminUnlock = function (newAdminUnlock) {
        adminUnlock = newAdminUnlock;
    };

    var getAdminUnlock = function () {
        return adminUnlock;
    };

    var setExtendedSession = function (newExtendedSession) {
        extendedSession = newExtendedSession;
    };

    var getExtendedSession = function () {
        return extendedSession;
    };

    return {
        getUsername: getUsername,
        setUsername: setUsername,
        getAdminUnlock: getAdminUnlock,
        setAdminUnlock: setAdminUnlock,
        getExtendedSession : getExtendedSession,
        setExtendedSession: setExtendedSession
    };
});
