var catalogData = {
    "web": {
        "apache": {
            "requires": [
                {
                    "host": "linux"
                }
            ], 
            "is": "web", 
            "id": "apache", 
            "provides": [
                {
                    "web": "apache"
                }
            ], 
            "options": {
                "server_alias": {
                    "type": "array", 
                    "example": [
                        "www.example.com", 
                        "blog.example.com"
                    ], 
                    "label": "Additional domain names to respond on"
                }, 
                "port": {
                    "default": 80, 
                    "type": "integer", 
                    "label": "Listening port"
                }, 
                "server_name": {
                    "type": "string", 
                    "example": "example.com", 
                    "label": "Site's domain name"
                }
            }
        }, 
        "nginx": {
            "is": "web", 
            "requires": [
                {
                    "host": "linux"
                }
            ], 
            "id": "nginx", 
            "provides": [
                {
                    "web": "nginx"
                }
            ]
        }
    }, 
    "monitoring": {
        "new-relic": {
            "provides": [
                {
                    "monitoring": "new-relic"
                }
            ], 
            "is": "monitoring", 
            "requires": [
                {
                    "host": "linux"
                }
            ], 
            "options": {
                "license": {
                    "type": "string", 
                    "label": "New Relic license key"
                }
            }, 
            "id": "new-relic"
        }
    }, 
    "database": {
        "mongodb": {
            "provides": [
                {
                    "database": "mongodb"
                }
            ], 
            "is": "database", 
            "requires": [
                {
                    "host": "linux"
                }
            ], 
            "options": {
                "port": {
                    "type": "integer", 
                    "label": "Listening port"
                }
            }, 
            "id": "mongodb"
        }, 
        "postgres": {
            "is": "database", 
            "requires": [
                {
                    "host": "linux"
                }
            ], 
            "id": "postgres", 
            "provides": [
                {
                    "database": "postgres"
                }
            ]
        }, 
        "mysql": {
            "is": "database", 
            "id": "mysql", 
            "provides": [
                {
                    "database": "mysql"
                }
            ], 
            "requires": [
                {
                    "host": "linux"
                }
            ], 
            "options": {
                "server_root_password": {
                    "default": "=generate_password(min_length=12, required_chars=[\"0123456789\", \"abcdefghijklmnopqrstuvwxyz\", \"ABCDEFGHIJKLMNOPQRSTUVWXYZ\"])", 
                    "required": true, 
                    "type": "password"
                }, 
                "username": {
                    "default": "root", 
                    "required": true
                }, 
                "password": {
                    "default": "=generate_password(min_length=12, required_chars=[\"0123456789\", \"abcdefghijklmnopqrstuvwxyz\", \"ABCDEFGHIJKLMNOPQRSTUVWXYZ\"])", 
                    "required": true, 
                    "type": "password"
                }
            }
        }
    }, 
    "cache": {
        "varnish": {
            "is": "cache", 
            "requires": [
                {
                    "host": "linux"
                }
            ], 
            "id": "varnish", 
            "provides": [
                {
                    "cache": "varnish"
                }
            ]
        }, 
        "memcache": {
            "provides": [
                {
                    "cache": "memcache"
                }
            ], 
            "is": "cache", 
            "requires": [
                {
                    "host": "linux"
                }
            ], 
            "options": {
                "monitoring": {
                    "default": false, 
                    "type": "boolean", 
                    "label": "Enable monitoring"
                }, 
                "port": {
                    "type": "integer", 
                    "label": "Listening port"
                }
            }, 
            "id": "memcache"
        }, 
        "redis": {
            "provides": [
                {
                    "cache": "redis"
                }
            ], 
            "is": "cache", 
            "requires": [
                {
                    "host": "linux"
                }
            ], 
            "options": {
                "port": {
                    "type": "integer", 
                    "label": "Listening port"
                }
            }, 
            "id": "redis"
        }
    }, 
    "storage": {
        "gluster": {
            "is": "storage", 
            "requires": [
                {
                    "host": "linux"
                }
            ], 
            "id": "gluster", 
            "provides": [
                {
                    "storage": "gluster"
                }
            ]
        }
    }, 
    "application": {
        "app": {
            "is": "application", 
            "id": "app", 
            "provides": [
                {
                    "application": "http"
                }
            ], 
            "requires": [
                {
                    "host": "linux"
                }
            ], 
            "options": {
                "demo": {
                    "type": "boolean", 
                    "label": "Enable Demo"
                }, 
                "packages": {
                    "type": "string", 
                    "label": "PHP Packages"
                }
            }
        }
    }
};

angular.module('waldo.Catalog', []);
angular.module('waldo.Catalog')
  .factory('Catalog', function(){
    return {
      data: {},
      get: function() {
        return window.catalogData;
      }
    };
  });
