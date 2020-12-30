/*
 * noVNC: HTML5 VNC client
 * Copyright (C) 2019 The noVNC Authors
 * Licensed under MPL 2.0 (see LICENSE.txt)
 *
 * See README.md for usage and integration instructions.
 */

import * as Log from './util/logging.js';
import _, { l10n } from './localization.es6';
import { isTouchDevice, isSafari, hasScrollbarGutter, dragThreshold }
    from './util/browser.js';
import { setCapture, getPointerEvent } from './util/events.js';
import KeyTable from "./input/keysym.js";
import keysyms from "./input/keysymdef.js";
import Keyboard from "./input/keyboard.js";
import Rfb from "./rfb.es6";
import * as WebUtil from "./webutil.js";

const PAGE_TITLE = "noVNC";

const Ui = {

    connected: false,
    desktopName: "",

    statusTimeout: null,
    hideKeyboardTimeout: null,
    idleControlbarTimeout: null,
    closeControlbarTimeout: null,

    controlbarGrabbed: false,
    controlbarDrag: false,
    controlbarMouseDownClientY: 0,
    controlbarMouseDownOffsetY: 0,

    lastKeyboardinput: null,
    defaultKeyboardinputLen: 100,

    inhibitReconnect: true,
    reconnectCallback: null,
    reconnectPassword: null,

    prime() {
        return WebUtil.initSettings().then(() => {
            if (document.readyState === "interactive" || document.readyState === "complete") {
                return Ui.start();
            }

            return new Promise((resolve, reject) => {
                document.addEventListener('DOMContentLoaded', () => Ui.start().then(resolve).catch(reject));
            });
        });
    },

    // Render default Ui and initialize settings menu
    start() {

        Ui.initSettings();

        // Translate the DOM
        l10n.translateDOM();

        fetch('./package.json')
            .then((response) => {
                if (!response.ok) {
                    throw Error("" + response.status + " " + response.statusText);
                }
                return response.json();
            })
            .then((packageInfo) => {
                Array.from(document.getElementsByClassName('noVNC_version')).forEach(el => el.innerText = packageInfo.version);
            })
            .catch((err) => {
                Log.Error("Couldn't fetch package.json: " + err);
                Array.from(document.getElementsByClassName('noVNC_version_wrapper'))
                    .concat(Array.from(document.getElementsByClassName('noVNC_version_separator')))
                    .forEach(el => el.style.display = 'none');
            });

        // Adapt the interface for touch screen devices
        if (isTouchDevice) {
            document.documentElement.classList.add("noVNC_touch");
            // Remove the address bar
            setTimeout(() => window.scrollTo(0, 1), 100);
        }

        // Restore control bar position
        if (WebUtil.readSetting('controlbar_pos') === 'right') {
            Ui.toggleControlbarSide();
        }

        Ui.initFullscreen();

        // Setup event handlers
        Ui.addControlbarHandlers();
        Ui.addTouchSpecificHandlers();
        Ui.addExtraKeysHandlers();
        Ui.addMachineHandlers();
        Ui.addConnectionControlHandlers();
        Ui.addClipboardHandlers();
        Ui.addSettingsHandlers();
        document.getElementById("noVNC_status")
            .addEventListener('click', Ui.hideStatus);

        // Bootstrap fallback input handler
        Ui.keyboardinputReset();

        Ui.openControlbar();

        Ui.updateVisualState('init');

        document.documentElement.classList.remove("noVNC_loading");

        let autoconnect = WebUtil.getConfigVar('autoconnect', false);
        if (autoconnect === 'true' || autoconnect == '1') {
            autoconnect = true;
            Ui.connect();
        } else {
            autoconnect = false;
            // Show the connect panel on first load unless autoconnecting
            Ui.openConnectPanel();
        }

        return Promise.resolve(Ui.rfb);
    },

    initFullscreen() {
        // Only show the button if fullscreen is properly supported
        // * Safari doesn't support alphanumerical input while in fullscreen
        if (!isSafari() &&
            (document.documentElement.requestFullscreen ||
             document.documentElement.mozRequestFullScreen ||
             document.documentElement.webkitRequestFullscreen ||
             document.body.msRequestFullscreen)) {
            document.getElementById('noVNC_fullscreen_button')
                .classList.remove("noVNC_hidden");
            Ui.addFullscreenHandlers();
        }
    },

    initSettings() {
        // Logging selection dropdown
        const llevels = ['error', 'warn', 'info', 'debug'];
        for (let i = 0; i < llevels.length; i += 1) {
            Ui.addOption(document.getElementById('noVNC_setting_logging'), llevels[i], llevels[i]);
        }

        // Settings with immediate effects
        Ui.initSetting('logging', 'warn');
        Ui.updateLogging();

        // if port == 80 (or 443) then it won't be present and should be
        // set manually
        let port = window.location.port;
        if (!port) {
            if (window.location.protocol.substring(0, 5) == 'https') {
                port = 443;
            } else if (window.location.protocol.substring(0, 4) == 'http') {
                port = 80;
            }
        }

        /* Populate the controls if defaults are provided in the URL */
        Ui.initSetting('host', window.location.hostname);
        Ui.initSetting('port', port);
        Ui.initSetting('encrypt', (window.location.protocol === "https:"));
        Ui.initSetting('view_clip', false);
        Ui.initSetting('resize', 'off');
        Ui.initSetting('quality', 6);
        Ui.initSetting('compression', 2);
        Ui.initSetting('shared', true);
        Ui.initSetting('view_only', false);
        Ui.initSetting('show_dot', false);
        Ui.initSetting('path', 'websockify');
        Ui.initSetting('repeaterID', '');
        Ui.initSetting('reconnect', false);
        Ui.initSetting('reconnect_delay', 5000);

        Ui.setupSettingLabels();
    },
    // Adds a link to the label elements on the corresponding input elements
    setupSettingLabels() {
        const labels = document.getElementsByTagName('LABEL');
        for (let i = 0; i < labels.length; i++) {
            const htmlFor = labels[i].htmlFor;
            if (htmlFor != '') {
                const elem = document.getElementById(htmlFor);
                if (elem) elem.label = labels[i];
            } else {
                // If 'for' isn't set, use the first input element child
                const children = labels[i].children;
                for (let j = 0; j < children.length; j++) {
                    if (children[j].form !== undefined) {
                        children[j].label = labels[i];
                        break;
                    }
                }
            }
        }
    },

/* ------^-------
*     /INIT
* ==============
* EVENT HANDLERS
* ------v------*/

    addControlbarHandlers() {
        document.getElementById("noVNC_control_bar")
            .addEventListener('mousemove', Ui.activateControlbar);
        document.getElementById("noVNC_control_bar")
            .addEventListener('mouseup', Ui.activateControlbar);
        document.getElementById("noVNC_control_bar")
            .addEventListener('mousedown', Ui.activateControlbar);
        document.getElementById("noVNC_control_bar")
            .addEventListener('keydown', Ui.activateControlbar);

        document.getElementById("noVNC_control_bar")
            .addEventListener('mousedown', Ui.keepControlbar);
        document.getElementById("noVNC_control_bar")
            .addEventListener('keydown', Ui.keepControlbar);

        document.getElementById("noVNC_view_drag_button")
            .addEventListener('click', Ui.toggleViewDrag);

        document.getElementById("noVNC_control_bar_handle")
            .addEventListener('mousedown', Ui.controlbarHandleMouseDown);
        document.getElementById("noVNC_control_bar_handle")
            .addEventListener('mouseup', Ui.controlbarHandleMouseUp);
        document.getElementById("noVNC_control_bar_handle")
            .addEventListener('mousemove', Ui.dragControlbarHandle);
        // resize events aren't available for elements
        window.addEventListener('resize', Ui.updateControlbarHandle);

        const exps = document.getElementsByClassName("noVNC_expander");
        for (let i = 0;i < exps.length;i++) {
            exps[i].addEventListener('click', Ui.toggleExpander);
        }
    },

    addTouchSpecificHandlers() {
        document.getElementById("noVNC_keyboard_button")
            .addEventListener('click', Ui.toggleVirtualKeyboard);

        Ui.touchKeyboard = new Keyboard(document.getElementById('noVNC_keyboardinput'));
        Ui.touchKeyboard.onkeyevent = Ui.keyEvent;
        Ui.touchKeyboard.grab();
        document.getElementById("noVNC_keyboardinput")
            .addEventListener('input', Ui.keyInput);
        document.getElementById("noVNC_keyboardinput")
            .addEventListener('focus', Ui.onfocusVirtualKeyboard);
        document.getElementById("noVNC_keyboardinput")
            .addEventListener('blur', Ui.onblurVirtualKeyboard);
        document.getElementById("noVNC_keyboardinput")
            .addEventListener('submit', () => false);

        document.documentElement
            .addEventListener('mousedown', Ui.keepVirtualKeyboard, true);

        document.getElementById("noVNC_control_bar")
            .addEventListener('touchstart', Ui.activateControlbar);
        document.getElementById("noVNC_control_bar")
            .addEventListener('touchmove', Ui.activateControlbar);
        document.getElementById("noVNC_control_bar")
            .addEventListener('touchend', Ui.activateControlbar);
        document.getElementById("noVNC_control_bar")
            .addEventListener('input', Ui.activateControlbar);

        document.getElementById("noVNC_control_bar")
            .addEventListener('touchstart', Ui.keepControlbar);
        document.getElementById("noVNC_control_bar")
            .addEventListener('input', Ui.keepControlbar);

        document.getElementById("noVNC_control_bar_handle")
            .addEventListener('touchstart', Ui.controlbarHandleMouseDown);
        document.getElementById("noVNC_control_bar_handle")
            .addEventListener('touchend', Ui.controlbarHandleMouseUp);
        document.getElementById("noVNC_control_bar_handle")
            .addEventListener('touchmove', Ui.dragControlbarHandle);
    },

    addExtraKeysHandlers() {
        document.getElementById("noVNC_toggle_extra_keys_button")
            .addEventListener('click', Ui.toggleExtraKeys);
        document.getElementById("noVNC_toggle_ctrl_button")
            .addEventListener('click', Ui.toggleCtrl);
        document.getElementById("noVNC_toggle_windows_button")
            .addEventListener('click', Ui.toggleWindows);
        document.getElementById("noVNC_toggle_alt_button")
            .addEventListener('click', Ui.toggleAlt);
        document.getElementById("noVNC_send_tab_button")
            .addEventListener('click', Ui.sendTab);
        document.getElementById("noVNC_send_esc_button")
            .addEventListener('click', Ui.sendEsc);
        document.getElementById("noVNC_send_ctrl_alt_del_button")
            .addEventListener('click', Ui.sendCtrlAltDel);
    },

    addMachineHandlers() {
        document.getElementById("noVNC_shutdown_button")
            .addEventListener('click', () => Ui.rfb.machineShutdown());
        document.getElementById("noVNC_reboot_button")
            .addEventListener('click', () => Ui.rfb.machineReboot());
        document.getElementById("noVNC_reset_button")
            .addEventListener('click', () => Ui.rfb.machineReset());
        document.getElementById("noVNC_power_button")
            .addEventListener('click', Ui.togglePowerPanel);
    },

    addConnectionControlHandlers() {
        document.getElementById("noVNC_disconnect_button")
            .addEventListener('click', Ui.disconnect);
        document.getElementById("noVNC_connect_button")
            .addEventListener('click', Ui.connect);
        document.getElementById("noVNC_cancel_reconnect_button")
            .addEventListener('click', Ui.cancelReconnect);

        document.getElementById("noVNC_credentials_button")
            .addEventListener('click', Ui.setCredentials);
    },

    addClipboardHandlers() {
        document.getElementById("noVNC_clipboard_button")
            .addEventListener('click', Ui.toggleClipboardPanel);
        document.getElementById("noVNC_clipboard_text")
            .addEventListener('change', Ui.clipboardSend);
        document.getElementById("noVNC_clipboard_clear_button")
            .addEventListener('click', Ui.clipboardClear);
    },

    // Add a call to save settings when the element changes,
    // unless the optional parameter changeFunc is used instead.
    addSettingChangeHandler(name, changeFunc) {
        const settingElem = document.getElementById("noVNC_setting_" + name);
        if (changeFunc === undefined) {
            changeFunc = () => Ui.saveSetting(name);
        }
        settingElem.addEventListener('change', changeFunc);
    },

    addSettingsHandlers() {
        document.getElementById("noVNC_settings_button")
            .addEventListener('click', Ui.toggleSettingsPanel);

        Ui.addSettingChangeHandler('encrypt');
        Ui.addSettingChangeHandler('resize');
        Ui.addSettingChangeHandler('resize', Ui.applyResizeMode);
        Ui.addSettingChangeHandler('resize', Ui.updateViewClip);
        Ui.addSettingChangeHandler('quality');
        Ui.addSettingChangeHandler('quality', Ui.updateQuality);
        Ui.addSettingChangeHandler('compression');
        Ui.addSettingChangeHandler('compression', Ui.updateCompression);
        Ui.addSettingChangeHandler('view_clip');
        Ui.addSettingChangeHandler('view_clip', Ui.updateViewClip);
        Ui.addSettingChangeHandler('shared');
        Ui.addSettingChangeHandler('view_only');
        Ui.addSettingChangeHandler('view_only', Ui.updateViewOnly);
        Ui.addSettingChangeHandler('show_dot');
        Ui.addSettingChangeHandler('show_dot', Ui.updateShowDotCursor);
        Ui.addSettingChangeHandler('host');
        Ui.addSettingChangeHandler('port');
        Ui.addSettingChangeHandler('path');
        Ui.addSettingChangeHandler('repeaterID');
        Ui.addSettingChangeHandler('logging');
        Ui.addSettingChangeHandler('logging', Ui.updateLogging);
        Ui.addSettingChangeHandler('reconnect');
        Ui.addSettingChangeHandler('reconnect_delay');
    },

    addFullscreenHandlers() {
        document.getElementById("noVNC_fullscreen_button")
            .addEventListener('click', Ui.toggleFullscreen);

        window.addEventListener('fullscreenchange', Ui.updateFullscreenButton);
        window.addEventListener('mozfullscreenchange', Ui.updateFullscreenButton);
        window.addEventListener('webkitfullscreenchange', Ui.updateFullscreenButton);
        window.addEventListener('msfullscreenchange', Ui.updateFullscreenButton);
    },

/* ------^-------
 * /EVENT HANDLERS
 * ==============
 *     VISUAL
 * ------v------*/

    // Disable/enable controls depending on connection state
    updateVisualState(state) {

        document.documentElement.classList.remove("noVNC_connecting");
        document.documentElement.classList.remove("noVNC_connected");
        document.documentElement.classList.remove("noVNC_disconnecting");
        document.documentElement.classList.remove("noVNC_reconnecting");

        const transitionElem = document.getElementById("noVNC_transition_text");
        switch (state) {
            case 'init':
                break;
            case 'connecting':
                transitionElem.textContent = _("Connecting...");
                document.documentElement.classList.add("noVNC_connecting");
                break;
            case 'connected':
                document.documentElement.classList.add("noVNC_connected");
                break;
            case 'disconnecting':
                transitionElem.textContent = _("Disconnecting...");
                document.documentElement.classList.add("noVNC_disconnecting");
                break;
            case 'disconnected':
                break;
            case 'reconnecting':
                transitionElem.textContent = _("Reconnecting...");
                document.documentElement.classList.add("noVNC_reconnecting");
                break;
            default:
                Log.Error("Invalid visual state: " + state);
                Ui.showStatus(_("Internal error"), 'error');
                return;
        }

        if (Ui.connected) {
            Ui.updateViewClip();

            Ui.disableSetting('encrypt');
            Ui.disableSetting('shared');
            Ui.disableSetting('host');
            Ui.disableSetting('port');
            Ui.disableSetting('path');
            Ui.disableSetting('repeaterID');

            // Hide the controlbar after 2 seconds
            Ui.closeControlbarTimeout = setTimeout(Ui.closeControlbar, 2000);
        } else {
            Ui.enableSetting('encrypt');
            Ui.enableSetting('shared');
            Ui.enableSetting('host');
            Ui.enableSetting('port');
            Ui.enableSetting('path');
            Ui.enableSetting('repeaterID');
            Ui.updatePowerButton();
            Ui.keepControlbar();
        }

        // State change closes dialogs as they may not be relevant
        // anymore
        Ui.closeAllPanels();
        document.getElementById('noVNC_credentials_dlg')
            .classList.remove('noVNC_open');
    },

    showStatus(text, statusType, time) {
        const statusElem = document.getElementById('noVNC_status');

        if (typeof statusType === 'undefined') {
            statusType = 'normal';
        }

        // Don't overwrite more severe visible statuses and never
        // errors. Only shows the first error.
        if (statusElem.classList.contains("noVNC_open")) {
            if (statusElem.classList.contains("noVNC_status_error")) {
                return;
            }
            if (statusElem.classList.contains("noVNC_status_warn") &&
                statusType === 'normal') {
                return;
            }
        }

        clearTimeout(Ui.statusTimeout);

        switch (statusType) {
            case 'error':
                statusElem.classList.remove("noVNC_status_warn");
                statusElem.classList.remove("noVNC_status_normal");
                statusElem.classList.add("noVNC_status_error");
                break;
            case 'warning':
            case 'warn':
                statusElem.classList.remove("noVNC_status_error");
                statusElem.classList.remove("noVNC_status_normal");
                statusElem.classList.add("noVNC_status_warn");
                break;
            case 'normal':
            case 'info':
            default:
                statusElem.classList.remove("noVNC_status_error");
                statusElem.classList.remove("noVNC_status_warn");
                statusElem.classList.add("noVNC_status_normal");
                break;
        }

        statusElem.textContent = text;
        statusElem.classList.add("noVNC_open");

        // If no time was specified, show the status for 1.5 seconds
        if (typeof time === 'undefined') {
            time = 1500;
        }

        // Error messages do not timeout
        if (statusType !== 'error') {
            Ui.statusTimeout = window.setTimeout(Ui.hideStatus, time);
        }
    },

    hideStatus() {
        clearTimeout(Ui.statusTimeout);
        document.getElementById('noVNC_status').classList.remove("noVNC_open");
    },

    activateControlbar(event) {
        clearTimeout(Ui.idleControlbarTimeout);
        // We manipulate the anchor instead of the actual control
        // bar in order to avoid creating new a stacking group
        document.getElementById('noVNC_control_bar_anchor')
            .classList.remove("noVNC_idle");
        Ui.idleControlbarTimeout = window.setTimeout(Ui.idleControlbar, 2000);
    },

    idleControlbar() {
        // Don't fade if a child of the control bar has focus
        if (document.getElementById('noVNC_control_bar')
            .contains(document.activeElement) && document.hasFocus()) {
            Ui.activateControlbar();
            return;
        }

        document.getElementById('noVNC_control_bar_anchor')
            .classList.add("noVNC_idle");
    },

    keepControlbar() {
        clearTimeout(Ui.closeControlbarTimeout);
    },

    openControlbar() {
        document.getElementById('noVNC_control_bar')
            .classList.add("noVNC_open");
    },

    closeControlbar() {
        Ui.closeAllPanels();
        document.getElementById('noVNC_control_bar')
            .classList.remove("noVNC_open");
        Ui.rfb.focus();
    },

    toggleControlbar() {
        if (document.getElementById('noVNC_control_bar')
            .classList.contains("noVNC_open")) {
            Ui.closeControlbar();
        } else {
            Ui.openControlbar();
        }
    },

    toggleControlbarSide() {
        // Temporarily disable animation, if bar is displayed, to avoid weird
        // movement. The transitionend-event will not fire when display=none.
        const bar = document.getElementById('noVNC_control_bar');
        const barDisplayStyle = window.getComputedStyle(bar).display;
        if (barDisplayStyle !== 'none') {
            bar.style.transitionDuration = '0s';
            bar.addEventListener('transitionend', () => bar.style.transitionDuration = '');
        }

        const anchor = document.getElementById('noVNC_control_bar_anchor');
        if (anchor.classList.contains("noVNC_right")) {
            WebUtil.writeSetting('controlbar_pos', 'left');
            anchor.classList.remove("noVNC_right");
        } else {
            WebUtil.writeSetting('controlbar_pos', 'right');
            anchor.classList.add("noVNC_right");
        }

        // Consider this a movement of the handle
        Ui.controlbarDrag = true;
    },

    showControlbarHint(show) {
        const hint = document.getElementById('noVNC_control_bar_hint');
        if (show) {
            hint.classList.add("noVNC_active");
        } else {
            hint.classList.remove("noVNC_active");
        }
    },

    dragControlbarHandle(e) {
        if (!Ui.controlbarGrabbed) return;

        const ptr = getPointerEvent(e);

        const anchor = document.getElementById('noVNC_control_bar_anchor');
        if (ptr.clientX < (window.innerWidth * 0.1)) {
            if (anchor.classList.contains("noVNC_right")) {
                Ui.toggleControlbarSide();
            }
        } else if (ptr.clientX > (window.innerWidth * 0.9)) {
            if (!anchor.classList.contains("noVNC_right")) {
                Ui.toggleControlbarSide();
            }
        }

        if (!Ui.controlbarDrag) {
            const dragDistance = Math.abs(ptr.clientY - Ui.controlbarMouseDownClientY);

            if (dragDistance < dragThreshold) return;

            Ui.controlbarDrag = true;
        }

        const eventY = ptr.clientY - Ui.controlbarMouseDownOffsetY;

        Ui.moveControlbarHandle(eventY);

        e.preventDefault();
        e.stopPropagation();
        Ui.keepControlbar();
        Ui.activateControlbar();
    },

    // Move the handle but don't allow any position outside the bounds
    moveControlbarHandle(viewportRelativeY) {
        const handle = document.getElementById("noVNC_control_bar_handle");
        const handleHeight = handle.getBoundingClientRect().height;
        const controlbarBounds = document.getElementById("noVNC_control_bar")
            .getBoundingClientRect();
        const margin = 10;

        // These heights need to be non-zero for the below logic to work
        if (handleHeight === 0 || controlbarBounds.height === 0) {
            return;
        }

        let newY = viewportRelativeY;

        // Check if the coordinates are outside the control bar
        if (newY < controlbarBounds.top + margin) {
            // Force coordinates to be below the top of the control bar
            newY = controlbarBounds.top + margin;

        } else if (newY > controlbarBounds.top +
                   controlbarBounds.height - handleHeight - margin) {
            // Force coordinates to be above the bottom of the control bar
            newY = controlbarBounds.top +
                controlbarBounds.height - handleHeight - margin;
        }

        // Corner case: control bar too small for stable position
        if (controlbarBounds.height < (handleHeight + margin * 2)) {
            newY = controlbarBounds.top +
                (controlbarBounds.height - handleHeight) / 2;
        }

        // The transform needs coordinates that are relative to the parent
        const parentRelativeY = newY - controlbarBounds.top;
        handle.style.transform = "translateY(" + parentRelativeY + "px)";
    },

    updateControlbarHandle() {
        // Since the control bar is fixed on the viewport and not the page,
        // the move function expects coordinates relative the the viewport.
        const handle = document.getElementById("noVNC_control_bar_handle");
        const handleBounds = handle.getBoundingClientRect();
        Ui.moveControlbarHandle(handleBounds.top);
    },

    controlbarHandleMouseUp(e) {
        if ((e.type == "mouseup") && (e.button != 0)) return;

        // mouseup and mousedown on the same place toggles the controlbar
        if (Ui.controlbarGrabbed && !Ui.controlbarDrag) {
            Ui.toggleControlbar();
            e.preventDefault();
            e.stopPropagation();
            Ui.keepControlbar();
            Ui.activateControlbar();
        }
        Ui.controlbarGrabbed = false;
        Ui.showControlbarHint(false);
    },

    controlbarHandleMouseDown(e) {
        if ((e.type == "mousedown") && (e.button != 0)) return;

        const ptr = getPointerEvent(e);

        const handle = document.getElementById("noVNC_control_bar_handle");
        const bounds = handle.getBoundingClientRect();

        // Touch events have implicit capture
        if (e.type === "mousedown") {
            setCapture(handle);
        }

        Ui.controlbarGrabbed = true;
        Ui.controlbarDrag = false;

        Ui.showControlbarHint(true);

        Ui.controlbarMouseDownClientY = ptr.clientY;
        Ui.controlbarMouseDownOffsetY = ptr.clientY - bounds.top;
        e.preventDefault();
        e.stopPropagation();
        Ui.keepControlbar();
        Ui.activateControlbar();
    },

    toggleExpander(e) {
        if (this.classList.contains("noVNC_open")) {
            this.classList.remove("noVNC_open");
        } else {
            this.classList.add("noVNC_open");
        }
    },

/* ------^-------
 *    /VISUAL
 * ==============
 *    SETTINGS
 * ------v------*/

    // Initial page load read/initialization of settings
    initSetting(name, defVal) {
        // Check Query string followed by cookie
        let val = WebUtil.getConfigVar(name);
        if (val === null) {
            val = WebUtil.readSetting(name, defVal);
        }
        WebUtil.setSetting(name, val);
        Ui.updateSetting(name);
        return val;
    },

    // Set the new value, update and disable form control setting
    forceSetting(name, val) {
        WebUtil.setSetting(name, val);
        Ui.updateSetting(name);
        Ui.disableSetting(name);
    },

    // Update cookie and form control setting. If value is not set, then
    // updates from control to current cookie setting.
    updateSetting(name) {

        // Update the settings control
        let value = Ui.getSetting(name);

        const ctrl = document.getElementById('noVNC_setting_' + name);
        if (ctrl.type === 'checkbox') {
            ctrl.checked = value;

        } else if (typeof ctrl.options !== 'undefined') {
            for (let i = 0; i < ctrl.options.length; i += 1) {
                if (ctrl.options[i].value === value) {
                    ctrl.selectedIndex = i;
                    break;
                }
            }
        } else {
            ctrl.value = value;
        }
    },

    // Save control setting to cookie
    saveSetting(name) {
        const ctrl = document.getElementById('noVNC_setting_' + name);
        let val;
        if (ctrl.type === 'checkbox') {
            val = ctrl.checked;
        } else if (typeof ctrl.options !== 'undefined') {
            val = ctrl.options[ctrl.selectedIndex].value;
        } else {
            val = ctrl.value;
        }
        WebUtil.writeSetting(name, val);
        //Log.Debug("Setting saved '" + name + "=" + val + "'");
        return val;
    },

    // Read form control compatible setting from cookie
    getSetting(name) {
        const ctrl = document.getElementById('noVNC_setting_' + name);
        let val = WebUtil.readSetting(name);
        if (typeof val !== 'undefined' && val !== null && ctrl.type === 'checkbox') {
            if (val.toString().toLowerCase() in {'0': 1, 'no': 1, 'false': 1}) {
                val = false;
            } else {
                val = true;
            }
        }
        return val;
    },

    // These helpers compensate for the lack of parent-selectors and
    // previous-sibling-selectors in CSS which are needed when we want to
    // disable the labels that belong to disabled input elements.
    disableSetting(name) {
        const ctrl = document.getElementById('noVNC_setting_' + name);
        ctrl.disabled = true;
        ctrl.label.classList.add('noVNC_disabled');
    },

    enableSetting(name) {
        const ctrl = document.getElementById('noVNC_setting_' + name);
        ctrl.disabled = false;
        ctrl.label.classList.remove('noVNC_disabled');
    },

/* ------^-------
 *   /SETTINGS
 * ==============
 *    PANELS
 * ------v------*/

    closeAllPanels() {
        Ui.closeSettingsPanel();
        Ui.closePowerPanel();
        Ui.closeClipboardPanel();
        Ui.closeExtraKeys();
    },

/* ------^-------
 *   /PANELS
 * ==============
 * SETTINGS (panel)
 * ------v------*/

    openSettingsPanel() {
        Ui.closeAllPanels();
        Ui.openControlbar();

        // Refresh Ui elements from saved cookies
        Ui.updateSetting('encrypt');
        Ui.updateSetting('view_clip');
        Ui.updateSetting('resize');
        Ui.updateSetting('quality');
        Ui.updateSetting('compression');
        Ui.updateSetting('shared');
        Ui.updateSetting('view_only');
        Ui.updateSetting('path');
        Ui.updateSetting('repeaterID');
        Ui.updateSetting('logging');
        Ui.updateSetting('reconnect');
        Ui.updateSetting('reconnect_delay');

        document.getElementById('noVNC_settings')
            .classList.add("noVNC_open");
        document.getElementById('noVNC_settings_button')
            .classList.add("noVNC_selected");
    },

    closeSettingsPanel() {
        document.getElementById('noVNC_settings')
            .classList.remove("noVNC_open");
        document.getElementById('noVNC_settings_button')
            .classList.remove("noVNC_selected");
    },

    toggleSettingsPanel() {
        if (document.getElementById('noVNC_settings')
            .classList.contains("noVNC_open")) {
            Ui.closeSettingsPanel();
        } else {
            Ui.openSettingsPanel();
        }
    },

/* ------^-------
 *   /SETTINGS
 * ==============
 *     POWER
 * ------v------*/

    openPowerPanel() {
        Ui.closeAllPanels();
        Ui.openControlbar();

        document.getElementById('noVNC_power')
            .classList.add("noVNC_open");
        document.getElementById('noVNC_power_button')
            .classList.add("noVNC_selected");
    },

    closePowerPanel() {
        document.getElementById('noVNC_power')
            .classList.remove("noVNC_open");
        document.getElementById('noVNC_power_button')
            .classList.remove("noVNC_selected");
    },

    togglePowerPanel() {
        if (document.getElementById('noVNC_power')
            .classList.contains("noVNC_open")) {
            Ui.closePowerPanel();
        } else {
            Ui.openPowerPanel();
        }
    },

    // Disable/enable power button
    updatePowerButton() {
        if (Ui.connected &&
            Ui.rfb.capabilities.power &&
            !Ui.rfb.viewOnly) {
            document.getElementById('noVNC_power_button')
                .classList.remove("noVNC_hidden");
        } else {
            document.getElementById('noVNC_power_button')
                .classList.add("noVNC_hidden");
            // Close power panel if open
            Ui.closePowerPanel();
        }
    },

/* ------^-------
 *    /POWER
 * ==============
 *   CLIPBOARD
 * ------v------*/

    openClipboardPanel() {
        Ui.closeAllPanels();
        Ui.openControlbar();

        document.getElementById('noVNC_clipboard')
            .classList.add("noVNC_open");
        document.getElementById('noVNC_clipboard_button')
            .classList.add("noVNC_selected");
    },

    closeClipboardPanel() {
        document.getElementById('noVNC_clipboard')
            .classList.remove("noVNC_open");
        document.getElementById('noVNC_clipboard_button')
            .classList.remove("noVNC_selected");
    },

    toggleClipboardPanel() {
        if (document.getElementById('noVNC_clipboard')
            .classList.contains("noVNC_open")) {
            Ui.closeClipboardPanel();
        } else {
            Ui.openClipboardPanel();
        }
    },

    clipboardReceive(e) {
        Log.Debug(">> Ui.clipboardReceive: " + e.detail.text.substr(0, 40) + "...");
        document.getElementById('noVNC_clipboard_text').value = e.detail.text;
        Log.Debug("<< Ui.clipboardReceive");
    },

    clipboardClear() {
        document.getElementById('noVNC_clipboard_text').value = "";
        Ui.rfb.clipboardPasteFrom("");
    },

    clipboardSend() {
        const text = document.getElementById('noVNC_clipboard_text').value;
        Log.Debug(">> Ui.clipboardSend: " + text.substr(0, 40) + "...");
        Ui.rfb.clipboardPasteFrom(text);
        Log.Debug("<< Ui.clipboardSend");
    },

/* ------^-------
 *  /CLIPBOARD
 * ==============
 *  CONNECTION
 * ------v------*/

    openConnectPanel() {
        document.getElementById('noVNC_connect_dlg')
            .classList.add("noVNC_open");
    },

    closeConnectPanel() {
        document.getElementById('noVNC_connect_dlg')
            .classList.remove("noVNC_open");
    },

    connect(event, password) {

        // Ignore when rfb already exists
        if (typeof Ui.rfb !== 'undefined') {
            return;
        }

        let host = Ui.getSetting('host');
        let port = Ui.getSetting('port');
        const path = Ui.getSetting('path');

        if (typeof password === 'undefined') {
            password = WebUtil.getConfigVar('password');
            Ui.reconnectPassword = password;
        }

        if (password === null) {
            password = undefined;
        }

        Ui.hideStatus();

        if (!host) {
            Log.Error("Can't connect when host is: " + host);
            Ui.showStatus(_("Must set host"), 'error');
            return;
        }

        Ui.closeConnectPanel();

        Ui.updateVisualState('connecting');

        let url;

        url = Ui.getSetting('encrypt') ? 'wss' : 'ws';




       // Add for testing purpose, to be removed!!!
        host = "at.tc.dimoco.at";
        // let port = readQueryVariable('port', window.location.port);
        port = '5915';
        // Add for testing purpose, to be removed!!!



        url += '://' + host;
        if (port) {
            url += ':' + port;
        }
        url += '/' + path;

        Ui.rfb = new Rfb(document.getElementById('screen'), url,
                         { shared: Ui.getSetting('shared'),
                           repeaterID: Ui.getSetting('repeaterID'),
                           credentials: { password: password } });
        Ui.rfb.addEventListener("connect", Ui.connectFinished);
        Ui.rfb.addEventListener("disconnect", Ui.disconnectFinished);
        Ui.rfb.addEventListener("credentialsrequired", Ui.credentials);
        Ui.rfb.addEventListener("securityfailure", Ui.securityFailed);
        Ui.rfb.addEventListener("capabilities", Ui.updatePowerButton);
        Ui.rfb.addEventListener("clipboard", Ui.clipboardReceive);
        Ui.rfb.addEventListener("bell", Ui.bell);
        Ui.rfb.addEventListener("desktopname", Ui.updateDesktopName);
        Ui.rfb.clipViewport = Ui.getSetting('view_clip');
        Ui.rfb.scaleViewport = Ui.getSetting('resize') === 'scale';
        Ui.rfb.resizeSession = Ui.getSetting('resize') === 'remote';
        Ui.rfb.qualityLevel = parseInt(Ui.getSetting('quality'));
        Ui.rfb.compressionLevel = parseInt(Ui.getSetting('compression'));
        Ui.rfb.showDotCursor = Ui.getSetting('show_dot');

        Ui.updateViewOnly(); // requires Ui.rfb
    },

    disconnect() {
        Ui.rfb.disconnect();

        Ui.connected = false;

        // Disable automatic reconnecting
        Ui.inhibitReconnect = true;

        Ui.updateVisualState('disconnecting');

        // Don't display the connection settings until we're actually disconnected
    },

    reconnect() {
        Ui.reconnectCallback = null;

        // if reconnect has been disabled in the meantime, do nothing.
        if (Ui.inhibitReconnect) {
            return;
        }

        Ui.connect(null, Ui.reconnectPassword);
    },

    cancelReconnect() {
        if (Ui.reconnectCallback !== null) {
            clearTimeout(Ui.reconnectCallback);
            Ui.reconnectCallback = null;
        }

        Ui.updateVisualState('disconnected');

        Ui.openControlbar();
        Ui.openConnectPanel();
    },

    connectFinished(e) {
        Ui.connected = true;
        Ui.inhibitReconnect = false;

        let msg;
        if (Ui.getSetting('encrypt')) {
            msg = _("Connected (encrypted) to ") + Ui.desktopName;
        } else {
            msg = _("Connected (unencrypted) to ") + Ui.desktopName;
        }
        Ui.showStatus(msg);
        Ui.updateVisualState('connected');

        // Do this last because it can only be used on rendered elements
        Ui.rfb.focus();
    },

    disconnectFinished(e) {
        const wasConnected = Ui.connected;

        // This variable is ideally set when disconnection starts, but
        // when the disconnection isn't clean or if it is initiated by
        // the server, we need to do it here as well since
        // Ui.disconnect() won't be used in those cases.
        Ui.connected = false;

        Ui.rfb = undefined;

        if (!e.detail.clean) {
            Ui.updateVisualState('disconnected');
            if (wasConnected) {
                Ui.showStatus(_("Something went wrong, connection is closed"),
                              'error');
            } else {
                Ui.showStatus(_("Failed to connect to server"), 'error');
            }
        } else if (Ui.getSetting('reconnect', false) === true && !Ui.inhibitReconnect) {
            Ui.updateVisualState('reconnecting');

            const delay = parseInt(Ui.getSetting('reconnect_delay'));
            Ui.reconnectCallback = setTimeout(Ui.reconnect, delay);
            return;
        } else {
            Ui.updateVisualState('disconnected');
            Ui.showStatus(_("Disconnected"), 'normal');
        }

        document.title = PAGE_TITLE;

        Ui.openControlbar();
        Ui.openConnectPanel();
    },

    securityFailed(e) {
        let msg = "";
        // On security failures we might get a string with a reason
        // directly from the server. Note that we can't control if
        // this string is translated or not.
        if ('reason' in e.detail) {
            msg = _("New connection has been rejected with reason: ") +
                e.detail.reason;
        } else {
            msg = _("New connection has been rejected");
        }
        Ui.showStatus(msg, 'error');
    },

/* ------^-------
 *  /CONNECTION
 * ==============
 *   PASSWORD
 * ------v------*/

    credentials(e) {
        // FIXME: handle more types

        document.getElementById("noVNC_username_block").classList.remove("noVNC_hidden");
        document.getElementById("noVNC_password_block").classList.remove("noVNC_hidden");

        let inputFocus = "none";
        if (e.detail.types.indexOf("username") === -1) {
            document.getElementById("noVNC_username_block").classList.add("noVNC_hidden");
        } else {
            inputFocus = inputFocus === "none" ? "noVNC_username_input" : inputFocus;
        }
        if (e.detail.types.indexOf("password") === -1) {
            document.getElementById("noVNC_password_block").classList.add("noVNC_hidden");
        } else {
            inputFocus = inputFocus === "none" ? "noVNC_password_input" : inputFocus;
        }
        document.getElementById('noVNC_credentials_dlg')
            .classList.add('noVNC_open');

        setTimeout(() => document
            .getElementById(inputFocus).focus(), 100);

        Log.Warn("Server asked for credentials");
        Ui.showStatus(_("Credentials are required"), "warning");
    },

    setCredentials(e) {
        // Prevent actually submitting the form
        e.preventDefault();

        let inputElemUsername = document.getElementById('noVNC_username_input');
        const username = inputElemUsername.value;

        let inputElemPassword = document.getElementById('noVNC_password_input');
        const password = inputElemPassword.value;
        // Clear the input after reading the password
        inputElemPassword.value = "";

        Ui.rfb.sendCredentials({ username: username, password: password });
        Ui.reconnectPassword = password;
        document.getElementById('noVNC_credentials_dlg')
            .classList.remove('noVNC_open');
    },

/* ------^-------
 *  /PASSWORD
 * ==============
 *   FULLSCREEN
 * ------v------*/

    toggleFullscreen() {
        if (document.fullscreenElement || // alternative standard method
            document.mozFullScreenElement || // currently working methods
            document.webkitFullscreenElement ||
            document.msFullscreenElement) {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        } else {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            } else if (document.body.msRequestFullscreen) {
                document.body.msRequestFullscreen();
            }
        }
        Ui.updateFullscreenButton();
    },

    updateFullscreenButton() {
        if (document.fullscreenElement || // alternative standard method
            document.mozFullScreenElement || // currently working methods
            document.webkitFullscreenElement ||
            document.msFullscreenElement ) {
            document.getElementById('noVNC_fullscreen_button')
                .classList.add("noVNC_selected");
        } else {
            document.getElementById('noVNC_fullscreen_button')
                .classList.remove("noVNC_selected");
        }
    },

