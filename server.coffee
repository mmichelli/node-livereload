connect = require 'connect'

connect.createServer connect.logger(format: ':method :url'),
  connect.compiler(src: "#{__dirname}", enable: ['less']),
  connect.staticProvider("#{__dirname}")
.listen 3000

livereload = require 'livereload'
server = livereload.createServer debug: true, exts: ['less']
server.watch "#{__dirname}"
