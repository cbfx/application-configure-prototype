angular.module('waldo.Blueprint')
  .directive('blueprintTopology', function($window, Drag, Blueprint, $timeout, Catalog) {
    return {
      restrict: 'E',
      replace: true,
      scope: {},
      controller: function($scope) {
        $scope.catalog = Catalog.get();

        $scope.getTattoo = function(componentId) {
          return (((Catalog.getComponent(componentId) || {})['meta-data'] || {})['display-hints'] || {})['tattoo'] || '';
        };

        $scope.select = function(selection) {
          $scope.$emit('topology:select', selection);
        };

        $scope.$on('blueprint:update', function(event, data) {
          $timeout(function() {
            $scope.blueprint = angular.copy(data);
          });
        });

        $window.addEventListener('resize', function () {
          $scope.$broadcast('window:resize');
        });
      },
      template: '<svg class="blueprint-topology" xmlns:xlink="http://www.w3.org/1999/xlink"></svg>',
      link: function(scope, element, attrs) {
        var parent = angular.element(element).parent()[0];
        var d3 = $window.d3;
        var mouse;
        var service;
        var component;

        var sizes = {
          component: {
            width: function() {
              return 160;
            },
            height: function() {
              return 160
            },
            margin: {
              top: 10,
              right: 10,
              bottom: 10,
              left: 10
            }
          },
          service: {
            height: function(components) {
              var rows = Math.ceil(components / sizes.service.rows);
              var height = (sizes.component.height() * rows);
              height = height + sizes.service.margin.top + sizes.service.margin.bottom;

              return height;
            },
            width: function(components) {
              var columns = components;

              if(components > sizes.service.columns) {
                columns = Math.ceil(components / sizes.service.columns);
              }

              var width = (sizes.component.width() * columns);
              width = width + sizes.service.margin.left + sizes.service.margin.right;

              return width;
            },
            columns: 4,
            rows: 4,
            margin: {
              top: 10,
              right: 10,
              bottom: 40,
              left: 10
            },
            radius: 10
          }
        };

        var zoom = d3.behavior.zoom()
            .scaleExtent([.6, 7])
            .on("zoom", zoomed);

        var drag = d3.behavior.drag()
            .origin(function(d) { return d; })
            .on("dragstart", dragstarted)
            .on("drag", dragged)
            .on("dragend", dragended);

        var svg = d3.select(element[0]);

        var zoomer = svg.append("g")
            .attr("transform", "translate(0,0)")
            .call(zoom);

        var rect = zoomer.append("rect")
            .style("fill", "none")
            .style("pointer-events", "all");

        var container = zoomer.append("g")
            .call(zoom)
            .attr('class', 'container');

        // This listens for mouse events on the entire svg element.
        svg.on("dragover", function() {
          mouse = d3.mouse(svg.node());
        }).on("drop", function() {
          save();
        });

        // These are the Angular watch and listeners.
        scope.$on('window:resize', resize);
        scope.$watch('blueprint', function(newVal, oldVal) {
          if(newVal && newVal !== oldVal) {
            var blueprint = [];
            var services = angular.copy(newVal.services);

            for(var key in services) {
              var _entry = services[key];
              _entry._id = key;
              blueprint.push(_entry);
            }

            draw(blueprint);
          }
        }, true);

        // Immediately give a full width/height to svg.
        resize();

        // This draws (or redraws) the blueprint.
        function draw(blueprint) {
          // This resizes and cleans up old container elements.
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
                d.x = d.annotations['gui-x'] || mouse[0];
                d.y = d.annotations['gui-y'] || mouse[1];

                return "translate(" + d.x + "," + d.y + ")"
              });

          // This defines service drag events.
          service.on("dragover", function(d) {
            Drag.target.set(d);
          }).on("dragleave", function(d) {
            Drag.target.set(null);
          }).call(drag);

          // This append the service rectangle container.
          service.append('rect')
          .attr('class', 'service-container')
          .attr("width", function(d) {
            return sizes.service.width(d.components.length);
          })
          .attr("height", function(d) {
            return sizes.service.height(d.components.length);
          })
          .attr('rx', sizes.service.radius)
          .attr('ry', sizes.service.radius);

          // This appends the title of service.
          var title = service.append('text')
            .attr('class', 'service-title');

          title.append('title')
            .text(function(d) {
              return d._id;
            });

          title.append('tspan')
            .attr('text-anchor', 'middle')
            .attr('x', function(d) {
              return sizes.service.width(d.components.length) / 2;
            })
            .attr('y', function(d) {
              return sizes.service.height(d.components.length) - (sizes.service.margin.bottom / 2) + 3;
            })
            .text(function(d){
              return d._id.toUpperCase();
            });

          // This appends components to service container.
          component = service.selectAll('g.component')
              .data(function(d) {
                return d.components;
              })
            .enter()
              .append("g")
                .attr('class', 'component')
                .on('click', function(d) {
                  if(d3.event.defaultPrevented) {
                    return;
                  }

                  var data = {
                    service: d3.select(this.parentNode).datum()._id,
                    component: d,
                    relation: null
                  };

                  scope.select(data);
                });

          component.append('rect')
            .attr('width', sizes.component.width())
            .attr('height', sizes.component.height())
            .attr('x', function(d, index) {
              return sizes.service.margin.left + (sizes.component.width() * (index));
            })
            .attr('y', function(d, index) {
              return sizes.service.margin.top;
            })
            .attr('class', 'component-container');

          component.append('image')
            .attr('fill', 'black')
            .attr('width', sizes.component.width() - 50)
            .attr('height', sizes.component.height() - 50)
            .attr('transform', function(d, index) {
              var x = sizes.service.margin.left + (sizes.component.width() * (index)) + 25;
              var y = sizes.service.margin.top + 37;

              return 'translate('+x+','+y+')';
            })
            .attr('xlink:href', function(d) {
              return scope.getTattoo(d);
            })
            .attr('class', 'component-icon');

          var linker = component.append('g')
            .attr('class', 'relation-linker');

          linker.append('circle')
            .attr('r', 12)
            .attr('fill', '#f6f6f6')
            .attr('cx', function(d, index) {
              return sizes.service.margin.left + (sizes.component.width() * (index + 1)) - 18;
            })
            .attr('cy', function(d, index) {
              return sizes.component.height() - 7;
            })
            .attr('class', 'relation-link-container');

          linker.append('text')
            .html('&#xf0c1')
            .attr('x', function(d, index) {
              return sizes.service.margin.left + (sizes.component.width() * (index + 1)) - 24;
            })
            .attr('y', function(d, index) {
              return sizes.component.height() - 2;
            })
            .attr('class', 'fa-link relation-linker-icon');

          // This adds a component label.
          var label = component.append('text')
            .attr('class', 'component-title');

          label.append('title')
            .text(function(d) {
              return d;
            });

          label.append('tspan')
            .attr('text-anchor', 'middle')
            .attr('x', function(d, index) {
              var x = sizes.service.margin.left + (sizes.component.width() / 2);

              if(index > 0) {
                x = x + (sizes.component.width() * index);
              }

              return x;
            })
            .attr('y', function(d) {
              return sizes.service.margin.top + 25;
            })
            .text(function(d) {
              var label = d;

              if(d.length > 12) {
                label = label.slice(0,9) + '...';
              }

              return label;
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
          d3.event.sourceEvent.stopPropagation();
          d3.select(this).classed("dragging dragged", true);
        }

        function dragged(d) {
          d.x = d3.event.x;
          d.y = d3.event.y;
          d3.select(this).attr("transform", "translate(" + d.x + "," + d.y + ")");
        }

        function dragended(d) {
          d3.event.sourceEvent.stopPropagation();
          d3.select(this).classed("dragging", false);
          save();
        }

        function save() {
          var services = d3.selectAll("g.service");
          //var relations = d3.selectAll("g.relation");
          var blueprint = {
            services: {}
          };

          // This loops over the svg's services and converts it to an object.
          services.each(function(d) {
            var _service = angular.copy(d);

            // This removes svg-related properties.
            delete _service._id;
            delete _service.x;
            delete _service.y;

            // This adds annotations property.
            _service.annotations = {
              'gui-x': Number(d.x.toFixed(3)),
              'gui-y': Number(d.y.toFixed(3))
            };

            // This extends any current
            blueprint.services[d._id] = blueprint.services[d._id] || {};
            _.extend(blueprint.services[d._id], _service);
          });

          Blueprint.set(blueprint);
        }
      }
    };
  });
