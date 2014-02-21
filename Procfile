development: bundle exec unicorn -p 8000
redis: redis-server
sidekiq: bundle exec sidekiq -r ./app/workers/project_updater.rb -C config/sidekiq.yml
