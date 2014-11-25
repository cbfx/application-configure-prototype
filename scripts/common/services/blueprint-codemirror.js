angular.module('waldo.Blueprint')
  .directive('blueprintCodemirror', function() {
    return {
      restrict: 'E',
      scope: {},
      templateUrl: '/scripts/common/services/blueprint-codemirror.tpl.html',
      controller: function($scope) {

        $scope.toggleEditorType = function() {
          var currentMode = $scope.codemirror.options.mode;
          try {
            if (currentMode === 'application/json') {
              $scope.toJSON();
            } else {
              $scope.toYAML();
            }
          } catch(err) {
            $scope.show_error(err);
          }
        };

        $scope.codemirror = {
          format: 'yaml',
          onLoaded: function(_editor){
            _editor.eachLine(function(line){
              if(line.text.substring(0,3) == '  "') {
                $scope.foldFunc(_editor, _editor.getLineNumber(line));
              }
            });
          },
          foldFunc: CodeMirror.newFoldFunction(CodeMirror.fold.brace),
          options: {
            onLoad: this.onLoaded,
            theme: 'lesser-dark',
            mode: {name: 'javascript', json: true },
            lineNumbers: true,
            autoFocus: true,
            lineWrapping: true,
            dragDrop: false,
            lint: false,
            matchBrackets: true,
            onGutterClick: this.foldFunc
          },
          refresh: function() {
            if ($scope.codemirror.format === 'yaml') {
              $scope.codemirror.data.toYAML();
            } else {
              $scope.codemirror.data.toJSON();
            }
          },
          data: {
            original: undefined,
            bound: '',
            toYAML: function() {
              $scope.codemirror.data.bound = jsyaml.safeDump($scope.codemirror.data.original) || '';
              $scope.codemirror.options.mode = 'application/x-yaml';
              $scope.codemirror.foldFunc = CodeMirror.newFoldFunction(CodeMirror.fold.indent);
              $scope.codemirror.options.lint = true;
            },
            toJSON: function() {
              $scope.codemirror.data.bound = JSON.stringify($scope.codemirror.data, null, 2);
              $scope.codemirror.options.mode = 'application/json';
              $scope.codemirror.foldFunc = CodeMirror.newFoldFunction(CodeMirror.fold.brace) || '';
              $scope.codemirror.options.lint = true;
            }
          },
          setData: function(data) {
            $scope.codemirror.data.original = data;
            $scope.codemirror.refresh();
          }
        };

        $scope.$on('blueprint:update', function(event, data) {
          $scope.codemirror.setData(data);
          $scope.$apply();
          console.log('[Blueprint codemirror]: blueprint broadcast caught in topology. we should render the topology.', data);
        });
      }
    };
  });
