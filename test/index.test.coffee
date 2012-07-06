livereload = require('../lib/livereload')
should = require 'should'
request = require('request')
fs = require('fs')

describe 'livereload http file servingt', ->
	it 'should serve up livereload.js', (done) ->
		server = livereload.createServer({port: 35729, debug: true})

		fileContents = fs.readFileSync('./ext/livereload.js').toString()

		request 'http://localhost:35729/livereload.js?snipver=1', (error, response, body) ->
			should.not.exist error
			response.statusCode.should.equal 200
			fileContents.should.equal body

			server.config.server.close()

			done()
  it 'should allow you to override the internal http server', (done) ->
    app = http.createServer (req, res) ->
      if url.parse(req.url).pathname is '/livereload.js'
        res.writeHead(200, {'Content-Type': 'text/javascript'})
        res.end '// nothing to see here'

    server = livereload.createServer({port: 35729, server: app})

    request 'http://localhost:35729/livereload.js?snipver=1', (error, response, body) ->
      should.not.exist error
      response.statusCode.should.equal 200
      body.should.equal '// nothing to see here'

      server.config.server.close()

      done()
