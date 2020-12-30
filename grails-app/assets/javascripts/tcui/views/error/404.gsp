<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@taglib uri="http://www.springframework.org/tags" prefix="spring"%>
<%@ taglib uri="http://www.springframework.org/tags/form" prefix="form"%>
<%@taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>

<!DOCTYPE html>

<html>
    <head>
        <title><spring:message code="label.title.error.page"/></title>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    </head>
    <body>
        <div class="container">
            <div class="row">
              <g:include page="../../partials/header.gsp" />
            </div>
            <div class="row well">
                <div><h2><spring:message code="label.error.message.page"/></h2></div>
            </div>
            <div class="row">
              <g:include page="../../partials/footer.gsp" />
            </div>
        </div>
    </body>
</html>