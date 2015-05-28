angular.module('OfflineViewer.controllers', [])


.controller('HeaderCtrl', ['$scope', '$mdSidenav', '$rootScope', function($scope, $mdSidenav, $rootScope) {
	$scope.status = $rootScope.onLine; // True: Online | False: Offline

	$scope.toggleSidenav = function(menuId) {
		$mdSidenav(menuId).toggle();
	};

	$scope.$on('viewer-online', function() {
		$scope.status = true;
		$scope.$apply();
	});

	$scope.$on('viewer-offline', function() {
		$scope.status = false;
		$scope.$apply();
	});
}])

.controller('AppCtrl', ['$scope', '$socket', '$mdDialog', '$rootScope', '$window',
	function($scope, $socket, $mdDialog, $rootScope, $window) {
		// recheck again.. sometimes eventhough the wifi
		// is disconnected, the navigator thinks it is online!

		$scope.status = $rootScope.onLine = $window.navigator.onLine;

		$scope.posts = [];

		if (!$rootScope.onLine) {
			$mdDialog.show(
				$mdDialog.alert()
				.parent(angular.element(document.body))
				.title('You are offline!')
				.content('I have noticed that you are offline, I need internet access for a while to download the posts. If you do not see any posts after sometime, launch the viewer after connecting to the internet. Prior saved posts will be accessible from the menu. ')
				.ariaLabel('You are offline')
				.ok('Got it!')
			);
		}

		$socket.emit('load', $rootScope.onLine);

		$socket.on('loaded', function(posts) {
			$scope.posts = $scope.posts.concat(posts);
			$rootScope.inProgress = false;
		});

		$scope.showPost = function(post) {
			$scope.post = post.content;
		}

		$scope.openExternal = function(url) {
			var confirm = $mdDialog.confirm()
				.parent(angular.element(document.body))
				.title('Open the link?')
				.content('Are you sure you want to open ' + url)
				.ok('Yeah! Sure!')
				.cancel('No Thanks!')

			$mdDialog.show(confirm).then(function() {
				require('shell').openExternal(url);
			}, function() {
				// noop
			});
		}

		$scope.$on('viewer-online', function() {
			$scope.status = true;
			$socket.emit('load', $scope.status);
			$scope.$apply();
		});

		$scope.$on('viewer-offline', function() {
			$scope.status = false;
			$scope.$apply();
		});


		$scope.$on('showSearchPost', function($event, post) {
			$scope.showPost(post);
		});
	}
])

.controller('SearchCtrl', ['$scope', '$socket', '$mdDialog', function($scope, $socket, $mdDialog) {

	$scope.SearchBox = function() {
		$mdDialog.show({
			controller: SearchDialogCtrl,
			templateUrl: 'app/client/templates/search.html',
		});
	}

	function SearchDialogCtrl($scope, $mdDialog, $socket, $rootScope) {

		$scope.results = $rootScope.results;

		$scope.hide = function() {
			$mdDialog.hide();
		};

		$scope.search = function($event) {
			if ($event.which === 13) {
				$scope.searching = true;
				$socket.emit('search', $scope.searchText);
			}
		}

		$scope.showPost = function(post) {
			$scope.hide();
			$rootScope.$broadcast('showSearchPost', post);
		}

		$socket.on('results', function(results) {
			$scope.searching = false;
			$scope.results = results;
			$rootScope.results = results;
		});
	}

}])
