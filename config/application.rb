require 'active_record'
require 'active_support/all'
require 'yaml'
require 'erb'
require 'pathname'
require 'fileutils'
require 'rugged'

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

      def config_exist? path
        ROOT.join('config', *path).exist?
      end

      def setup_rugged
        if RACK_ENV.production?
          Rugged::Settings['search_path_global'] = '/home/git'
          Rugged::Settings['search_path_xdg'] = '/home/git/.config/git'
        end
      end
  end

  ROOT = Pathname File.expand_path(File.dirname(__FILE__) + '/../')
  RACK_ENV = ActiveSupport::StringInquirer.new(ENV['RACK_ENV'] || 'development')
  REPO = if RACK_ENV.production? then FileUtils.mkdir_p('/repos') && Pathname('/repos')
         else                         ROOT.join 'repos'
         end
  REPO_SVR = if RACK_ENV.production? then Pathname '/home/git'
             else                         ROOT.join 'tmp'
             end

  REDIS_CONFIG = load_config 'redis.yml'
  REDIS_SESSION_EXPIRES = 1.hour


  LDAP_CONFIG = load_config 'ldap.yml' if config_exist?('ldap.yml')

  require 'pry' unless RACK_ENV.production?

  ActiveRecord::Base.configurations = load_config 'database.yml'

  DBCONFIG = ActiveRecord::Base.configurations[Application::RACK_ENV]

  ActiveRecord::Base.establish_connection(DBCONFIG)

  load_constants
  setup_rugged

  I18n.enforce_available_locales = false
end
