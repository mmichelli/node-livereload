runner = ->

  livereload = require './livereload'
  resolve    = require('path').resolve
  opts       = require 'opts'

  opts.parse [
    {
      short: "p"
      long:  "port"
      description: "Specify the port"
      value: true
      required: false
    }
  ].reverse(), true

  port = opts.get('port') || 35729

  server = livereload.createServer({port: port, debug: true})

  path = resolve(process.argv[2] || '.')

  console.log('Starting LiveReload for ' + path)

  server.watch(path)

module.exports =
  run: runner
