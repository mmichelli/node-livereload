(function() {
  var Server, defaultExclusions, defaultExts, defaultPort, fs, path, version, ws;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __slice = Array.prototype.slice;
  fs = require('fs');
  path = require('path');
  ws = require('websocket-server');
  version = '1.5';
  defaultPort = 35729;
  defaultExts = ['html', 'css', 'js', 'png', 'gif', 'jpg', 'php', 'php5', 'py', 'rb', 'erb'];
  defaultExclusions = ['.git/', '.svn/', '.hg/'];
  Server = (function() {
    function Server(config) {
      var _base, _base2, _base3, _base4, _base5, _base6, _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
      this.config = config;
      (_ref = this.config) != null ? _ref : this.config = {};
      (_ref2 = (_base = this.config).version) != null ? _ref2 : _base.version = version;
      (_ref3 = (_base2 = this.config).port) != null ? _ref3 : _base2.port = defaultPort;
      (_ref4 = (_base3 = this.config).exts) != null ? _ref4 : _base3.exts = [];
      (_ref5 = (_base4 = this.config).exclusions) != null ? _ref5 : _base4.exclusions = [];
      this.config.exts = this.config.exts.concat(defaultExts);
      this.config.exclusions = this.config.exclusions.concat(defaultExclusions);
      (_ref6 = (_base5 = this.config).applyJSLive) != null ? _ref6 : _base5.applyJSLive = false;
      (_ref7 = (_base6 = this.config).applyCSSLive) != null ? _ref7 : _base6.applyCSSLive = true;
      this.server = ws.createServer();
      this.server.on('connection', this.onConnection.bind(this));
      this.server.on('close', this.onClose.bind(this));
    }
    Server.prototype.listen = function() {
      this.debug("LiveReload is waiting for browser to connect.");
      return this.server.listen(this.config.port);
    };
    Server.prototype.onConnection = function(connection) {
      this.debug("Browser connected.");
      connection.write("!!ver:" + this.config.version);
      return connection.on('message', __bind(function(message) {
        return this.debug("Browser URL: " + message);
      }, this));
    };
    Server.prototype.onClose = function(connection) {
      return this.debug("Browser disconnected.");
    };
    Server.prototype.walkTree = function(dirname, callback) {
      var exclusions, exts, walk;
      exts = this.config.exts;
      exclusions = this.config.exclusions;
      walk = function(dirname) {
        return fs.readdir(dirname, function(err, files) {
          if (err) {
            return callback(err);
          }
          return files.forEach(function(file) {
            var exclusion, filename, _i, _len;
            filename = path.join(dirname, file);
            for (_i = 0, _len = exclusions.length; _i < _len; _i++) {
              exclusion = exclusions[_i];
              if (filename.match(exclusion)) {
                return;
              }
            }
            return fs.stat(filename, function(err, stats) {
              var ext, _i, _len, _results;
              if (!err && stats.isDirectory()) {
                return walk(filename);
              } else {
                _results = [];
                for (_i = 0, _len = exts.length; _i < _len; _i++) {
                  ext = exts[_i];
                  if (filename.match("\." + ext + "$")) {
                    callback(err, filename);
                    break;
                  }
                }
                return _results;
              }
            });
          });
        });
      };
      return walk(dirname, callback);
    };
    Server.prototype.watch = function(dirname) {
      return this.walkTree(dirname, __bind(function(err, filename) {
        if (err) {
          throw err;
        }
        return fs.watchFile(filename, __bind(function(curr, prev) {
          if (curr.mtime > prev.mtime) {
            return this.refresh(filename);
          }
        }, this));
      }, this));
    };
    Server.prototype.refresh = function(path) {
      this.debug("Refresh: " + path);
      return this.server.broadcast(JSON.stringify([
        'refresh', {
          path: path,
          apply_js_live: this.config.applyJSLive,
          apply_css_live: this.config.applyCSSLive
        }
      ]));
    };
    Server.prototype.debug = function(str) {
      if (this.config.debug) {
        return process.binding('stdio').writeError("" + str + "\n");
      }
    };
    return Server;
  })();
  exports.createServer = function() {
    var args, server;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    server = (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return typeof result === "object" ? result : child;
    })(Server, args, function() {});
    server.listen();
    return server;
  };
}).call(this);
