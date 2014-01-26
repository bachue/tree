$: << File.expand_path(File.dirname(__FILE__) + '/app/apis')
$: << File.expand_path(File.dirname(__FILE__) + '/app/models')
$: << File.expand_path(File.dirname(__FILE__) + '/app/entities')
$: << File.expand_path(File.dirname(__FILE__) + '/lib')

require "rubygems"
require "bundler/setup"
require 'goliath'
require 'em-synchrony/activerecord'
require 'rack/contrib/try_static'
require 'pathname'
require 'grape'
require 'grape-entity'

require 'api'

class Application < Goliath::API
  ROOT = Pathname File.expand_path(File.dirname(__FILE__)) unless defined?(ROOT)
  APP_ENV = ENV['APP_ENV'] || 'development' unless defined?(APP_ENV)

  # TODO: Write your own code to replace with TryStatic
  # use Rack::TryStatic,
  #               root: File.expand_path(File.dirname(__FILE__) + '/public'),
  #               urls: %w[/], try: ['.html', 'index.html', '/index.html']

  def response(env)
    request = Rack::Request.new env
    case request.path_info
    when %r{^/+api/}
      ::API.call(env)
    else
      [404, {}, '']
    end
  end
end

require 'git'
require 'app_logger'
