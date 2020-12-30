<%@page language="java" contentType="text/html; charset=UTF-8"
        pageEncoding="UTF-8" %>
<%@taglib prefix="sec"
          uri="http://www.springframework.org/security/tags" %>

<div id="dialog-message" title="Testcenter Information">
    <p></p>
</div>
<div class="row">
    <div id="page_content">

        <div ng-repeat="testcenter in testcenters">

            <div id="{{ 'testcenter-' + testcenter.id }}" class="testcenter {{testcenter.maintenance == true ? 'MAINTENANCE' : testcenter.status}}">
                <div class="tc_name">{{ testcenter.name }}</div>
                <div class="tc_status">
                    {{testcenter.maintenance == true ? 'MAINTENANCE' : testcenter.status}} <span
                        ng-show="testcenter.status != 'OFFLINE'" class="ping">({{testcenter.pingResponseTime}})</span>
                </div>
                <div class="tc_buttons">
                    <input type="button"
                           ng-disabled="testcenter.maintenance == true"
                           class="ui-button ui-state-active ui-corner-all"
                           value="SMS" ng-click="openTestcenter(testcenter.id, 'sms')"/>
                    <input type="button"
                           ng-disabled="testcenter.maintenance == true || testcenter.status == 'OFFLINE'"
                           class="ui-button ui-state-active ui-corner-all"
                           value="VNC"
                           ng-click="openTestcenter(testcenter.id, 'wap')"/>
                </div>
                <sec:authorize ifAnyGranted="VIEW_TC_INFO">
                    <div class="tc_buttons admin">
                        <input type="button"
                               class="ui-button ui-state-active ui-corner-all admin"
                               value="Information" ng-click="showTestcenterInfo(testcenter)"/>
                    </div>
                </sec:authorize>
            </div>

        </div>

    </div>
</div>
