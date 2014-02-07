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
require 'static'

class Application < Goliath::API
  ROOT = Pathname File.expand_path(File.dirname(__FILE__)) unless defined?(ROOT)
  APP_ENV = ENV['APP_ENV'] || 'development' unless defined?(APP_ENV)
  REPO = ROOT.join 'repos'

  require 'pry' if APP_ENV != 'production'

  use Rack::TryStatic,
                root: File.expand_path(File.dirname(__FILE__) + '/public'),
                urls: %w[/], try: ['.html', 'index.html', '/index.html']

  def response(env)
    request = Rack::Request.new env
    case request.path_info
    when %r{^/+api/}
      ::API.call env
    else
      if request.accept_media_types.include?('text/html')
        # It still could be an attachment, try to regard it as static file firstly
        static = ::Static.call env
        return static if static.first == 200

        # Not static file, it could be a directory or a markdown/markup file
        # Convert path to hashbang for angular-ui-router HTML5mode
        base_url = (request.scheme ? request.scheme : 'http') + request.base_url
        path = request.query_string.empty? ? request.path_info : "#{request.path_info}?#{request.query_string}"
        url = "#{base_url}/\##{path}"
        [301, {'Location' => url}, '']
      elsif request.accept_media_types.select {|type| type.start_with?('image/') || type.start_with?('audio/') || type.start_with?('video/') }.present?
        # Static file in repos, it can handle image, audio, video files. More types could be added here
        ::Static.call env
      else
        [404, {}, '']
      end
    end
  end
end

require 'git'
require 'app_logger'
require 'renderer'
