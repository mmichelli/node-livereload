node-livereload
===============

An implementation of the LiveReload server in Node.js.

Install the browser plugin and read more about the project at:

  https://github.com/mockko/livereload

# Example

    livereload = require('livereload');
    server = livereload.createServer();
    server.watch(__dirname + "/public");

Use with a connect server:

    connect = require('connect');
    connect.createServer(
      connect.compiler({ src: __dirname + "/public", enable: ['less'] }),
      connect.staticProvider(__dirname + "/public")
    ).listen(3000);

    livereload = require('livereload');
    server = livereload.createServer(exts: ['less']);
    server.watch(__dirname + "/public");

# Installation

    $ npm install livereload

# License

Copyright (c) 2010 Joshua Peek.

Released under the MIT license. See `LICENSE` for details.
