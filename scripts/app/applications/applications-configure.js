angular.module('applications-configure', [
  'lvl.directives.dragdrop',
  'waldo.Blueprint',
  'waldo.Catalog',
  'waldo.Deployment',
  'waldo.Drag'
]);

angular.module('applications-configure')
  .controller('ConfigureCtrl', function($scope, Deployment, Blueprint, Catalog, Drag, $timeout) {

    $scope.deployment = Deployment.get();

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
    $scope.selection = {
      'data': {},
      'isVisible': false,
      save: function(component) {
        Blueprint.update($scope.deployment.blueprint);
      },
      close: function() {
        this.isVisible = false;
      }
    };

    // This is the catalog model for the sidebar.
    $scope.catalog = {
      'isVisible': false,
      'data': Catalog.get(),
      'components': Catalog.getComponents()
    };

    // This is the codemirror model for the sidebar.
    $scope.codemirror = {
    };

    $scope.$on('deployment:update', function(event, data) {
      if(data.blueprint && _.size(data.blueprint.services) === 1) {
        $timeout(function() {
          $scope.codemirror.isVisible = true;
        }, 50);
      }

      $scope.deployment = data;
    });

    $scope.$on('topology:select', function(event, selection) {
      $scope.selection.isVisible = true;
      $scope.selection.data = selection;
    });
  });
