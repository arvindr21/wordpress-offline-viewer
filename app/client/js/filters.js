angular.module('OfflineViewer.filters', [])

.filter('toHTML', function($sce) {
    return function(input) {
        return $sce.trustAsHtml(input);
    }
})
