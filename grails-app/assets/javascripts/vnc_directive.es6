/**
 * Adds VNC applet to page
 */

$("#vnc-panel").load("../../views/vnc/vnc-viewer.html", function () {
    $("#noVNC_host").val(handset.hostname);
    $("#noVNC_port").val(handset.vncport);
    $("#noVNC_password").val(handset.password);

    $("#noVNC_screen").mouseout(function () {
        Ui.rfb.get_keyboard().set_focused(false);
    }).mouseover(function () {
        Ui.rfb.get_keyboard().set_focused(true);
    });
});

// timeout(function () {
//     if (Ui.load()) {
//         Ui.connect();
//     }
// }, 300);
