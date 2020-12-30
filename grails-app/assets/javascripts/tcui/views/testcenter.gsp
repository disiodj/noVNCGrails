<%@taglib prefix="sec" uri="http://www.springframework.org/security/tags" %>

<div id="dialog-message" title="">
    <p></p>
</div>
<div class="leftContent">
    <div class="tabsbox">
        <div class="tabs-row">
            <div class="vnc-tab tabs" ng-class="{'active' : viewMode=='wap', 'inactive' : testcenter.status == 'OFFLINE'}" ng-click="navTabClicked('wap')">VNC</div>
            <div class="sms-tab tabs" ng-class="{'active' : viewMode=='sms' }" ng-click="navTabClicked('sms')">SMS</div>
        </div>
    </div>

    <div class="handsetContainer">
        <div ng-repeat="handset in handsets track by handset.id">

            <div id="{{ 'handset-' + handset.id }}" class="handset" ng-class="{selected: handset.id == activeHandset.id, has_not_locked: !handset.locked, hs_locked_by_me: handset.locked && handset.myLock, hs_locked_by_other: handset.locked && !handset.myLock, offline: handset.handsetStatus.online != 'true' } "
                 ng-click="operatorTabClick(handset)">

                <div class="handset-info left">
                    <div class="operator">{{handset.simCard.operator.internalName}}</div>
                    <div class="select-handset-container left" ng-show="viewMode == 'sms'">
                        <input type="checkbox" class="select-handset-checkbox" value="{{handset.simCard.msisdn}}" ng-model="handset.selected" ng-change="toggleSelection(handset)"/>
                    </div>
                    <div class="msisdn left">
                        {{handset.simCard.msisdn}}<i class="copy-msisdn-icon fa fa-files-o" ng-click="copyMsisdn(handset)"></i>
                    </div>
                    <div class="lock_switch">
                        <div class = "toggle" ng-click="toggleLock(handset)" ng-show="lockVisible(handset)" ng-class="{on : handset.locked, off : !handset.locked}" >
                            <div class="slide" lockSlideAnimate="handset.locked">
                                <span class='fa fa-circle-o'></span>
                            </div>
                        </div>
                        <div class="fa fa-lock lock_by_other" ng-show="!lockVisible(handset)"></div>
                        <div class="locked_by" ng-show="handset.locked">
                            {{handset.locked && handset.lock.user != null ? handset.lock.user : '' }}
                        </div>
                    </div>
                </div>
                <div class="handset-status right">
                    <div class="onlineInfo" ng-class="{offline: handset.handsetStatus.online != 'true'}"
                         ns-popover ns-popover-template="info-popover" ns-popover-placement="top">i</div>
                    <div class="battery_container" ng-class="{offline: handset.handsetStatus.online != 'true'}">
                        <i class="fa fa-bolt fa-rotate-270 charging"></i>
                        <div class="battery" style="width: {{ getBatteryIconValue(handset) }}px"></div>
                    </div>
                    <div class="signal_container">
                        <div class="networkType">{{networkTypeShort(handset)}}</div>
                        <div class="volOne"
                             ng-class="[{'active' : isSignalStrengthActive(1,handset)}, {'inactive': !isSignalStrengthActive(1,handset)}]"></div>
                        <div class="volTwo"
                             ng-class="[{'active' : isSignalStrengthActive(2,handset)}, {'inactive': !isSignalStrengthActive(2,handset)}]"></div>
                        <div class="volThree"
                             ng-class="[{'active' : isSignalStrengthActive(3,handset)}, {'inactive': !isSignalStrengthActive(3,handset)}]"></div>
                        <div class="volFour"
                             ng-class="[{'active' : isSignalStrengthActive(4,handset)}, {'inactive': !isSignalStrengthActive(4,handset)}]"></div>
                    </div>
                </div>
                <div class="clear"></div>
                <div class="balance_container">
                    <input type="button" name="BALANCE" value="balance check"
                           class="balance_check balance-check-start" ng-click="checkBalance(handset);" ng-show="handset.id != checkingBalanceForHanset" ng-disabled="!handset.simCard.balanceCheck || (handset.id != checkingBalanceForHanset && checkingBalanceForHanset != '')
                               || handset.handsetStatus.online != 'true' || (handset.lock && !handset.myLock)" />
                    <input type="button" name="BALANCE_CANCEL" value="cancel"
                           class="balance_check balance-check-cancel" ng-click="cancelCheckBalance();" ng-show="checkBalanceInProgress == true && handset.id == checkingBalanceForHanset" />
                    <div title="Last Check: {{handset.balance.creationDate != null ? handset.balance.creationDate : 'N/A'}}" class="balance right">
                        <i class="fa fa-spinner fa-pulse " ng-show="checkBalanceInProgress == true && handset.id == checkingBalanceForHanset"></i>
                        <i title="failed to update balance" class="fa fa-warning balance-warning" ng-show="balanceCheckSuccess == false && checkBalanceInProgress == false && handset.id == balanceResultHandset"></i>
                        <i class="fa fa-check-circle balance-ok" ng-show="balanceCheckSuccess == true && checkBalanceInProgress == false && handset.id == balanceResultHandset"></i>
                        {{handset.balance.balance != null ? handset.balance.balance : "N/A"}}</div>
                </div>
            </div>
        </div>
    </div>
