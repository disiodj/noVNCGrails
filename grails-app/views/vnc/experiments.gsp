<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/html">
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


</head>

<body>
<h1>Check if import, export, require, work</h1>

<div id="screen999">
    <!-- This is where the remote screen will appear -->
</div>
<div>
    <button id="btnblack">Alert black customized</button>
</div>
<div>
    <button id="btnblack2">Size and colour black</button>
</div>
<div>
    <input type="button" value="Click" id="coolbutton"/>
</div>
%{--<asset:javascript src="rfb.es6" type="module" crossorigin="anonymous"/>--}%
<asset:javascript src="Black.js" plugin="typescript-asset-pipeline" />
<asset:javascript src="color.ts" plugin="typescript-asset-pipeline"/>
<asset:javascript src="sizeAndColour.ts" plugin="typescript-asset-pipeline"/>
<asset:javascript src="main.js" plugin="typescript-asset-pipeline"/>

</body>
</html>
