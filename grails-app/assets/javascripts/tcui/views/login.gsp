<%@ taglib uri="http://www.springframework.org/tags" prefix="spring"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib uri="http://www.springframework.org/tags/form" prefix="form"%>
<%@ taglib prefix="security" uri="http://www.springframework.org/security/tags"%>

<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
    <title>Login</title>
    <link rel="stylesheet" href="${appPath}/css/bootstrap.min.css">
    <link rel="stylesheet" href="${appPath}/css/datepicker.css">
    <link rel="stylesheet" href="${appPath}/css/bootstrap.vertical-tabs.css">
    <link rel="stylesheet" href="${appPath}/css/main.css">
</head>
<body ng-app>
<div class="container">
<%--    <div class="row">
        <jsp:include page="../partials/header.jsp" />
    </div>--%>
    <div class="row">
        <h2 class="text-muted modal-title-headline"><spring:message code="message.login"/></h2>
        <div class="line-spacing"></div>
		<div class="form-center">
        	<form method="post" action="login">
            	<input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}" />
            	<g:if test='${not empty sessionScope["SPRING_SECURITY_LAST_EXCEPTION"].message}'>
                	<span class="label label-danger"> ${sessionScope["SPRING_SECURITY_LAST_EXCEPTION"].message} </span>
            	</g:if>
            	<div class="form-group">
                	<label for="usernameInput"><spring:message code="label.username"/></label> <input name="username"
                    	type="text" class="form-control" id="usernameInput"
                    	placeholder="Enter username" required>
            	</div>
            	<div class="form-group">
                	<label for="passwordInput"><spring:message code="label.password"/></label> <input name="password"
                    	type="password" class="form-control" id="passwordInput"
                    	placeholder="Password" required>
            	</div>
            	<button type="submit" class="btn btn-default"><spring:message code="label.login"/></button>
        	</form>
		</div>
    </div>

    <div class="row">
        <g:include page="../partials/footer.gsp" />
    </div>

</div>
</body>
</html>
