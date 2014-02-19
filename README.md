# Tree

## Deployment instruments
1. Install git
2. Disable StrictHostKeyChecking in ssh_config
3. `bundle install --without development test`
4. `APP_ENV=production rake db:migrate`
5. `bundle exec puma -d --environment production -p 80 -t 8:32 -w 3 --preload`