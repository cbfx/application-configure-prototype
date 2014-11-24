angular.module('waldo.Blueprint', []);
angular.module('waldo.Blueprint')
  .factory('Blueprint', function($rootScope) {  
    return {
      data: {},
      get: function() {
        return this.data;
      },
      set: function(blueprint) {
        this.data = blueprint;
        this.emit();
      },
      add: function(service, target) {
        // Add item to blueprint data.
        this.sort(service, target);
      },
      sort: function(service, target) {
        // TODO: write logic that sorts in catalog object to blueprint model:
        console.log(service);
        console.log(target);

        this.data = {};
        this.emit();
      },
      emit: function() {
        $rootScope.$emit('blueprint:update', this.data);
      }
    };
  });

angular.module('waldo.Blueprint')
  .directive('blueprintTopology', function() {
    return {
      restrict: 'E',
      scope: {},
      controller: function($scope, $window, Blueprint) {
        $window.addEventListener('resize', function () {
          $scope.$broadcast('window:resize');
        });

        $scope.blueprint = Blueprint.get();

        $scope.$watch('blueprint', function() {

        });

        $scope.$on('blueprint:update', function() {
          console.log('blueprint emit caught in topology');
        });
      },
      link: function(scope, element, attrs) {
        // fake data
        var graph = {
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

        var width = parent.clientWidth,
            height = parent.clientHeight;

        var zoom = d3.behavior.zoom()
            .scaleExtent([1, 8])
            .on("zoom", zoomed);

        var force = d3.layout.force()
            .size([width, height])
            .charge(-400)
            .linkDistance(40)
            .on("tick", tick);

        var drag = force.drag()
            .on("dragstart", dragstart);

        var svg = d3.select(element[0]).append("svg")
            .attr("width", width)
            .attr("height", height);

        var container = svg.append("g")
                .call(zoom)
                .append("g");

        container.append("rect")
          .attr("class", "overlay")
          .attr("width", width)
          .attr("height", height);

        var link = container.selectAll(".link"),
            node = container.selectAll(".node");

        force
            .nodes(graph.nodes)
            .links(graph.links)
            .start();

        link = link.data(graph.links)
          .enter().append("line")
            .attr("class", "link");

        node = node.data(graph.nodes)
          .enter().append("circle")
            .attr("class", "node")
            .attr("r", 12)
            .on("dblclick", dblclick)
            .call(drag);

        scope.$on('window:resize', resize);
        //scope.$watch('blueprint', update);

        function tick() {
          link.attr("x1", function(d) { return d.source.x; })
              .attr("y1", function(d) { return d.source.y; })
              .attr("x2", function(d) { return d.target.x; })
              .attr("y2", function(d) { return d.target.y; });

          node.attr("cx", function(d) { return d.x; })
              .attr("cy", function(d) { return d.y; });
        }

        function dblclick(d) {
          //d3.select(this).classed("fixed", d.fixed = false);
        }

        function dragstart(d) {
          d3.event.sourceEvent.stopPropagation();
          d3.select(this).classed("fixed", d.fixed = true);
        }

        function resize() {
          svg.attr("width", parent.clientWidth);
          svg.attr("height", parent.clientHeight);
        }

        function zoomed() {
          container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        }
      }
    };
  });