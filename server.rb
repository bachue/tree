require "rubygems"
require "bundler/setup"
require 'goliath'
require 'em-synchrony/activerecord'
require 'rack/contrib/try_static'
require 'grape'
require './app/apis/posts'

class Application < Goliath::API

  def response(env)
    ::Posts.call(env)
  end

end

Application.use Rack::TryStatic,
                root: File.expand_path(File.dirname(__FILE__) + '/public'),
                urls: %w[/], try: ['.html', 'index.html', '/index.html']