angular.module('waldo.Drag', []);
angular.module('waldo.Drag')
  .factory('Drag', function() {  
    return {
      reset: function() {
        this.target.data = null;
        this.current.data = null;
      },
      target: {
        data: null,
        get: function() {
          return this.data;
        },
        set: function(data) {
          this.data = data;
        }
      },
      current: {
        data: null,
        get: function() {
          return this.data;
        },
        set: function(data) {
          this.data = data;
        }
      }
    };
  });