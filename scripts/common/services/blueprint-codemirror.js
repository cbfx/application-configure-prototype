angular.module('waldo.Blueprint')
  .directive('blueprintCodemirror', function(Blueprint, $timeout) {
    return {
      restrict: 'E',
      replace: true,
      scope: {},
      template: '<ui-codemirror ui-codemirror-opts="options" ng-model="blueprint"></ui-codemirror>',
      controller: function($scope) {

        $scope.blueprint = '';

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
              var blueprint = jsyaml.load(angular.copy($scope.blueprint));
              Blueprint.set(blueprint);
            });
          }
        };

        $scope.$on('blueprint:update', function(event, data) {
          var yamlData = jsyaml.safeDump(data);

          if ($scope.blueprint != yamlData) {
            $timeout(function() {
              $scope.blueprint = yamlData;
            });
          }
        });

      }
    };
  });
