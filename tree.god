ROOT = File.expand_path(File.dirname(__FILE__))

God.watch do |w|
  w.name = 'tree'
  w.dir = ROOT
  w.start = 'bundle exec unicorn -E production -D -c config/unicorn.rb -r ./config/application'
  w.keepalive
  w.log = File.join ROOT, 'log', 'god.log'
  w.pid_file = File.join ROOT, 'tmp', 'unicorn.pid'
end

God.watch do |w|
  w.name = 'sidekiq_for_tree'
  w.dir = ROOT
  w.start = 'bundle exec sidekiq -r ./app/workers/project_updater.rb -C config/sidekiq.yml -e production -d'
  w.keepalive
  w.log = File.join ROOT, 'log', 'god.log'
  w.pid_file = File.join ROOT, 'tmp', 'sidekiq.pid'
end