app.filter('daterange', function () {
    return function (items, sdate, edate) {
        var result = [];
        var start_date = (sdate && !isNaN(Date.parse(sdate))) ? Date.parse(sdate) : 0;
        var end_date = (edate && !isNaN(Date.parse(edate))) ? Date.parse(edate) : new Date().getTime();
        if (items && items.length > 0) {
            angular.forEach(items, function (item, index) {
                var itemDate = Date.parse(item.received);
                if (itemDate >= start_date && itemDate <= end_date) {
                    result.push(item);
                }
            });

            return result;
        }
    };
});

app.filter('msisdn', function () {
    return function (items, msisdn) {
        var result = [];
        if (items && items.length) {
            angular.forEach(items, function (item) {
                if (item.from == msisdn || item.to == msisdn) {
                    result.push(item);
                }
            });
        }
        return result;
    };
});

app.filter('partners', function () {
    return function (items, partners) {
        var result = [];
        if (items && items.length) {
            angular.forEach(items, function (item) {
                if (partners && partners.length) {
                    angular.forEach(partners, function (partner) {
                        if (item.from == partner.simCard.msisdn || item.to == partner.simCard.msisdn) {
                            if (result.indexOf(item) < 0){
                                result.push(item);
                            }
                        }
                    });
                }
            });
        }
        return result;
    };
});