</div>

<%--WAP--%>
<div class="vnc_container" ng-show="viewMode == 'wap'">
    <div class="vnc_control">
        <div class="vnc_reload"><a id="restart" ng-click="restartVnc();" remove-vnc="vnc" ng-show="!vncDisabled && !vncInSession && activeHandset.myLock">
            <i class="fa fa-refresh"></i></a>
        </div>
        <div class="vnc_play"><a id="play" add-vnc="vnc"
                                 ng-show="!vncInSession &&  (!activeHandset.locked || activeHandset.myLock) && (activeHandset.vncOk == 'OK' || activeHandset.vncOk == 'WARNING')">
            <i class="fa fa-play"></i></a>
        </div>
        <div class="vnc_play"><a id="stop" remove-vnc="vnc"
                                 ng-show="vncInSession">
            <i class="fa fa-stop"></i></a>
        </div>
        <div class="vnc-general-info">
            <span class="vnc_msisdn" ng-bind="activeMsisdn" ></span>
            (<span class="vnc_msisdn" ng-bind="activeHandset.simCard.operator.internalName" ></span>)
        </div>
    </div>
    <div class="vnc" ng-switch on="vncStatus">
        <div ng-switch-when="status_success" ng-show="vncDisabled == true">
            <div class="progress">
                <div class="progress-bar" role="progressbar"
                     aria-valuenow="{{vncTimeoutCount}}" aria-valuemin="0"
                     aria-valuemax="100"
                     style="width: {{(vncTimeoutCount/vncTimeout)*100"></div>
            </div>
            {{vncStatusMessage}} Available in:
            <div id="vnc-restart-countdown">{{vncTimeout - vncTimeoutCount}}</div>
            seconds.
        </div>
        <div ng-switch-when="status_error">{{vncStatusMessage}}</div>
        <div ng-switch-when="status_failure">{{vncStatusMessage}}</div>
        <div class="panel-body">
            <div id="vnc-panel" ng-show="vncVisible && vncInSession"></div>
        </div>
    </div>
</div>


<%--SMS HISTORY--%>
<div ng-controller="SmsHistoryController">
    <div ng-include src="'html/sms.html'"></div>
    <div ng-include src="'html/history.html'" ng-show="viewMode == 'wap'"></div>
    <div ng-include src="'html/historySms.html'" ng-show="viewMode == 'sms'"></div>
</div>

<div class="clearfix"></div>

<script type="text/ng-template" id="info-popover">
    <div class="popover-panel panel-info">
        <div class="panel-heading">
            Handset info
        </div>
        <div class="panel-body">
            <span class="popover-network-type">Network type: <strong>{{activeHandset.handsetStatus.networkType}}</strong> </span> <br>
            <span class="popover-app-version">App version: <strong>{{activeHandset.handsetStatus.appVersion}}</strong> </span> <br>
            <span class="popover-os-version">OS version: <strong>{{activeHandset.handsetStatus.androidVersion}}</strong> </span> <br>
            <span class="popover-manufacturer">Manufacturer: <strong>{{activeHandset.handsetModel.manufactorer}}</strong> </span> <br>
            <span class="popover-model">Model: <strong>{{activeHandset.handsetModel.model}}</strong> </span>
        </div>
    </div>
</script>
	