/* ------^-------
 *  /FULLSCREEN
 * ==============
 *     RESIZE
 * ------v------*/

    // Apply remote resizing or local scaling
    applyResizeMode() {
        if (!Ui.rfb) return;

        Ui.rfb.scaleViewport = Ui.getSetting('resize') === 'scale';
        Ui.rfb.resizeSession = Ui.getSetting('resize') === 'remote';
    },

/* ------^-------
 *    /RESIZE
 * ==============
 * VIEW CLIPPING
 * ------v------*/

    // Update viewport clipping property for the connection. The normal
    // case is to get the value from the setting. There are special cases
    // for when the viewport is scaled or when a touch device is used.
    updateViewClip() {
        if (!Ui.rfb) return;

        const scaling = Ui.getSetting('resize') === 'scale';

        if (scaling) {
            // Can't be clipping if viewport is scaled to fit
            Ui.forceSetting('view_clip', false);
            Ui.rfb.clipViewport  = false;
        } else if (!hasScrollbarGutter) {
            // Some platforms have scrollbars that are difficult
            // to use in our case, so we always use our own panning
            Ui.forceSetting('view_clip', true);
            Ui.rfb.clipViewport = true;
        } else {
            Ui.enableSetting('view_clip');
            Ui.rfb.clipViewport = Ui.getSetting('view_clip');
        }

        // Changing the viewport may change the state of
        // the dragging button
        Ui.updateViewDrag();
    },

