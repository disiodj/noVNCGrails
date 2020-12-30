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
</body>
</html>