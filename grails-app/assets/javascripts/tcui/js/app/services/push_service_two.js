app.service('pushServiceTwo',
    function ($q, $timeout) {

        var push_topic = '';

        var getTopic = function () {
            return push_topic;
        };

        var setTopic = function (topic) {
            push_topic = topic;
        };

        var pushService = {}, listener = $q.defer(), socket = {
            client: null,
            stomp: null
        }, messageIds = [];

        pushService.RECONNECT_TIMEOUT = 30000;
        var appPath = $('#appPath').val();
        pushService.SOCKET_URL = appPath + '/info';
        pushService.BROKER = "/app/info";

        var receive = function () {
            return listener.promise;
        };

        var send = function (message) {
            var id = Math.floor(Math.random() * 1000000);
            socket.stomp.send(pushService.BROKER, {
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
            /*if (push_topic == '/testcenters') {
                $rootScope.$broadcast('PUSH_OVERVIEW_INIT_COMPLETED');
            }
            else {
                $rootScope.$broadcast('PUSH_TC_INIT_COMPLETED');
            }*/
            socket.stomp.subscribe(push_topic, function (data) {
                listener.notify(getMessage(data.body));
            });
        };

        var initialize = function () {
            socket.client = new SockJS(pushService.SOCKET_URL);
            socket.stomp = Stomp.over(socket.client);
            socket.stomp.connect({}, startListener);
            socket.stomp.onclose = reconnect;

        };

        var destroy = function () {
            socket.stomp.disconnect();
        };

        // not used
        socket.onclose = function() {
            console.log('****************************Socket closed!************************************');
            stomp.disconnect();
        };

        // not used
        var unsubscribe = function () {
            socket.stomp.unsubscribe(function (data) {
                console.log('Unsubscribed from topic ' + data);
            })
        };

        return {
            getTopic: getTopic,
            setTopic: setTopic,
            receive: receive,
            send: send,
            stop: destroy,
            init: initialize,
            unsubscribe: unsubscribe
        };
    }
);
