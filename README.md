# Tree

## Deployment instruments
1. Install git
2. Disable StrictHostKeyChecking in ssh_config
3. `bundle install --without development test`
4. `RACK_ENV=production rake db:migrate`
5.
  - If you can setup a hook in git repository
    - Config it to do a `PATCH` call: `/api/projects/$name/$branch`
  - Else
    -   Install Redis Server
    -  `bundle exec sidekiq -r ./app/workers/project_updater.rb -C config/sidekiq.yml -e production -d`
6. `bundle exec puma -d --environment production -p 80 -t 8:32 -w 3 --preload`
