app.service('testService',
    function ($q, $timeout) {

        var service = {}, listener = $q.defer(), socket = {
            client: null,
            stomp: null
        }, messageIds = [];

        service.RECONNECT_TIMEOUT = 30000;
        service.SOCKET_ENDPOINT = "/tcui/info";
        service.TC_TOPIC = "/tc_1";
        service.BROKER = "/app/info";

        var receiveTcInfo = function () {
            return listener.promise;
        };

        var send = function (message) {
            var id = Math.floor(Math.random() * 1000000);
            socket.stomp.send(service.BROKER, {
                priority: 9
            }, JSON.stringify({
                message: message
                //id: id
            }));
            messageIds.push(id);
        };

        var reconnect = function () {
            $timeout(function () {
                initialize();
            }, this.RECONNECT_TIMEOUT);
        };

        var getMessage = function (data) {
            var message = JSON.parse(data);
            return message;
        };

        var startListener = function () {
            socket.stomp.subscribe(service.TC_TOPIC, function (data) {
                listener.notify(getMessage(data.body));
            });
        };

        var initialize = function () {
            socket.client = new SockJS(service.SOCKET_ENDPOINT);
            socket.stomp = Stomp.over(socket.client);
            socket.stomp.connect({}, startListener());
            socket.stomp.onclose = reconnect;

        };

        initialize();

        return {
            receiveTcInfo: receiveTcInfo
        };
    }
);
