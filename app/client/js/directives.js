angular.module('OfflineViewer.directives', [])

.directive('blogPost', ['$compile', '$parse', function($compile, $parse) {

	//http://stackoverflow.com/a/21374642/1015046
	var template = "<div>{{post.content}}</div>"
	return {
		restrict: 'E',
		link: function(s, e, a) {
			s.$watch('post', function(val) {
				if (val) {
					e.html($parse(a.post)(s));
					$compile(e.contents())(s);
				}
			});
		}
	};
}])
