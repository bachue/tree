require 'active_record'
require 'yaml'
require 'erb'
require 'pathname'

class Application
  ROOT = Pathname File.expand_path(File.dirname(__FILE__) + '/../') unless defined?(ROOT)
  RACK_ENV = ENV['RACK_ENV'] || 'development' unless defined?(RACK_ENV)
  REPO = ROOT.join 'repos'
  REPO_SVR = if RACK_ENV == 'production' then Pathname('/home/git')
             else                             ROOT.join('tmp')
             end


  require 'pry' if RACK_ENV != 'production'

  ActiveRecord::Base.configurations = YAML.load ERB.new(File.read('config/database.yml')).result

  DBCONFIG = ActiveRecord::Base.configurations[Application::RACK_ENV]

  ActiveRecord::Base.establish_connection(DBCONFIG)

  class << self
    attr_reader :consts
    private def load_constants
      @consts = YAML.load ERB.new(File.read(File.dirname(__FILE__) + '/constants.yml')).result
      overrided_consts = {
        'production'  =>  @consts.delete('production'), 
        'development' =>  @consts.delete('development'), 
        'test'        =>  @consts.delete('test')
      }
      @consts.merge! overrided_consts[RACK_ENV] || {}
    end
  end

  load_constants
end