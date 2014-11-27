angular.module('waldo.Deployment')
  .directive('deploymentEditor', function(Deployment, $timeout) {
    return {
      restrict: 'E',
      replace: true,
      scope: {},
      template: '<waldo-codemirror waldo-codemirror-opts="codemirror.options" ng-model="deployment"></waldo-codemirror>',
      controller: function($scope) {

        $scope.deployment = '';

        $scope.codemirror = {
          editor: null,
          editorAltered: false,
          markAltered: function() {
            $scope.codemirror.editorAltered = true;
          },
          foldFunction: CodeMirror.newFoldFunction(CodeMirror.fold.indent),
          foldAllExceptBlueprint: function(editor) {
            var inBlueprint = false;
            editor.eachLine(function(line) {
              if (line.text.substring(0, 1) !== ' ') {
                if (line.text.substring(0, 10) == 'blueprint:') {
                  inBlueprint = true;
                } else {
                  inBlueprint = false;
                  $scope.codemirror.foldFunction(editor, editor.getLineNumber(line));
                }
              }
            });
          },
          setEditorDefaultState: function(editor) {
            if (!$scope.codemirror.editorAltered) {
              $scope.codemirror.foldAllExceptBlueprint(editor);
            }
          }
        };

        $scope.codemirror.options = {
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
          onGutterClick: function(editor, start) {
            $scope.codemirror.markAltered();
            return $scope.codemirror.foldFunction(editor, start);
          },
          onLoad: function(editor) {
            $scope.codemirror.editor = editor;
            editor.on("change", function(d) {
              var deployment = jsyaml.load(angular.copy($scope.deployment));
              Deployment.set(deployment);
            });
          },
          onFocus: $scope.codemirror.markAltered
        };

        $scope.$on('editor:refreshed', function(event, editor, viewData) {
          $scope.codemirror.setEditorDefaultState(editor);
        });

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
