fs   = require 'fs'
path = require 'path'
ws   = require 'websocket-server'

version = '1.5'
defaultPort = 35729

defaultExts = [
  'html', 'css', 'js', 'png', 'gif', 'jpg',
  'php', 'php5', 'py', 'rb', 'erb'
]

defaultExclusions = ['.git/', '.svn/', '.hg/']

class Server
  constructor: (@config) ->
    @config ?= {}

    @config.version ?= version
    @config.port    ?= defaultPort

    @config.exts       ?= []
    @config.exclusions ?= []

    @config.exts       = @config.exts.concat defaultExts
    @config.exclusions = @config.exclusions.concat defaultExclusions

    @config.applyJSLive  ?= false
    @config.applyCSSLive ?= true

    @server = ws.createServer()

    @server.on 'connection', @onConnection.bind @
    @server.on 'close',      @onClose.bind @

  listen: ->
    @debug "LiveReload is waiting for browser to connect."
    @server.listen @config.port

  onConnection: (connection) ->
    @debug "Browser connected."
    connection.write "!!ver:#{@config.version}"

    connection.on 'message', (message) =>
      @debug "Browser URL: #{message}"

  onClose: (connection) ->
    @debug "Browser disconnected."

  walkTree: (dirname, callback) ->
    exts       = @config.exts
    exclusions = @config.exclusions

    walk = (dirname) ->
      fs.readdir dirname, (err, files) ->
        if err then return callback err

        files.forEach (file) ->
          filename = path.join dirname, file

          for exclusion in exclusions
            return if filename.match exclusion

          fs.stat filename, (err, stats) ->
            if !err and stats.isDirectory()
              walk filename
            else
              for ext in exts when filename.match "\.#{ext}$"
                callback err, filename
                break

    walk dirname, callback

  watch: (dirname) ->
    @walkTree dirname, (err, filename) =>
      throw err if err
      fs.watchFile filename, (curr, prev) =>
        if curr.mtime > prev.mtime
          @refresh filename

  refresh: (path) ->
    @debug "Refresh: #{path}"
    @server.broadcast JSON.stringify ['refresh',
      path: path,
      apply_js_live: @config.applyJSLive,
      apply_css_live: @config.applyCSSLive
    ]

  debug: (str) ->
    if @config.debug
      process.binding('stdio').writeError "#{str}\n"

exports.createServer = (args...) ->
  server = new Server args...
  server.listen()
  server