/* ------^-------
 * /VIEW CLIPPING
 * ==============
 *    VIEWDRAG
 * ------v------*/

    toggleViewDrag() {
        if (!Ui.rfb) return;

        Ui.rfb.dragViewport = !Ui.rfb.dragViewport;
        Ui.updateViewDrag();
    },

    updateViewDrag() {
        if (!Ui.connected) return;

        const viewDragButton = document.getElementById('noVNC_view_drag_button');

        if (!Ui.rfb.clipViewport && Ui.rfb.dragViewport) {
            // We are no longer clipping the viewport. Make sure
            // viewport drag isn't active when it can't be used.
            Ui.rfb.dragViewport = false;
        }

        if (Ui.rfb.dragViewport) {
            viewDragButton.classList.add("noVNC_selected");
        } else {
            viewDragButton.classList.remove("noVNC_selected");
        }

        if (Ui.rfb.clipViewport) {
            viewDragButton.classList.remove("noVNC_hidden");
        } else {
            viewDragButton.classList.add("noVNC_hidden");
        }
    },

/* ------^-------
 *   /VIEWDRAG
 * ==============
 *    QUALITY
 * ------v------*/

    updateQuality() {
        if (!Ui.rfb) return;

        Ui.rfb.qualityLevel = parseInt(Ui.getSetting('quality'));
    },

