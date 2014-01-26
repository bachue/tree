$: << File.expand_path(File.dirname(__FILE__) + '/app/apis')
$: << File.expand_path(File.dirname(__FILE__) + '/app/models')
$: << File.expand_path(File.dirname(__FILE__) + '/lib')

require "rubygems"
require "bundler/setup"
require 'goliath'
require 'em-synchrony/activerecord'
require 'rack/contrib/try_static'
require 'pathname'
require 'grape'

require 'git'
require 'api_logger'

require 'api'

class Application < Goliath::API
  ROOT = Pathname File.expand_path(File.dirname(__FILE__))
  APP_ENV = ENV['APP_ENV'] || 'development'

  use Rack::TryStatic,
                root: File.expand_path(File.dirname(__FILE__) + '/public'),
                urls: %w[/], try: ['.html', 'index.html', '/index.html']
  def response(env)
    ::API.call(env)
  end
end