app.directive('noty', [ '$timeout', function($timeout) {
	return {
		restrict : 'A',
		link : function(scope, element, attrs) {
			var status = attrs.notyStatus;
			var message = attrs.notyMessage;

			if (status == 'status_success') {
				noty({
					text : message,
					type : 'success',
					layout : 'topRight',
					timeout: 3000
				});
			}

			if (status == 'status_failure') {
				noty({
					text : message,
					type : 'error',
					layout : 'topRight',
					timeout: 3000
				});
			}
		}
	};
} ]);