/* ------^-------
 *   /QUALITY
 * ==============
 *  COMPRESSION
 * ------v------*/

    updateCompression() {
        if (!Ui.rfb) return;

        Ui.rfb.compressionLevel = parseInt(Ui.getSetting('compression'));
    },

/* ------^-------
 *  /COMPRESSION
 * ==============
 *    KEYBOARD
 * ------v------*/

    showVirtualKeyboard() {
        if (!isTouchDevice) return;

        const input = document.getElementById('noVNC_keyboardinput');

        if (document.activeElement == input) return;

        input.focus();

        try {
            const l = input.value.length;
            // Move the caret to the end
            input.setSelectionRange(l, l);
        } catch (err) {
            // setSelectionRange is undefined in Google Chrome
        }
    },

    hideVirtualKeyboard() {
        if (!isTouchDevice) return;

        const input = document.getElementById('noVNC_keyboardinput');

        if (document.activeElement != input) return;

        input.blur();
    },

    toggleVirtualKeyboard() {
        if (document.getElementById('noVNC_keyboard_button')
            .classList.contains("noVNC_selected")) {
            Ui.hideVirtualKeyboard();
        } else {
            Ui.showVirtualKeyboard();
        }
    },

    onfocusVirtualKeyboard(event) {
        document.getElementById('noVNC_keyboard_button')
            .classList.add("noVNC_selected");
        if (Ui.rfb) {
            Ui.rfb.focusOnClick = false;
        }
    },

    onblurVirtualKeyboard(event) {
        document.getElementById('noVNC_keyboard_button')
            .classList.remove("noVNC_selected");
        if (Ui.rfb) {
            Ui.rfb.focusOnClick = true;
        }
    },

    keepVirtualKeyboard(event) {
        const input = document.getElementById('noVNC_keyboardinput');

        // Only prevent focus change if the virtual keyboard is active
        if (document.activeElement != input) {
            return;
        }

        // Only allow focus to move to other elements that need
        // focus to function properly
        if (event.target.form !== undefined) {
            switch (event.target.type) {
                case 'text':
                case 'email':
                case 'search':
                case 'password':
                case 'tel':
                case 'url':
                case 'textarea':
                case 'select-one':
                case 'select-multiple':
                    return;
            }
        }

        event.preventDefault();
    },

    keyboardinputReset() {
        const kbi = document.getElementById('noVNC_keyboardinput');
        kbi.value = new Array(Ui.defaultKeyboardinputLen).join("_");
        Ui.lastKeyboardinput = kbi.value;
    },

    keyEvent(keysym, code, down) {
        if (!Ui.rfb) return;

        Ui.rfb.sendKey(keysym, code, down);
    },

    // When normal keyboard events are left uncought, use the input events from
    // the keyboardinput element instead and generate the corresponding key events.
    // This code is required since some browsers on Android are inconsistent in
    // sending keyCodes in the normal keyboard events when using on screen keyboards.
    keyInput(event) {

        if (!Ui.rfb) return;

        const newValue = event.target.value;

        if (!Ui.lastKeyboardinput) {
            Ui.keyboardinputReset();
        }
        const oldValue = Ui.lastKeyboardinput;

        let newLen;
        try {
            // Try to check caret position since whitespace at the end
            // will not be considered by value.length in some browsers
            newLen = Math.max(event.target.selectionStart, newValue.length);
        } catch (err) {
            // selectionStart is undefined in Google Chrome
            newLen = newValue.length;
        }
        const oldLen = oldValue.length;

        let inputs = newLen - oldLen;
        let backspaces = inputs < 0 ? -inputs : 0;

        // Compare the old string with the new to account for
        // text-corrections or other input that modify existing text
        for (let i = 0; i < Math.min(oldLen, newLen); i++) {
            if (newValue.charAt(i) != oldValue.charAt(i)) {
                inputs = newLen - i;
                backspaces = oldLen - i;
                break;
            }
        }

        // Send the key events
        for (let i = 0; i < backspaces; i++) {
            Ui.rfb.sendKey(KeyTable.XK_BackSpace, "Backspace");
        }
        for (let i = newLen - inputs; i < newLen; i++) {
            Ui.rfb.sendKey(keysyms.lookup(newValue.charCodeAt(i)));
        }

        // Control the text content length in the keyboardinput element
        if (newLen > 2 * Ui.defaultKeyboardinputLen) {
            Ui.keyboardinputReset();
        } else if (newLen < 1) {
            // There always have to be some text in the keyboardinput
            // element with which backspace can interact.
            Ui.keyboardinputReset();
            // This sometimes causes the keyboard to disappear for a second
            // but it is required for the android keyboard to recognize that
            // text has been added to the field
            event.target.blur();
            // This has to be ran outside of the input handler in order to work
            setTimeout(event.target.focus.bind(event.target), 0);
        } else {
            Ui.lastKeyboardinput = newValue;
        }
    },

