# Tree

## Deployment instruments
1. Install git
2. Disable StrictHostKeyChecking in ssh_config
3. `bundle install --without development:test`
4. `RACK_ENV=production bundle exec rake db:migrate`
5. `bundle exec god -c tree.god`
6. \* If you can setup a hook in git repository,
    Config it to do a `PATCH` call: `/api/projects/$name/$branch`,
    but this way is limited