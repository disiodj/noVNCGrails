<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <title>Simple CRM - Customer Management made Simple</title>
</head>
<body>
<nav class="navbar navbar-dark bg-dark fixed-top">
    <div class="container">
        <div class="navbar-header">
            <a class="navbar-brand" href="/">Simple CRM</a>
        </div>
    </div>
</nav>
<div class="container" style="margin-top:80px">
    <div>
        <h1>Welcome to simple crm</h1>
        <h2>Customer Management made Simple</h2>
    </div>
    <p class="mt-5"><a href="/customer" class="btn btn-primary btn-block">Manage Customers</a></p>
    <p class="mt-5"><a href="/handset" class="btn btn-primary btn-block">Manage Handset</a></p>
    <p class="mt-5"><a href="/vnc/vnc_lite" class="btn btn-primary btn-block">VNC_LITe</a></p>
    <p class="mt-5"><a href="/vnc/experiments" class="btn btn-primary btn-block">Experiments</a></p>
    <p class="mt-5"><a href="/vnc/home" class="btn btn-primary btn-block">Home vnc</a></p>
    <p class="mt-5"><a href="/handset/home" class="btn btn-primary btn-block">Handset home</a></p>

</div>
<footer class="footer navbar-dark bg-dark fixed-bottom">
    <div class="container">
        <div class="row">
            <div class="col-md-4"></div>
            <div class="col-md-4">
                <p class="text-center text-muted">&copy;
                    <span>${formatDate(date: new Date(), format:'yyyy')}</span>
                    <a href="https://tucanoo.com">Tucanoo Solutions Ltd.</a>
                </p>
            </div>
        </div>
    </div>
</footer>
<script src="https://code.jquery.com/jquery-3.4.1.slim.min.js"
        integrity="sha384-J6qa4849blE2+poT4WnyKhv5vZF5SrPo0iEjwBvKU7imGFAV0wwj1yYfoRSJoZ+n"
        crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js"
        integrity="sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo"
        crossorigin="anonymous"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js"
        integrity="sha384-wfSDF2E50Y2D1uUdj0O3uMBJnjuUD4Ih7YwaYd1iqfktj0Uod8GCExl3Og8ifwB6"
        crossorigin="anonymous"></script>
<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css"
      integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
</body>
</html>