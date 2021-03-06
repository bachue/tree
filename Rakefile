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
  require 'rugged'
  require 'grape'
  require 'grape-entity'
  
  Dir['app/models/**/*.rb', 'app/entities/**/*.rb', 'app/workers/**/*.rb', 'lib/**/*.rb'].each {|f| require f }

  pry
end

desc 'runs a console to operate your database'
task :db do
  exec "sqlite3 -line #{Application::DBCONFIG['database']}"
end

namespace :user do
  desc 'add user'
  task :add do
    require 'io/console'
    require 'app/models/user'

    STDOUT.print 'name: '
    name = STDIN.gets.strip

    STDOUT.print 'email: '
    email = STDIN.gets.strip

    STDOUT.print 'password: '
    password = STDIN.noecho(&:gets).strip
    puts

    user = User.new name: name, email: email, password: password, password_confirmation: password
    if user.save
      puts 'Added'
    else
      puts 'Error:'
      puts user.errors.full_messages.join("\n")
    end
  end

  desc 'delete user'
  task :del, :name do |t, args|
    require 'app/models/user'

    user = User.find_by name: args[:name]
    puts 'Not found' unless user
    puts 'Gone' if user.destroy
  end
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
  fail 'This command cannot run in production mode.' if Application::RACK_ENV.production?
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

namespace :sidekiq do
  desc 'monitor sidekiq status'
  task :monitor do
    require 'sidekiq/web'
    Sidekiq.configure_client do |config|
      config.redis = { size: 1 }.merge Application::REDIS_CONFIG
    end
    app = Sidekiq::Web
    app.set :environment, :production
    app.set :bind, '0.0.0.0'
    app.set :port, 9494
    app.run!
  end
end
