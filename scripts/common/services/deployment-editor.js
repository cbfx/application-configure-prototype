angular.module('waldo.Deployment')
  .directive('deploymentEditor', function(Deployment, $timeout) {
    return {
      restrict: 'E',
      replace: true,
      scope: {},
      template: '<ui-codemirror ui-codemirror-opts="options" ng-model="deployment"></ui-codemirror>',
      controller: function($scope) {

        $scope.deployment = '';

        $scope.options = {
          lint: false,
          mode: 'yaml',
          theme: 'lesser-dark',
          lineNumbers: true,
          autoFocus: true,
          lineWrapping: true,
          dragDrop: false,
          matchBrackets: true,
          foldGutter: true,
          extraKeys: {"Ctrl-Q": function(cm){ cm.foldCode(cm.getCursor()); }},
          gutters: ['CodeMirror-lint-markers','CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
          onGutterClick: CodeMirror.newFoldFunction(CodeMirror.fold.indent),
          onLoad: function(_editor) {
            _editor.on("change", function(d) {
              var deployment = jsyaml.load(angular.copy($scope.deployment));
              Deployment.set(deployment);
            });
          }
        };

        $scope.$on('deployment:update', function(event, data) {
          var yamlData = jsyaml.safeDump(data);

          if ($scope.deployment != yamlData) {
            $timeout(function() {
              $scope.deployment = yamlData;
            });
          }
        });

      }
    };
  });
