angular.module('waldo.Blueprint')
  .directive('blueprintCodemirror', function(Blueprint) {
    return {
      restrict: 'E',
      replace: true,
      template: '<ui-codemirror ui-codemirror-opts="codemirror.options" ng-model="codemirror.data.blueprint"></ui-codemirror>',
      controller: function($scope) {

        $scope.codemirror = {
          format: 'yaml',
          indentFoldfunc: CodeMirror.newFoldFunction(CodeMirror.fold.indent),
          braceFoldFunc: CodeMirror.newFoldFunction(CodeMirror.fold.brace),
          currentFoldFunc: this.indentFoldfunc,
          onLoad: function(_editor){
            $scope.codemirror.editor = _editor;
          },
          data: {
            blueprint: undefined,
            toYAML: function() {
              $scope.codemirror.options.mode = 'yaml';
              $scope.codemirror.options.lint = typeof CodeMirror.lint.yaml !== 'undefined';
              $scope.codemirror.options.onGutterClick = $scope.codemirror.indentFoldFunc;
            },
            toJSON: function() {
              $scope.codemirror.options.mode = 'json';
              $scope.codemirror.options.lint = typeof CodeMirror.lint.json !== 'undefined';
              $scope.codemirror.options.onGutterClick = $scope.codemirror.braceFoldFunc;
            }
          },
          onUpdate: function() {
            if ($scope.codemirror.editor) {
              $scope.codemirror.editor.refresh();
              //$scope.codemirror.editor.eachLine(function(line){
              //  if(line.text.substring(0, 3) == '  "') {
              //    $scope.codemirror.indentFoldfunc($scope.codemirror.editor, $scope.codemirror.editor.getLineNumber(line));
              //  }
              //});
            }
          },
          setData: function(data) {
            $scope.codemirror.data.blueprint = data;
            $scope.codemirror.onUpdate();
          },
          options: {
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
            onLoad: function(_editor){
              $scope.codemirror.onLoad(_editor);
            }
          }
        };

        $scope.codemirror.data.toYAML();

        $scope.$on('code:changed', function(event, data) {
          Blueprint.set(data);
        });

        $scope.$on('blueprint:update', function(event, data) {
          if (data != $scope.codemirror.data.blueprint) {
            $scope.codemirror.setData($.extend(true, {}, data));
            $scope.$apply();
          }
        });

      }
    };
  });
