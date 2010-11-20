(function() {
  var Server, defaultExclusions, defaultExts, defaultPort, fs, path, version, ws;
  var __bind = function(func, context) {
    return function(){ return func.apply(context, arguments); };
  }, __slice = Array.prototype.slice, __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__super__ = parent.prototype;
  };
  fs = require('fs');
  path = require('path');
  ws = require('websocket-server');
  version = '1.4';
  defaultPort = 35729;
  defaultExts = ['html', 'css', 'js', 'png', 'gif', 'jpg', 'php', 'php5', 'py', 'rb', 'erb'];
  defaultExclusions = ['.git/', '.svn/', '.hg/'];
  Server = function(_arg) {
    this.config = _arg;
    this.config = (typeof this.config !== "undefined" && this.config !== null) ? this.config : {};
    this.config.version = (typeof this.config.version !== "undefined" && this.config.version !== null) ? this.config.version : version;
    this.config.port = (typeof this.config.port !== "undefined" && this.config.port !== null) ? this.config.port : defaultPort;
    this.config.exts = (typeof this.config.exts !== "undefined" && this.config.exts !== null) ? this.config.exts : [];
    this.config.exclusions = (typeof this.config.exclusions !== "undefined" && this.config.exclusions !== null) ? this.config.exclusions : [];
    this.config.exts = this.config.exts.concat(defaultExts);
    this.config.exclusions = this.config.exclusions.concat(defaultExclusions);
    this.config.applyJSLive = (typeof this.config.applyJSLive !== "undefined" && this.config.applyJSLive !== null) ? this.config.applyJSLive : false;
    this.config.applyCSSLive = (typeof this.config.applyCSSLive !== "undefined" && this.config.applyCSSLive !== null) ? this.config.applyCSSLive : true;
    this.server = ws.createServer();
    this.server.on('connection', this.onConnection.bind(this));
    this.server.on('close', this.onClose.bind(this));
    return this;
  };
  Server.prototype.listen = function() {
    this.debug("LiveReload is waiting for browser to connect.");
    return this.server.listen(this.config.port);
  };
  Server.prototype.onConnection = function(connection) {
    this.debug("Browser connected.");
    connection.write("!!ver:" + (this.config.version));
    return connection.on('message', __bind(function(message) {
      return this.debug("Browser URL: " + (message));
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
          var _i, _len, _ref, exclusion, filename;
          filename = path.join(dirname, file);
          _ref = exclusions;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            exclusion = _ref[_i];
            if (filename.match(exclusion)) {
              return null;
            }
          }
          return fs.stat(filename, function(err, stats) {
            var _j, _len2, _ref2, _result, ext;
            if (!err && stats.isDirectory()) {
              return walk(filename);
            } else {
              _result = []; _ref2 = exts;
              for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
                ext = _ref2[_j];
                if (filename.match("\." + (ext) + "$")) {
                  callback(err, filename);
                  break;
                }
              }
              return _result;
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
        return curr.mtime > prev.mtime ? this.refresh(filename) : null;
      }, this));
    }, this));
  };
  Server.prototype.refresh = function(path) {
    this.debug("Refresh: " + (path));
    return this.server.broadcast(JSON.stringify([
      'refresh', {
        path: path,
        apply_js_live: this.config.applyJSLive,
        apply_css_live: this.config.applyCSSLive
      }
    ]));
  };
  Server.prototype.debug = function(str) {
    return this.config.debug ? process.binding('stdio').writeError("" + (str) + "\n") : null;
  };
  exports.createServer = function() {
    var _ctor, _ref, _result, args, server;
    args = __slice.call(arguments, 0);
    server = (function() {
      var ctor = function(){};
      __extends(ctor, _ctor = Server);
      return typeof (_result = _ctor.apply(_ref = new ctor, args)) === "object" ? _result : _ref;
    }).call(this);
    server.listen();
    return server;
  };
}).call(this);
