app.directive('dwbuttonset', ['$timeout', '$q', '$compile', function ($timeout, $q, $compile) {
    return {
        restrict: 'A',
        link: function($scope, $element, $attrs){
        	$q.all(['process']).then(function(result) {
        		$timeout(function(){
        			$element.radiosforbuttons({color: 'white'});
        		});
        	}).then(function(){
        		$q.all(['process']).then(function(result2) {
        			$timeout(function(){
            			$element.find('button').each( function (index, el) {
                			$compile(el)($scope);
                        });
            		});
        		});
        	});
        }
    };
}]);