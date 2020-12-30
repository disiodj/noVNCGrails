<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@taglib uri="http://www.springframework.org/tags" prefix="spring"%>
<%@ taglib uri="http://www.springframework.org/tags/form" prefix="form"%>
<%@taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@taglib prefix="sec" uri="http://www.springframework.org/security/tags" %>

<!DOCTYPE html>

<html>
    <head>
        <title><spring:message code="label.title.error.general"/></title>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    </head>
    <body>
		<div class="container">
		    <div class="row">
	          <g:include page="../../partials/header.gsp" />
	        </div>
			<div><h2><spring:message code="label.error.message"/> ${error}</h2></div>
			<div class="row well">
				<br> <spring:message code="label.date"/> ${date} <br>
				<br> <spring:message code="label.url.failed"/> ${url} <br>
				<g:if test="${exception!=null and not empty exception.message}">
				    <br> <spring:message code="label.exception"/>  ${exception.message} <br>
				</g:if>
				<sec:ifAnyGranted roles='ROLE_ADMIN,ROLE_USER'>
				    <h3>Detail trace</h3>
				    <br>
				    <g:forEach items="${exception.stackTrace}" var="ste">
				        ${ste}
				    </g:forEach>
				</sec:ifAnyGranted>
			</div>
			<div class="row">
			  <g:include page="../../partials/footer.gsp" />
			</div>
		</div>
	</body>
</html>
