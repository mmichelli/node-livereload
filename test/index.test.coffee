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
