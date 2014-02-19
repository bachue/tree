ROOT = File.expand_path(File.dirname(__FILE__))

God.watch do |w|
  w.name = 'tree'
  w.dir = ROOT
  w.start = 'bundle exec puma -d --environment production -p 80 -t 8:32 -w 3 --preload --pidfile tmp/puma.pid -S tmp/puma.state'
  w.keepalive
  w.log = File.join ROOT, 'log', 'god.log'
  w.pid_file = File.join ROOT, 'tmp', 'puma.pid'
end

God.watch do |w|
  w.name = 'sidekiq_for_tree'
  w.dir = ROOT
  w.start = 'bundle exec sidekiq -r ./app/workers/project_updater.rb -C config/sidekiq.yml -e production -d'
  w.keepalive
  w.log = File.join ROOT, 'log', 'god.log'
  w.pid_file = File.join ROOT, 'tmp', 'sidekiq.pid'
end