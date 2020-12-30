app.directive('dwaccordion', ['$timeout', function ($timeout) {
    return {
        restrict: 'A',
        link: function($scope, $element, $attrs){
            $timeout(function(){
                $element.accordion({
                	active: false,
            		collapsible : true
            	});
            },0);
        }
    }
}]);