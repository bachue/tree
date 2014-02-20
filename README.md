# Tree

## Deployment instruments
1. Install git.
2. Disable StrictHostKeyChecking in ssh_config.
3. `bundle install --without development:test`.
4. `RACK_ENV=production bundle exec rake db:migrate`.
5. `bundle exec god -c tree.god`.
6. \* If you can setup a hook in git repository,
    Config it to do a `PATCH` call: `/api/projects/$name/$branch`,
    but this way is limited.
    Example:
      1. Edit `$git_repo_path/hooks/post-receive`
      2.  Insert the following script, replace the `$project` with the real project name:
          ```sh
          #!/bin/sh

          while read oldrev newrev refname
          do
              branch=$(git rev-parse --symbolic --abbrev-ref $refname)
              curl -X PATCH "http://localhost/api/projects/$project/$branch" POST >/tmp/log 2&>1
          done
          ```
      3. `chmod +x $git_repo_path/hooks/post-receive`