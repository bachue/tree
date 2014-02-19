require 'active_record'
require 'yaml'
require 'erb'

class Application
  ROOT = Pathname File.expand_path(File.dirname(__FILE__) + '/../') unless defined?(ROOT)
  RACK_ENV = ENV['RACK_ENV'] || 'development' unless defined?(RACK_ENV)
  REPO = ROOT.join 'repos'

  require 'pry' if RACK_ENV != 'production'

  ActiveRecord::Base.configurations = YAML.load ERB.new(File.read('config/database.yml')).result

  DBCONFIG = ActiveRecord::Base.configurations[Application::RACK_ENV]

  ActiveRecord::Base.establish_connection(DBCONFIG)
end
