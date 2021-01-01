<%--
  Created by IntelliJ IDEA.
  User: gabcugliari
  Date: 31/12/2020
  Time: 00:23
--%>

<%@ page import="com.tucanoo.crm.Handset" contentType="text/html;charset=UTF-8" %>
<html>
<head>
    <title></title>
</head>

<body>
<g:render template="handsetTemplate" model="[handset : com.tucanoo.crm.Handset.getAll()]"/>
<div class="btn-group pull-right" dropdown is-open="status.isopen">
    <button id="settingsButton"  type="button" class="btn btn-sm btn-default dropdown-toggle" ng-disabled="disabled">
        Settings <span class="caret"></span>
    </button>
    <ul class="dropdown-menu" role="menu">
        <li><input id="noVNC_encrypt" type="checkbox"> Encrypt</li>
        <li><input id="noVNC_true_color" type="checkbox" checked>True Color</li>
        <li><input id="noVNC_cursor" type="checkbox"> Local Cursor</li>
        <li><input id="noVNC_clip" type="checkbox"> Clip to Window</li>
        <li><input id="noVNC_shared" type="checkbox"> Shared Mode</li>
        <li><input id="noVNC_view_only" type="checkbox"> View Only</li>
        <li><input id="noVNC_path" type="text" value=""> Path</li>
        <li><input id="noVNC_repeaterID" type="text" value=""> Repeater ID</li>
        <li class="divider"></li>
        <li>
            <label>
                <strong>Style: </strong>
                <select id="noVNC_stylesheet" name="vncStyle">
                    <option value="default">default</option>
                </select>
            </label>
        </li>
        <li>
            <label>
                <strong>Logging: </strong>
                <select id="noVNC_logging" name="vncLogging">
                </select>
            </label>
        </li>
        <li class="divider"></li>
        <li><input type="button" id="noVNC_apply" value="Apply"></li>
    </ul>
</div>
<!-- Connection Panel -->
<div id="noVNC_controls" class="">
    <input type="text" id="noVNC_host" value="at.tc.dimoco.at" />
    <input  id="noVNC_port" value="5915" />
    <input  id="noVNC_password" value="dim2014"/>
    <input id="noVNC_connect_button" type="button" value="Connect" onclick="showVnc()">
</div>
<div id="noVNC_screen">

    <!-- HTML5 Canvas -->
    <div id="noVNC_container" style="text-align: center;">
        <canvas id="noVNC_canvas" width="800px" height="600px">
            Canvas not supported.
        </canvas>
    </div>

    <div id="noVNC_screen_pad" style="display: none;"></div>

    <h1 id="noVNC_logo" style="display: none;">
    </h1>

</div>

<asset:javascript src="tcui/js/vnc/ui.js"/>
<asset:javascript src="tcui/js/vnc/vnc.js"/>
<asset:javascript src="tcui/js/include/rfb.js"/>
<asset:javascript src="tcui/js/include/util.js"/>
<asset:javascript src="tcui/js/include/webutil.js"/>
<asset:javascript src="tcui/js/include/base64.js"/>
<asset:javascript src="tcui/js/include/websock.js"/>
<asset:javascript src="tcui/js/include/des.js"/>
<asset:javascript src="tcui/js/include/input.js"/>
<asset:javascript src="tcui/js/include/display.js"/>

<asset:javascript src="tcui/js/include/jsunzip.js"/>
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
<script>

    var showVnc = function () {
        console.info($D)
        $("#vnc-panel").load("html/vnc-viewer.html", function () {
            console.log("In function load vnc-viewver")
            $("#noVNC_host").value("at.tc.dimoco.at");
            $("#noVNC_port").value("5915");
            $("#noVNC_password").value("dim2014");

            $("#noVNC_screen").mouseout(function () {
                UI.rfb.get_keyboard().set_focused(false);
            }).mouseover(function () {
                UI.rfb.get_keyboard().set_focused(true);
            });
        });
        UI.load();
        UI.connect();
    };
</script>
</body>
</html>