angular.module('applications-configure', [
  'lvl.directives.dragdrop',
  'waldo.Blueprint',
  'waldo.Catalog',
  'waldo.Drag'
]);

angular.module('applications-configure')
  .controller('ConfigureCtrl', function($scope, Blueprint, Catalog, Drag) {

    // This selects the object being sent to the Blueprint.
    $scope.select = function(app) {
      Drag.current.set(app);
    };
    
    // This triggers when something is dropped on the drop target.
    $scope.add = function() {
      var source = Drag.current.get();
      var target = Drag.target.get();

      Blueprint.add(source, target);
      Drag.reset();
    };

    // This could toggle an extra sidebar to reveal details about a service.
    $scope.viewDetails = function() {

    };
    
    // This is the catalog model for the sidebar.
    $scope.catalog = {
      'data': Catalog.get()
    };

    $scope.$on('blueprint:update', function(event, data) {
      console.log('[ConfigureCtrl]: blueprint broadcast caught in config controller. we could use this to disable/enable catalog nodes and render yaml/json.', data);
    });

  });