/* ------^-------
 *   /KEYBOARD
 * ==============
 *   EXTRA KEYS
 * ------v------*/

    openExtraKeys() {
        Ui.closeAllPanels();
        Ui.openControlbar();

        document.getElementById('noVNC_modifiers')
            .classList.add("noVNC_open");
        document.getElementById('noVNC_toggle_extra_keys_button')
            .classList.add("noVNC_selected");
    },

    closeExtraKeys() {
        document.getElementById('noVNC_modifiers')
            .classList.remove("noVNC_open");
        document.getElementById('noVNC_toggle_extra_keys_button')
            .classList.remove("noVNC_selected");
    },

    toggleExtraKeys() {
        if (document.getElementById('noVNC_modifiers')
            .classList.contains("noVNC_open")) {
            Ui.closeExtraKeys();
        } else  {
            Ui.openExtraKeys();
        }
    },

    sendEsc() {
        Ui.sendKey(KeyTable.XK_Escape, "Escape");
    },

    sendTab() {
        Ui.sendKey(KeyTable.XK_Tab, "Tab");
    },

    toggleCtrl() {
        const btn = document.getElementById('noVNC_toggle_ctrl_button');
        if (btn.classList.contains("noVNC_selected")) {
            Ui.sendKey(KeyTable.XK_Control_L, "ControlLeft", false);
            btn.classList.remove("noVNC_selected");
        } else {
            Ui.sendKey(KeyTable.XK_Control_L, "ControlLeft", true);
            btn.classList.add("noVNC_selected");
        }
    },

    toggleWindows() {
        const btn = document.getElementById('noVNC_toggle_windows_button');
        if (btn.classList.contains("noVNC_selected")) {
            Ui.sendKey(KeyTable.XK_Super_L, "MetaLeft", false);
            btn.classList.remove("noVNC_selected");
        } else {
            Ui.sendKey(KeyTable.XK_Super_L, "MetaLeft", true);
            btn.classList.add("noVNC_selected");
        }
    },

    toggleAlt() {
        const btn = document.getElementById('noVNC_toggle_alt_button');
        if (btn.classList.contains("noVNC_selected")) {
            Ui.sendKey(KeyTable.XK_Alt_L, "AltLeft", false);
            btn.classList.remove("noVNC_selected");
        } else {
            Ui.sendKey(KeyTable.XK_Alt_L, "AltLeft", true);
            btn.classList.add("noVNC_selected");
        }
    },

    sendCtrlAltDel() {
        Ui.rfb.sendCtrlAltDel();
        // See below
        Ui.rfb.focus();
        Ui.idleControlbar();
    },

    sendKey(keysym, code, down) {
        Ui.rfb.sendKey(keysym, code, down);

        // Move focus to the screen in order to be able to use the
        // keyboard right after these extra keys.
        // The exception is when a virtual keyboard is used, because
        // if we focus the screen the virtual keyboard would be closed.
        // In this case we focus our special virtual keyboard input
        // element instead.
        if (document.getElementById('noVNC_keyboard_button')
            .classList.contains("noVNC_selected")) {
            document.getElementById('noVNC_keyboardinput').focus();
        } else {
            Ui.rfb.focus();
        }
        // fade out the controlbar to highlight that
        // the focus has been moved to the screen
        Ui.idleControlbar();
    },

