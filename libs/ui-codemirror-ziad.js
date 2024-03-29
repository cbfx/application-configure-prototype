/* global angular, CodeMirror, Error */
/**
 * The Best Of `ui-codemirror circa 2013` and `ui-codemirror 0.1.6`
 * Hacked by: Ziad Sawalha
 */
angular.module('ui.codemirror', [])
  .constant('uiCodemirrorConfig', {})
  .directive('uiCodemirror', ['uiCodemirrorConfig', '$timeout',
    function (uiCodemirrorConfig, $timeout) {
      'use strict';

      var events = ["cursorActivity", "viewportChange", "gutterClick", "focus", "blur", "scroll", "update"];

      return {
        restrict: 'EA',
        require: '?ngModel',
        priority: 1,
        compile: function compile() {

          // Require CodeMirror
          if (angular.isUndefined(window.CodeMirror)) {
            throw new Error('ui-codemirror needs CodeMirror to work...');
          }

          return function postLink(scope, iElement, iAttrs, ngModel) {
            var options, opts, codeMirror, initialTextValue, onChange, deferCodeMirror;

            initialTextValue = iElement.text();
            options = uiCodemirrorConfig.codemirror || {};
            opts = angular.extend({ value: initialTextValue }, options, scope.$eval(iAttrs.uiCodemirror), scope.$eval(iAttrs.uiCodemirrorOpts));

            if (iElement[0].tagName === 'TEXTAREA') {
              // Might bug but still ...
              codeMirror = window.CodeMirror.fromTextArea(iElement[0], opts);
            } else {
              iElement.html('');
              codeMirror = new window.CodeMirror(function (cm_el) {
                iElement.append(cm_el);
              }, opts);
            }

            if (iAttrs.uiCodemirror || iAttrs.uiCodemirrorOpts) {
              var codemirrorDefaultsKeys = Object.keys(window.CodeMirror.defaults);
              scope.$watch(iAttrs.uiCodemirror || iAttrs.uiCodemirrorOpts, function updateOptions(newValues, oldValue) {
                if (!angular.isObject(newValues)) {
                  return;
                }
                codemirrorDefaultsKeys.forEach(function (key) {
                  if (newValues.hasOwnProperty(key)) {
                    if (oldValue && newValues[key] === oldValue[key]) {
                      return;
                    }
                    codeMirror.setOption(key, newValues[key]);
                  }
                });
              }, true);
            }

            for (var i = 0, n = events.length, aEvent; i < n; ++i) {
              aEvent = opts["on" + events[i].charAt(0).toUpperCase() + events[i].slice(1)];
              if (aEvent === void 0) {
                continue;
              }
              if (typeof aEvent !== "function") {
                continue;
              }
              codeMirror.on(events[i], aEvent);
            }

            if (ngModel) {
              // CodeMirror expects a string, so make sure it gets one.
              // This does not change the model.
              ngModel.$formatters.push(function (value) {
                if (angular.isUndefined(value) || value === null) {
                  return '';
                } else if (angular.isArray(value)) {
                  if (codeMirror.options.mode === 'yaml') {
                    return jsyaml.safeDump(value) || '';
                  } else {
                    throw new Error('ui-codemirror can only use an array as a model in yaml mode (current mode is ' + codeMirror.options.mode + '\')');
                  }
                } else if (angular.isObject(value)) {
                  if (codeMirror.options.mode === 'yaml') {
                    return jsyaml.safeDump(value) || '';
                  } else if (codeMirror.options.mode === 'json') {
                    return JSON.stringify(value, null, 2) || '';
                  } else {
                    throw new Error('ui-codemirror can only have an object as a model if it is in yaml or json model (current mode is ' + codeMirror.options.mode + '\')');
                  }
                }
                return value;
              });

              // Override the ngModelController $render method, which is what gets called when the model is updated.
              // This takes care of the synchronizing the codeMirror element with the underlying model, in the case that it is changed by something else.
              ngModel.$render = function () {
                //Code mirror expects a string so make sure it gets one
                //Although the formatter have already done this, it can be possible that another formatter returns undefined (for example the required directive)
                var safeViewValue = ngModel.$viewValue || '';
                if (codeMirror) {
                  codeMirror.setValue(safeViewValue);
                } else {
                  initialTextValue = safeViewValue;
                }
              };

              scope.changeHandler = function(instance) {
                var newValue = instance.getValue();
                var parsedValue;
                if (instance.options.mode === 'yaml') {
                  parsedValue = jsyaml.load(newValue);
                } else if (codeMirror.options.mode === 'json') {
                  parsedValue = JSON.parse(newValue);
                } else {
                  throw new Error('ui-codemirror can only have an object as a model if it is in yaml or json model (current mode is ' + codeMirror.options.mode + '\')');
                }

                if (parsedValue != ngModel.$modelValue) {
                  // Changes to the model from a callback need to be wrapped in $apply or angular will not notice them
                  scope.$apply(function() {
                    ngModel.$setViewValue(parsedValue);  //Bad name; this set the model value
                    scope.$emit('code:changed', parsedValue);
                  })
                } else {
                  scope.$apply();
                }
              }
              // Keep the ngModel in sync with changes from CodeMirror
              codeMirror.on('keyup', scope.changeHandler);
              codeMirror.on('contextmenu', scope.changeHandler);
              codeMirror.on('drop', scope.changeHandler);
              codeMirror.on('redraw', function() {
                $scope.apply();
              });
            }

            // Allow access to the CodeMirror instance through a broadcasted event
            // eg: $broadcast('CodeMirror', function(cm){...});
            scope.$on('CodeMirror', function (event, callback) {
              if (angular.isFunction(callback)) {
                callback(codeMirror);
              } else {
                throw new Error('the CodeMirror event requires a callback function');
              }
            });

            // onLoad callback
            if (angular.isFunction(opts.onLoad)) {
              opts.onLoad(codeMirror);
            }

          };
        }
      };
    }
  ]);
