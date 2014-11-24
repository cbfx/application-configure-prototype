angular.module('waldo.Blueprint')
  .directive('blueprintCodemirror', function() {
    return {
      restrict: 'E',
      templateUrl: '/scripts/common/services/blueprint-codemirror.tpl.html',
      controller: function($scope) {
        $scope.$on('blueprint:update', function(event, data) {
          $scope.blueprint = data;
          $scope.$apply();
          console.log('[Blueprint codemirror]: blueprint broadcast caught in topology. we should render the topology.', data);
        });
      }
    }
  });