/* ------^-------
 *   /EXTRA KEYS
 * ==============
 *     MISC
 * ------v------*/

    updateViewOnly() {
        if (!Ui.rfb) return;
        Ui.rfb.viewOnly = Ui.getSetting('view_only');

        // Hide input related buttons in view only mode
        if (Ui.rfb.viewOnly) {
            document.getElementById('noVNC_keyboard_button')
                .classList.add('noVNC_hidden');
            document.getElementById('noVNC_toggle_extra_keys_button')
                .classList.add('noVNC_hidden');
            document.getElementById('noVNC_clipboard_button')
                .classList.add('noVNC_hidden');
        } else {
            document.getElementById('noVNC_keyboard_button')
                .classList.remove('noVNC_hidden');
            document.getElementById('noVNC_toggle_extra_keys_button')
                .classList.remove('noVNC_hidden');
            document.getElementById('noVNC_clipboard_button')
                .classList.remove('noVNC_hidden');
        }
    },

    updateShowDotCursor() {
        if (!Ui.rfb) return;
        Ui.rfb.showDotCursor = Ui.getSetting('show_dot');
    },

    updateLogging() {
        WebUtil.initLogging(Ui.getSetting('logging'));
    },

    updateDesktopName(e) {
        Ui.desktopName = e.detail.name;
        // Display the desktop name in the document title
        document.title = e.detail.name + " - " + PAGE_TITLE;
    },

    bell(e) {
        if (WebUtil.getConfigVar('bell', 'on') === 'on') {
            const promise = document.getElementById('noVNC_bell').play();
            // The standards disagree on the return value here
            if (promise) {
                promise.catch((e) => {
                    if (e.name === "NotAllowedError") {
                        // Ignore when the browser doesn't let us play audio.
                        // It is common that the browsers require audio to be
                        // initiated from a user action.
                    } else {
                        Log.Error("Unable to play bell: " + e);
                    }
                });
            }
        }
    },

    //Helper to add options to dropdown.
    addOption(selectbox, text, value) {
        const optn = document.createElement("OPTION");
        optn.text = text;
        optn.value = value;
        selectbox.options.add(optn);
    },

/* ------^-------
 *    /MISC
 * ==============
 */
};

// Set up translations
const LINGUAS = ["cs", "de", "el", "es", "ja", "ko", "nl", "pl", "ru", "sv", "tr", "zh_CN", "zh_TW"];
l10n.setup(LINGUAS);
if (l10n.language === "en" || l10n.dictionary !== undefined) {
    Ui.prime();
} else {
    fetch('app/locale/' + l10n.language + '.json')
        .then((response) => {
            if (!response.ok) {
                throw Error("" + response.status + " " + response.statusText);
            }
            return response.json();
        })
        .then((translations) => { l10n.dictionary = translations; })
        .catch(err => Log.Error("Failed to load translations: " + err))
        .then(Ui.prime);
}

export default Ui;
