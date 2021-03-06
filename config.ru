if `which git`.empty?
  STDERR.puts 'Tree can\'t run without git!'
  exit(-1)
end

$: << File.expand_path(File.dirname(__FILE__))
$: << File.expand_path(File.dirname(__FILE__) + '/app/apis')
$: << File.expand_path(File.dirname(__FILE__) + '/app/models')
$: << File.expand_path(File.dirname(__FILE__) + '/app/entities')
$: << File.expand_path(File.dirname(__FILE__) + '/app/workers')
$: << File.expand_path(File.dirname(__FILE__) + '/lib')

require "rubygems"
require "bundler/setup"
require 'rack/accept_media_types'
require 'rack/contrib/try_static'
require 'pathname'
require 'grape'
require 'grape-entity'

require 'config/application'

require 'middleware/authenticate'

class Application
  def self.call(env)
    request = Rack::Request.new env
    case request.path_info
    when %r{^/+js/+_constants\.js$}
      [200, {'Content-Type' => 'application/javascript'}, ['CONSTANTS = ' + Application.consts.to_json]]
    when %r{^/+api/}
      ::API.call env
    else
      if request.accept_media_types.include?('text/html')
        # It still could be an attachment, try to regard it as static file firstly
        static = ::Static.call env
        return static if static.first == 200

        # Not static file, it could be a directory or a markdown/markup file
        # Convert path to hashbang for angular-ui-router HTML5mode
        path = request.query_string.empty? ? request.path_info : "#{request.path_info}?#{request.query_string}"
        url = "#{request.base_url}/\##{path}"
        [301, {'Location' => url}, []]
      elsif request.accept_media_types.select {|type| type.start_with?('image/') || type.start_with?('audio/') || type.start_with?('video/') }.present?
        # Static file in repos, it can handle image, audio, video files. More types could be added here
        ::Static.call env
      else
        [404, {}, []]
      end
    end
  end
end

require 'api'
require 'static'

require 'git'
require 'app_logger'
require 'renderers'

use ActiveRecord::ConnectionAdapters::ConnectionManagement
use Rack::TryStatic,
              root: File.expand_path(File.dirname(__FILE__) + '/public'),
              urls: %w[/], try: ['.html', 'index.html', '/index.html']
use Middleware::Authenticate

run Application
