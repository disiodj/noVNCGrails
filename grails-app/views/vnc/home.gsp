<%@page language="java" contentType="text/html; charset=UTF-8"
        pageEncoding="UTF-8"%>
<%@taglib uri="http://www.springframework.org/tags" prefix="spring"%>
<%@taglib uri="http://www.springframework.org/tags/form" prefix="form"%>
<%@taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@taglib prefix="t" tagdir="/tcui/tags"%>
<%@taglib prefix="security"
          uri="http://www.springframework.org/security/tags"%>

<!DOCTYPE html>

<html lang="en" ng-app="tcui">
<head>
    <title>Testcenter Management</title>
</head>
<body>
<div class="container">
    <input type="hidden" id="appPath" name="appPath" value=${appPath}>
<%--    <div id="wrapper">
        <jsp:include page="../partials/header.jsp" />
    </div>--%>

    <g:render template="tcui_template">
%{--			<jsp:attribute name="content_area">--}%
%{--            <div ng-view>--}%
%{--            </div>--}%
%{--        </jsp:attribute>--}%


    </g:render>

    <div class="row">
        <g:include page="../partials/footer.gsp" />
    </div>
</div>
</body>
</html>
