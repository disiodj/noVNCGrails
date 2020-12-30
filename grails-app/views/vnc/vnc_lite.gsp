<!DOCTYPE html>
<html lang="en">
<head>

    <!--
    noVNC example: lightweight example using minimal Ui and features

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
    <script> var exports = {}; </script>
    <script src="https://code.jquery.com/jquery-3.5.1.min.js" integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=" crossorigin="anonymous"></script>
    <asset:javascript src="vnc_lite_javascript.js"/>
    <script type="module" crossorigin="anonymous">
        // Rfb holds the API to connect and communicate with a VNC server

    </script>
</head>

<body>
<div> Cacca</div>
<div id="top_bar">
    <div id="status">Loading</div>
    <div id="sendCtrlAltDelButton">Send CtrlAltDel</div>
</div>
<div id="screen">
    <!-- This is where the remote screen will appear -->
</div>
</body>
</html>
