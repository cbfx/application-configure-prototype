angular.module('waldo.Blueprint')
  .directive('blueprintTopology', function($window, Drag) {
    return {
      restrict: 'E',
      replace: true,
      scope: {},
      controller: function($scope, Blueprint) {
        $scope.$on('blueprint:update', function(event, data) {
          $scope.blueprint = data;
          $scope.$apply();
          // console.log('[Blueprint topology]: blueprint broadcast caught in topology. we should render the topology.', data);
        });

        $window.addEventListener('resize', function () {
          $scope.$broadcast('window:resize');
        });
      },
      template: '<svg class="blueprint-topology"></svg>',
      link: function(scope, element, attrs) {
        var parent = angular.element(element).parent()[0];
        var d3 = $window.d3;
        var mouse;

        var zoom = d3.behavior.zoom()
            .scaleExtent([1, 10])
            .on("zoom", zoomed);

        var drag = d3.behavior.drag()
            .origin(function(d) { return d; })
            .on("dragstart", dragstarted)
            .on("drag", dragged)
            .on("dragend", dragended);

        var svg = d3.select(element[0]);

        var rect = svg.append("rect")
            .style("fill", "none")
            .style("pointer-events", "all");

        var container = svg.append("g")
            // .attr("transform", "translate(0,0)")
            // .call(zoom)
            // .append("g")
              .attr('class', 'container');

        var service;
        var component;

        svg.on("dragover", function() {
          mouse = d3.mouse(svg.node());
        });

        scope.$on('window:resize', resize);
        scope.$watch('blueprint.services', function(newVal) {
          if(newVal) {
            var blueprint = [];

            for(var key in newVal) {
              var _entry = newVal[key];
              _entry._id = key;
              blueprint.push(_entry);
            }

            draw(blueprint);
          }
        }, true);

        resize();

        function draw(blueprint) {
          container.selectAll('g.service').remove();

          resize();

          // Append service container
          service = container.selectAll('g.service')
              .data(blueprint)
            .enter()
            .append('g')
              .attr('class', function(d) {
                var classes = ['service'];
                classes.push(d._id);
                return classes.join(" ");
              })
              .attr('id', function(d) {
                return d._id + '-service';
              })
              .attr("transform", function(d) {
                d.x = d.x || mouse[0];
                d.y = d.y || mouse[1];
                return "translate(" + d.x + "," + d.y + ")"
              });

          // Service mouse events
          service.on("dragover", function(d) {
            Drag.target.set(d);
          }).on("dragleave", function(d) {
            Drag.target.set(null);
          }).call(drag);

          // Append title of service
          service.append('text')
            .text(function(d) {
              return d._id;
            });

          // Append visual service container
          service.append('rect')
            .attr("width", 40)
            .attr("height", 40)
            .attr("stroke", "red")
            .attr("fill","transparent");

          // Append components to service container
          component = service.selectAll('g.component')
              .data(function(d) {
                return d.components;
              })
            .enter()
              .append("g")
                .attr('class', 'component');

          component.append('text')
            .text(function(d) {
              return d;
            });
        }

        function resize() {
          svg.attr('width', parent.clientWidth);
          svg.attr('height', parent.clientHeight);

          rect.attr('width', parent.clientWidth);
          rect.attr('height', parent.clientHeight);
        }

        function zoomed() {
          container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        }

        function dragstarted(d) {
          d3.select(this).classed("dragging", true);
        }

        function dragged(d) {
          d.x = d3.event.x;
          d.y = d3.event.y;
          d3.select(this).attr("transform", "translate(" + d.x + "," + d.y + ")");
        }

        function dragended(d) {
          d3.select(this).classed("dragging", false);

          var services = d3.selectAll("g.service");
          //var relations = d3.selectAll("g.relation");
          var blueprint = {};

          services.each(function(d) {
            console.log(d);
            var id = d._id;
            delete d._id;
            blueprint[id] = d;
          });

          console.log(blueprint);

          //save();
        }
      }
    };
  });