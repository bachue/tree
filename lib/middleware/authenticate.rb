require 'rack/utils'
require 'rack/auth/basic'
require 'app/models/user'
require 'redis'
require 'yaml'
require 'erb'
require 'digest/sha2'

module Middleware
  class Authenticate < Rack::Auth::Basic
    def initialize app
      @app = app
      super app, 'Application' do |username, password|
        next false if username.blank? || password.blank?
        key = "session:#{username}:#{Digest::SHA512.hexdigest(username + password)}"
        user_id = redis.get key

        if user_id && user = User.find_by(id: user_id)
          login user
        elsif defined? Application::LDAP_CONFIG
          require 'ldap'

          user = nil

          LDAP.new.authenticate(username, password) do |entry|
            user = User.find_by(name: username) || User.create!(name: username, email: entry.mail.first)
          end

          login user, set_cache: key if user
        else
          user = User.find_by(name: username, email: password)
          login user, set_cache: key if user
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

    private
      def redis
        @redis ||= begin
          Redis.new Application::REDIS_CONFIG
        end
      end

      def login user, set_cache: false
        @name, @email = user.name, user.email
        Application.current_user = user
        if set_cache
          redis.set set_cache, user.id
          redis.expire set_cache, Application::REDIS_SESSION_EXPIRES
        end
        true
      end

      def auth username, password
        Net::LDAP.new({:host => Application::LDAP_CONFIG['host'], :port => Application::LDAP_CONFIG['port'], :auth => {:method => :simple, :username => username, :password => password}})
      end
  end
end
