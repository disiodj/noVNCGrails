app.directive('lockSlideAnimate', function($animate, $timeout) {
	return function(scope, elem, attr) {
		scope.$watch(attr.animateOnChange, function(nv, ov) {
			if (nv != ov) {
				var cls = nv > ov ? 'toggle' : 'toggle.on';
				$animate.addClass(elem, cls).then(function() {
					$timeout(function() {
						$animate.removeClass(elem, cls);
					});
				});
			}
		});
	};
});
