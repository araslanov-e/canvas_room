#!/usr/bin/env ruby
#
# this HTTP server logs its actions to stdout
require 'webrick'
include WEBrick
# Create server
server = HTTPServer.new(
  :Port            => 8000,
  :DocumentRoot    => Dir::pwd
)
# When the server gets a control-C, kill it
trap("INT"){ server.shutdown }
# Start the server
server.start
