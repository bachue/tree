require 'mina/bundler'
require 'mina/git'
require 'mina/rbenv'

set :domain, '10.135.10.121'
set :user, 'root'

set :deploy_to, '/var/www/tree'

set :repository, 'ssh://rongz@gerrit.dechocorp.com:29418/tree'

set :shared_paths, ['log', 'db/production.sqlite3', 'tmp', 'config/ldap.yml']

set :keep_releases, 1

task :environment do
  invoke :'rbenv:load'
  invoke :rbenv_switch_version
end

task :initialize => :environment do
  deploy do
    invoke :'git:clone'
    invoke :create_shared_paths
    invoke :'deploy:link_shared_paths'
    invoke :'bundle:install'
    invoke :db_migrate
    invoke :create_basic_folders
    to :launch do
      invoke :permission_control
      invoke :regenerate_ssh_auth
      invoke :start
    end
  end
end

task :deploy => :environment do
  deploy do
    invoke :'git:clone'
    invoke :'deploy:link_shared_paths'
    invoke :'bundle:install'
    invoke :db_migrate
    to :launch do
      invoke :permission_control
      invoke :regenerate_ssh_auth
      invoke :restart
    end
  end
end

task :rbenv_switch_version do
  queue "rbenv shell 2.1.1"
end

task :create_shared_paths do
  queue "mkdir -p '#{deploy_to}/#{shared_path}/log'"
  queue "mkdir -p '#{deploy_to}/#{shared_path}/db'"
  queue "mkdir -p '#{deploy_to}/#{shared_path}/config'"
  queue "touch '#{deploy_to}/#{shared_path}/db/production.sqlite3'"
  queue "mkdir -p '#{deploy_to}/#{shared_path}/tmp'"
end

task :create_basic_folders do
  queue 'mkdir -p /repos && chown git.git /repos'
end

task :db_migrate do
  queue 'RACK_ENV=production bundle exec rake db:migrate'
end

task :permission_control do
  queue "chmod 777 #{deploy_to}/current/db"
end

task :start do
  queue 'bundle exec god -c tree.god'
  queue 'service nginx restart'
end

task :restart do
  queue 'bundle exec god quit'
  invoke :start
end

task :regenerate_ssh_auth do
  queue "ruby '#{deploy_to}/current/scripts/generate-ssh-authenticate.rb' /opt/auth.rb"
end
