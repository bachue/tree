require "rubygems"
require 'fileutils'
require "bundler/setup"
require 'em-synchrony/activerecord'
require 'yaml'
require 'erb'

RAILS_ENV = ENV['RAILS_ENV'] || 'development'

desc "runs a console to operate your database"
task :db do
  exec "sqlite3 -line #{db_conf[RAILS_ENV]['database']}"
end

namespace :db do
  desc "loads database configuration in for other tasks to run"
  task :load_config do
    ActiveRecord::Base.configurations = db_conf
    
    # drop and create need to be performed with a connection to the 'postgres' (system) database
    ActiveRecord::Base.establish_connection db_conf[RAILS_ENV]
  end
  
  desc "creates and migrates your database"
  task :setup => :load_config do
    Rake::Task["db:create"].invoke
    Rake::Task["db:migrate"].invoke
  end
  
  desc "migrate your database"
  task :migrate do
    ActiveRecord::Base.establish_connection db_conf[RAILS_ENV]

    ActiveRecord::Migrator.migrate(
      ActiveRecord::Migrator.migrations_paths, 
      ENV["VERSION"] ? ENV["VERSION"].to_i : nil
    )
  end
  
  desc 'Drops the database'
  task :drop => :load_config do
    FileUtils.rm db_conf[RAILS_ENV]['database']
  end
  
  desc 'Creates the database'
  task :create => :load_config do
    FileUtils.touch db_conf[RAILS_ENV]['database']
  end
  
end

def db_conf
  config = YAML.load(ERB.new(File.read('config/database.yml')).result)
end
