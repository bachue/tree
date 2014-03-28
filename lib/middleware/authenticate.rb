require 'rack/utils'
require 'rack/auth/basic'
require 'app/models/user'
require 'redis'
require 'yaml'
require 'erb'
require 'digest'

module Middleware
  class Authenticate < Rack::Auth::Basic
    def initialize app
      @app = app
      super app, 'Application' do |username, password|
        key = "session:#{username}:#{Digest::SHA512.hexdigest(password)}"
        user_id = redis.get key

        if user_id && user = User.find_by(id: user_id)
          @name, @email = user.name, user.email
          Application.current_user = user
          true
        elsif user = User.find_by(name: username) and user.authenticate(password)
          @name, @email = user.name, user.email
          Application.current_user = user
          redis.set key, user.id
          true
        end
      end
    end

    def call env # Override to set name / email in cookie
      status, headers, body = super

      if @name && @email
        options = { path: '/', expires: Time.now.advance(years: 1) }
        Rack::Utils.set_cookie_header! headers, 'current_user.name', value: @name, **options
        Rack::Utils.set_cookie_header! headers, 'current_user.email', value: @email, **options
      end

      [status, headers, body]
    end

    private def redis
      @redis ||= begin
        Redis.new Application::REDIS_CONFIG
      end
    end
  end
end
