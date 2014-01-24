require 'sinatra'
require 'haml'
require 'rack/coffee'
require './contest.rb'

# use coffeescript for javascript
use Rack::Coffee, root: 'public', urls: '/js'

run Sinatra::Application
