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
        this.data = angular.copy(blueprint);
        this.broadcast();
      },
      add: function(component, target) {
        // Add item to blueprint data.
        this.sort(component, target);
      },
      sort: function(component, target) {
        var serviceName = 'default';

        if (component.is) {
          serviceName = component.is;
        }

        if (typeof this.data.services === 'undefined') {
          this.data.services = {};
        }

        if (serviceName in this.data.services) {
          if (!this.componentInService(component, serviceName)) {
            this.addComponentToService(component, serviceName);
          } else {
            return;
          }
        } else {
          this.addService(serviceName, component);
        }
        this.broadcast();
      },
      componentInService: function(component, serviceName) {
        return this.data.services && serviceName in this.data.services && this.data.services[serviceName].components.indexOf(component.id) > -1;
      },
      addComponentToService: function(component, serviceName) {
        this.data.services[serviceName].components.push(component.id);
      },
      addService: function(serviceName, firstComponent) {
        this.data.services[serviceName] = {
          annotations: {},
          components: [firstComponent.id]
        };
      },
      broadcast: function() {
        $rootScope.$broadcast('blueprint:update', this.data);
      }
    };
  });
