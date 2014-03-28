require 'active_record'
require 'yaml'
require 'erb'
require 'pathname'

class Application
  class << self
    attr_reader :consts

    def current_user
      Thread.current['current_user']
    end

    def current_user= user
      Thread.current['current_user'] = user
    end

    private
      def load_constants
        @consts = load_config 'constants.yml'
        overrided_consts = {
          'production'  =>  @consts.delete('production'),
          'development' =>  @consts.delete('development'),
          'test'        =>  @consts.delete('test')
        }
        @consts.merge! overrided_consts[RACK_ENV] || {}
      end

      def load_config path
        YAML.load ERB.new(File.read(ROOT.join('config', *path))).result
      end
  end

  ROOT = Pathname File.expand_path(File.dirname(__FILE__) + '/../') unless defined?(ROOT)
  RACK_ENV = ENV['RACK_ENV'] || 'development' unless defined?(RACK_ENV)
  REPO = ROOT.join 'repos'
  REPO_SVR = if RACK_ENV == 'production' then Pathname('/home/git')
             else                             ROOT.join('tmp')
             end

  REDIS_CONFIG = load_config 'redis.yml'

  require 'pry' if RACK_ENV != 'production'

  ActiveRecord::Base.configurations = load_config 'database.yml'

  DBCONFIG = ActiveRecord::Base.configurations[Application::RACK_ENV]

  ActiveRecord::Base.establish_connection(DBCONFIG)

  load_constants

  I18n.enforce_available_locales = false
end
