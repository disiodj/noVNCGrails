<!DOCTYPE html>
<html>
<head>
    <title>Simple CRM - Customer Management made Simple</title>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" type="text/css"/>
    <script src="https://code.jquery.com/jquery-3.3.1.min.js"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.1.3/css/bootstrap.css" rel="stylesheet"
          crossorigin="anonymous">
    <link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet"
          integrity="sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN" crossorigin="anonymous">
    <link href="https://cdn.datatables.net/1.10.20/css/dataTables.bootstrap4.min.css" rel="stylesheet"/>
    <script src="https://cdn.datatables.net/1.10.20/js/jquery.dataTables.min.js"></script>
    <script src="https://cdn.datatables.net/1.10.20/js/dataTables.bootstrap4.min.js"></script>
</head>
<body>
<nav class="navbar navbar-dark bg-dark fixed-top">
    <div class="container">
        <div class="navbar-header">
            <a class="navbar-brand" href="/">Simple Handset Page</a>
        </div>
    </div>
</nav>
<div class="container" style="margin-top:80px">

    <h1 class="pb-2 border-bottom row">
        <span class="col-sm-6 pb-4">Handset Tiles</span>
        <span class="col-sm-6 text-sm-right pb-4">
            <a href="/handset/create" class="btn btn-primary btn-outline-primary d-block d-sm-inline-block">Create Handset</a>
        </span>
    </h1>

    <g:if test="${flash.message}">
        <div class="alert alert-info">
            <h3>${flash.message}</h3>
        </div>
    </g:if>

    <div class="mt-5">
        <table id="handsetTiles" class="table table-striped table-bordered" style="width:100%">
            <thead>
            <tr>
                <th>Id</th>
                <th>telephone Number</th>
                <th>Country</th>
                <th>Operator</th>
            </tr>
            </thead>
        </table>
    </div>

</div>


<script>
    var url = '/handset/handset_for_tiles';

    $(document).ready(function () {

        $('#handsetTiles').DataTable({
            "ajax": url,
            "processing": true,
            "serverSide": true,
            "columns": [
                {
                    "data": "id",
                    "render": function (data, type, row, meta) {
                        return '<a href="/handset/edit/' + row.id + '">' + data + '</a>';
                    }
                },
                {
                    "data": "telephoneNumber",
                    "render": function (data, type, row, meta) {
                        return '<a href="/handset/edit/' + row.id + '">' + data + '</a>';
                    }
                },
                {"data": "country"},
                {"data": "operator"}
            ]
        });
    });
</script>
</body>
</html>