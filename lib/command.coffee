runner = ->

  livereload = require './livereload'
  resolve    = require('path').resolve
  opts       = require 'opts'
  debug      = false;
  opts.parse [
    {
      short: "p"
      long:  "port"
      description: "Specify the port"
      value: true
      required: false
    }
    {
      short: "i"
      long:  "interval"
      description: "Specify the interval"
      value: true
      required: false
    }
    {
      short: "d"
      long: "debug"
      description: "Additional debugging information",
      required: false,
      callback: -> debug = true
    }
  ].reverse(), true

  port = opts.get('port') || 35729
  interval = opts.get('interval') || 1000

  server = livereload.createServer({port: port, interval: interval, debug: debug})

  path = resolve(process.argv[2] || '.')
  console.log "Starting LiveReload for #{path} on port #{port}."
  server.watch(path)
  console.log "Polling for changes every #{interval}ms."

module.exports =
  run: runner
