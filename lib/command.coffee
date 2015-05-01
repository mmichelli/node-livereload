runner = ->

  livereload = require './livereload'
  resolve    = require('path').resolve
  opts       = require 'opts'
  debug      = true;
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
      short: "q"
      long: "quiet"
      description: "supress the debugging console logs",
      required: false,
      callback: -> debug = false
    }
  ].reverse(), true

  port = opts.get('port') || 35729
  interval = opts.get('interval') || 1000

  server = livereload.createServer({port: port, interval: interval, debug: debug})

  path = resolve(process.argv[2] || '.')
  if debug
    console.log "Starting LiveReload for #{path} on port #{port}."

  server.watch(path)
  if debug
    console.log "Polling for changes every #{interval}ms."

module.exports =
  run: runner
