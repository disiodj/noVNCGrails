<!DOCTYPE html>
<html lang="en">
<head>

    <!--
    noVNC example: lightweight example using minimal UI and features

    This is a self-contained file which doesn't import WebUtil or external CSS.

    Copyright (C) 2019 The noVNC Authors
    noVNC is licensed under the MPL 2.0 (see LICENSE.txt)
    This file is licensed under the 2-Clause BSD license (see LICENSE.txt).

    Connect parameters are provided in query string:
        http://example.com/?host=HOST&port=PORT&scale=true
    -->
    <title>noVNC</title>

    <meta charset="utf-8">

    <style>

    body {
        margin: 0;
        background-color: dimgrey;
        height: 100%;
        display: flex;
        flex-direction: column;
    }
    html {
        height: 100%;
    }

    #top_bar {
        background-color: #6e84a3;
        color: white;
        font: bold 12px Helvetica;
        padding: 6px 5px 4px 5px;
        border-bottom: 1px outset;
    }
    #status {
        text-align: center;
    }
    #sendCtrlAltDelButton {
        position: fixed;
        top: 0px;
        right: 0px;
        border: 1px outset;
        padding: 5px 5px 4px 5px;
        cursor: pointer;
    }

    #screen {
        flex: 1; /* fill remaining space */
        overflow: hidden;
    }

    </style>
    <asset:javascript src="/Black.js" />
    <script> var exports = {} </script>
    <asset:javascript src="./core/rfb.js">
        // RFB holds the API to connect and communicate with a VNC server

    %{--        import '../../assets/javascripts/core/rfb.js';--}%

        let rfb;
        let desktopName;

        // When this function is called we have
        // successfully connected to a server
        function connectedToServer(e) {
            status("Connected to " + desktopName);
        }

        // This function is called when we are disconnected
        function disconnectedFromServer(e) {
            if (e.detail.clean) {
                status("Disconnected");
            } else {
                status("Something went wrong, connection is closed");
            }
        }

        // When this function is called, the server requires
        // credentials to authenticate
        function credentialsAreRequired(e) {
            const password = prompt("Password Required:");
            rfb.sendCredentials({ password: password });
        }

        // When this function is called we have received
        // a desktop name from the server
        function updateDesktopName(e) {
            desktopName = e.detail.name;
        }

        // Since most operating systems will catch Ctrl+Alt+Del
        // before they get a chance to be intercepted by the browser,
        // we provide a way to emulate this key sequence.
        function sendCtrlAltDel() {
            rfb.sendCtrlAltDel();
            return false;
        }

        // Show a status text in the top bar
        function status(text) {
            document.getElementById('status').textContent = text;
        }

        // This function extracts the value of one variable from the
        // query string. If the variable isn't defined in the URL
        // it returns the default value instead.
        function readQueryVariable(name, defaultValue) {
            // A URL with a query parameter can look like this:
            // https://www.example.com?myqueryparam=myvalue
            //
            // Note that we use location.href instead of location.search
            // because Firefox < 53 has a bug w.r.t location.search
            const re = new RegExp('.*[?&]' + name + '=([^&#]*)'),
                match = document.location.href.match(re);

            if (match) {
                // We have to decode the URL since want the cleartext value
                return decodeURIComponent(match[1]);
            }

            return defaultValue;
        }

        document.getElementById('sendCtrlAltDelButton')
            .onclick = sendCtrlAltDel;

        // Read parameters specified in the URL query string
        // By default, use the host and port of server that served this file
        const host = readQueryVariable('host', window.location.hostname);
        // let port = readQueryVariable('port', window.location.port);
        let port = '5913';

        // const password = readQueryVariable('password');
        const password = 'dim2014';

        const path = readQueryVariable('path', 'websockify');

        // | | |         | | |
        // | | | Connect | | |
        // v v v         v v v

        status("Connecting");

        // Build the websocket URL used to connect
        let url;
        if (window.location.protocol === "https:") {
            url = 'wss';
        } else {
            url = 'ws';
        }
        // url += '://' + host;
        url += '://de.tc.dimoco.at';

        if(port) {
            url += ':' + port;
        }
        url += '/' + path;

        // Creating a new RFB object will start a new connection
        rfb = new RFB(document.getElementById('noVNC_canvas'), url,
            { credentials: { password: password } });

        // Add listeners to important events from the RFB module
        rfb.addEventListener("connect",  connectedToServer);
        rfb.addEventListener("disconnect", disconnectedFromServer);
        rfb.addEventListener("credentialsrequired", credentialsAreRequired);
        rfb.addEventListener("desktopname", updateDesktopName);

        // Set parameters that can be changed on an active connection
        rfb.viewOnly = readQueryVariable('view_only', false);
        rfb.scaleViewport = readQueryVariable('scale', false);
    </asset:javascript>
</head>

<body>
<div id="top_bar">
    <div id="status">Loading</div>
    <div id="sendCtrlAltDelButton">Send CtrlAltDel</div>
</div>
<div id="screen">
    <!-- This is where the remote screen will appear -->
</div>
</body>
</html>
