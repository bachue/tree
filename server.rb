if `which git`.empty?
  STDERR.puts 'Tree can\'t run without git!'
  exit(-1)
end

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
  REPO = ROOT.join 'repos'

  use Rack::TryStatic,
                root: File.expand_path(File.dirname(__FILE__) + '/public'),
                urls: %w[/], try: ['.html', 'index.html', '/index.html']

  def response(env)
    request = Rack::Request.new env
    case request.path_info
    when %r{^/+api/}
      ::API.call(env)
    else
      if request.accept_media_types.include?('text/html')
        base_url = (request.scheme ? request.scheme : 'http') + request.base_url
        path = request.query_string.empty? ? request.path_info : "#{request.path_info}?#{request.query_string}"
        url = "#{base_url}/\##{path}"
        [301, {location: url}, '']
      else
        [404, {}, '']
      end
    end
  end
end

require 'git'
require 'app_logger'
require 'renderer'
