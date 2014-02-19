require 'active_record'
require 'yaml'
require 'erb'

db = YAML.load(ERB.new(File.read('config/database.yml')).result)[Application::RACK_ENV]
ActiveRecord::Base.establish_connection(db)