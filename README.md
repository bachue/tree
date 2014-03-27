# Tree

## Deployment instruments
1. Install git and config it.
2. Install Redis.
3. Install nginx and config (Feel free to use config/nginx.conf.example).
4. Disable StrictHostKeyChecking in ssh\_config.
5. `bundle install --without development:test`.
6. `RACK_ENV=production bundle exec rake db:migrate`.
7. `bundle exec god -c tree.god`.
8. \* If you can setup a hook in git repository,
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
              curl -X PATCH "http://localhost/api/projects/$project/$branch" >/tmp/log 2>&1
          done
          ```
      3. `chmod +x $git_repo_path/hooks/post-receive`

## Server API

- GET     /api/ping
  * only for test
- GET     /api/projects
  * Return all projects info
- GET     /api/projects/:id/tags/:tag_name
  * Get project directory tree
- GET     /api/projects/:id/tags/:tag_name/search
  * Search in project
- POST    /api/projects
  * Create a project
- PATCH   /api/projects/:name/:branch
  * Tell tree which project has updated
- GET     /api/projects/:id/diff/:tag1/:tag2
  * Get diff information between tags or HEAD in the project
- POST    /api/projects/:id/diff
  * Get diff information
- GET     /api/projects/:id/tags/:tag_name/logs/*path
  * Get all logs of the specified document
- GET     /api/projects/:id/tags/:tag_name/suggest(/*path)
  * Get a suggested document from the project
- GET     /api/projects/:id/tags/:tag_name/raw/*path
  * Get a raw document from the project
- GET     /api/projects/:id/tags/:tag_name/render/*path
  * Get a rendered document from the project
- PUT     /api/projects/:id/raw/*path
  * Push a document change for a project
- DELETE  /api/projects/:id/raw/*path
  * Delete a document from a project
- PUT     /api/projects/:id/tags/:tag_name
  * Create a tag in the project
