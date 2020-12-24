<!DOCTYPE html>
<html>
<head>
    <title>Simple CRM - Customer Management made Simple</title>

    <link href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.1.3/css/bootstrap.css" rel="stylesheet"
          crossorigin="anonymous">

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

    <h1 class="pb-2 border-bottom row">
        <span class="col-sm pb-4">New Handset Details</span>
    </h1>


    <div class="mt-5 card card-body bg-light">

        <form action="/handset/update" class="form" method="post">

            <g:hasErrors bean="${this.handset}">
                <div class="alert alert-danger">
                <ul>
                    <g:eachError bean="${this.handset}" var="error">
                        <li><g:message error="${error}"/></li>
                    </g:eachError>
                </ul>
                </div>
            </g:hasErrors>
            <input name="id" type="hidden" value="${handset?.id}"/>
            <div class="row">
                <div class="form-group col-6">
                    <label>Telephone number</label>
                    <input class="form-control" name="telephoneNumber" value="${handset?.telephoneNumber}"/>
                </div>
                <div class="form-group col-6">
                    <label>Operator</label>
                    <input class="form-control" name="operator" value="${handset?.operator}"/>
                </div>
            </div>

            <div class="row">
                <div class="form-group col-6">
                    <label>Country</label>
                    <input class="form-control" name="country" value="${handset?.country}"/>
                </div>

            </div>
            <div class="row">
                <div class="col">
                    <button type="submit" class="btn btn-success btn-block">Save changes</button>
                </div>
            </div>
            </div>
        </form>
    </div>
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
</body>
</html>