require 'rubygems'
require 'fileutils'
require 'bundler/setup'
require 'yaml'
require 'erb'

$: << File.expand_path(File.dirname(__FILE__))
require 'config/application'

desc 'runs a console to operate your environment'
task :console do
  require 'pry'
  require 'grape'
  require 'grape-entity'
  
  Dir['app/models/**/*.rb', 'app/entities/**/*.rb', 'app/workers/**/*.rb', 'lib/**/*.rb'].each {|f| require f }

  pry
end

desc 'runs a console to operate your database'
task :db do
  exec "sqlite3 -line #{Application::DBCONFIG['database']}"
end

namespace :db do
  desc 'creates and migrates your database'
  task :setup do
    Rake::Task['db:create'].invoke
    Rake::Task['db:migrate'].invoke
  end
  
  desc 'migrate your database'
  task :migrate do
    ActiveRecord::Migrator.migrate(
      ActiveRecord::Migrator.migrations_paths, 
      ENV['VERSION'] ? ENV['VERSION'].to_i : nil
    )
  end
  
  desc 'Drops the database'
  task :drop do
    FileUtils.rm Application::DBCONFIG['database']
  end
  
  desc 'Creates the database'
  task :create do
    FileUtils.touch Application::DBCONFIG['database']
  end
end

desc 'clean all environment, this command cannot run in production mode'
task :clean do
  fail 'This command cannot run in production mode.' if Application::RACK_ENV == 'production'
  Rake::Task['db:drop'].invoke
  Rake::Task['db:setup'].invoke
  FileUtils.rm_rf Dir['repos/*']
end

desc 'delete one project from both database and repo'
task :delete, :name do |t, args|
  $: << File.expand_path(File.dirname(__FILE__))
  Dir['app/models/**/*.rb'].each {|f| require f }

  project = Project.find_by name: args[:name]
  fail "Project \"#{args[:name]}\" cannot found" unless project
  project.destroy
  FileUtils.rm_rf project.path
  puts "Project \"#{args[:name]}\" has gone"
end
