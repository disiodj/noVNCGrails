<%--<%@taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>--%>
<%--<%@taglib prefix="sec" uri="http://www.springframework.org/security/tags" %>--%>

<%@tag description="TCUI Main Template" pageEncoding="UTF-8" %>

<%@attribute name="title" %>
<%@attribute name="content_area" fragment="true" required="true" %>


<link rel="stylesheet" href="/tcui/css/default.css">

<link rel="stylesheet" href="/tcui/css/dimoco-theme/jquery-ui.css">
<link rel="stylesheet" href="/tcui/css/dimoco-theme/jquery-ui.structure.css">
<link rel="stylesheet" href="/tcui/css/dimoco-theme/jquery-ui.theme.css">
<link rel="stylesheet" href="/tcui/css/font-awesome-4.4.0/css/font-awesome.css">
<link rel="stylesheet" href="/tcui/css/bootstrap-buttons.min.css">

<div class="row">
    <section id="tcui_content" class="tcuiContent">
        <jsp:invoke fragment="content_area"/>
    </section>
</div>

<asset:javascript src="/tcui/js/jquery-1.11.0.js"/>

<%-- Header service integration, must be imported right after jquery--%>
<asset:javascript src="https://static.dimoco.at/js/header-service.js"/>
<script type="text/javascript">
    headerServiceClient.header.get("TCUI", "${tcuiEnvironment}");
</script>

<asset:javascript src="/tcui/css/dimoco-theme/jquery-ui.js"/>

<asset:javascript src="/tcui/js/angular/angular.min.js"/>
<asset:javascript src="/tcui/js/angular/angular-animate.js"/>
<asset:javascript src="/tcui/js/angular/angular-cookies.js"/>
<asset:javascript src="/tcui/js/angular/angular-loader.js"/>
<asset:javascript src="/tcui/js/angular/angular-messages.js"/>
<asset:javascript src="/tcui/js/angular/angular-resource.js"/>
<asset:javascript src="/tcui/js/angular/angular-route.js"/>
<asset:javascript src="/tcui/js/angular/angular-sanitize.js"/>
<asset:javascript src="/tcui/js/angular/ui-bootstrap-tpls-0.11.0.min.js"/>
<asset:javascript src="/tcui/js/angular/ui-utils.min.js"/>
<asset:javascript src="/tcui/js/angular/datepicker.js"/>
<asset:javascript src="/tcui/js/angular/xeditable.js"/>
<asset:javascript src="/tcui/js/angular/nsPopover.js"/>
<asset:javascript src="/tcui/js/angular/lodash.min.js"/>
<asset:javascript src="/tcui/js/angular/sockjs.min.js"/>
<asset:javascript src="/tcui/js/angular/stomp.min.js"/>

<asset:javascript src="/tcui/js/jquery.noty.packaged.min.js"/>
<%-- <asset:javascript src="/tcui/js/noty/center.js"/>
<asset:javascript src="/tcui/js/noty/default.js"/> --%>

<asset:javascript src="/tcui/js/vnc/vnc.js"/>
<asset:javascript src="/tcui/js/vnc/ui.js"/>

<asset:javascript src="/tcui/js/custom/jquery.radiosforbuttons.js"/>

<asset:javascript src="/tcui/js/custom/header.js"/>
<asset:javascript src="/tcui/js/custom/simplePagination.js"/>

<asset:javascript src="/tcui/js/app/default.js"/>

<asset:javascript src="/tcui/js/app/app.js"/>
<asset:javascript src="/tcui/js/app/services/restClientService.js"/>
<asset:javascript src="/tcui/js/app/services/push_service.js"/>
<asset:javascript src="/tcui/js/app/services/push_service_two.js"/>
<asset:javascript src="/tcui/js/app/services/authService.js"/>
<asset:javascript src="/tcui/js/app/services/appModeService.js"/>

<asset:javascript src="/tcui/js/app/controllers/testcenter_list_controller.js"/>
<asset:javascript src="/tcui/js/app/controllers/testcenter_controller.js"/>
<asset:javascript src="/tcui/js/app/controllers/sms_history_controller.js"/>

<asset:javascript src="/tcui/js/app/filters/filters.js"/>

<asset:javascript src="/tcui/js/app/directives/vnc_directive.js"/>
<asset:javascript src="/tcui/js/app/directives/dirPagination.js"/>
<asset:javascript src="/tcui/js/app/directives/buttonset_directive.js"/>
<asset:javascript src="/tcui/js/app/directives/accordion_directive.js"/>
<asset:javascript src="/tcui/js/app/directives/noty_directive.js"/>
<asset:javascript src="/tcui/js/app/directives/lock_slide_directive.js"/>

<asset:javascript src="/tcui/js/custom/idle.js"/>
<asset:javascript src="/tcui/js/custom/angular-clipboard.js"/>