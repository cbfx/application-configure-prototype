angular.module('waldo.Blueprint', [
  'ui.codemirror'
]);
angular.module('waldo.Blueprint')
  .factory('Blueprint', function($rootScope) {
    return {
      data: {},
      get: function() {
        return this.data;
      },
      set: function(blueprint) {
        this.data = blueprint;
        this.broadcast();
      },
      add: function(service, target) {
        // Add item to blueprint data.
        this.sort(service, target);
      },
      sort: function(service, target) {
        console.log('[Blueprint.sort()] service: ', service);
        console.log('[Blueprint.sort()] target: ', target);

        var serviceName = 'default';

        if (service.is) {
          serviceName = service.is;
        }

        if (typeof this.data.services === 'undefined') {
          this.data.services = {};
        }

        this.data.services[serviceName] = {
          components: [service.id]
        };

        this.broadcast();
      },
      broadcast: function() {
        $rootScope.$broadcast('blueprint:update', this.data);
      }
    };
  });

angular.module('waldo.Blueprint')
  .directive('blueprintZoom', function() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        var zoom = d3.behavior.zoom()
          .scaleExtent([1, 8])
          .on("zoom", zoomed);

        var container = d3.select(element[0]).call(zoom);

        function zoomed() {
          container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        }
      }
    };
  });

angular.module('waldo.Blueprint')
  .factory('Layout', function() {
    return {
      force: {
        data: null,
        set: function() {
          this.data = d3.layout.force();
          return this.data;
        },
        get: function() {
          return this.data;
        }
      }
    };
  });

angular.module('waldo.Blueprint')
  .directive('blueprintTopology', function(Layout) {
    return {
      restrict: 'E',
      scope: {},
      controller: function($scope, $window, Blueprint) {
        $scope.$on('blueprint:update', function(event, data) {
          $scope.blueprint = data;
          $scope.$apply();
          console.log('[Blueprint topology]: blueprint broadcast caught in topology. we should render the topology.', data);
        });

        $window.addEventListener('resize', function () {
          $scope.$broadcast('window:resize');
        });
      },
      templateUrl: '/scripts/common/services/blueprint-topology.tpl.html',
      link: function(scope, element, attrs) {
        // fake data
        scope.graph = {
          "nodes": [
            {"x": 469, "y": 410},
            {"x": 493, "y": 364},
            {"x": 442, "y": 365},
            {"x": 467, "y": 314},
            {"x": 477, "y": 248},
            {"x": 425, "y": 207},
            {"x": 402, "y": 155},
            {"x": 369, "y": 196},
            {"x": 350, "y": 148},
            {"x": 539, "y": 222},
            {"x": 594, "y": 235},
            {"x": 582, "y": 185},
            {"x": 633, "y": 200}
          ],
          "links": [
            {"source":  0, "target":  1},
            {"source":  1, "target":  2},
            {"source":  2, "target":  0},
            {"source":  1, "target":  3},
            {"source":  3, "target":  2},
            {"source":  3, "target":  4},
            {"source":  4, "target":  5},
            {"source":  5, "target":  6},
            {"source":  5, "target":  7},
            {"source":  6, "target":  7},
            {"source":  6, "target":  8},
            {"source":  7, "target":  8},
            {"source":  9, "target":  4},
            {"source":  9, "target": 11},
            {"source":  9, "target": 10},
            {"source": 10, "target": 11},
            {"source": 11, "target": 12},
            {"source": 12, "target": 10}
          ]
        };

        var parent = angular.element(element).parent()[0];

        scope.width = parent.clientWidth;
        scope.height = parent.clientHeight;

        scope.force = Layout.force.set()
            .size([scope.width, scope.height])
            .charge(-400)
            .linkDistance(40);

        scope.force
            .nodes(scope.graph.nodes)
            .links(scope.graph.links)
            .on("tick", tick)
            .start();

        scope.$on('window:resize', resize);

        function tick() {
          scope.$apply();
        }

        function resize() {
          scope.width = parent.clientWidth;
          scope.height = parent.clientHeight;
          tick();
        }
      }
    };
  });
