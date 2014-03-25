require 'project'
require 'project_entity'

require 'helpers/api_helper'
require 'validators/git_repo_url'

class API < Grape::API
  version 'api', using: :path
  format :json
  default_format :json

  helpers APIHelper

  rescue_from :all
  error_formatter :json, ->(message, backtrace, options, env) do
    logger.error message
    logger.error backtrace.join("\n")
    {error: 'error'}.to_json
  end

  desc 'Only for test, to make sure server works'
  get '/ping' do
    'pong'
  end

  resource :projects do
    desc 'Return all projects info'
    get do
      present Project.all, with: ProjectEntity
    end

    desc 'Get project directory tree'
    params do
      requires :id, type: Integer, desc: 'Project id'
      requires :tag_name, type: String, desc: 'Tag name'
    end
    get '/:id/:tag_name' do
      project = load_project id: params[:id]

      update_project project

      project.lock_as_reader do
        project.tree params[:tag_name]
      end
    end

    desc 'Search in project'
    params do
      requires :id, type: Integer, desc: 'Project id'
      requires :tag_name, type: String, desc: 'Tag name'
      optional :q, type: String, desc: 'Query text'
    end
    get '/:id/:tag_name/_search' do
      error! 'No query text', 400 unless params[:q]

      project = load_project id: params[:id]

      project.lock_as_reader do
        project.grep params[:q], params[:tag_name]
      end
    end

    desc 'Create a project'
    params do
      requires :name, type: String, desc: 'Project name', regexp: /^[\w\s\-]+$/
      requires :url, type: String, desc: 'Git repo URL', git_repo_url: true
      optional :branch, type: String, desc: 'Branch name', default: 'master'
    end
    post do
      project = Project.new name: params[:name], url: params[:url], branch: params[:branch]
      project.path = Application::REPO.join(params[:name]).to_s # We don't have validate path here because name is limited

      is_server_provided_repo = project.url.start_with? Application.consts['NEW_REPO_PREFIX']
      if is_server_provided_repo
        server_provided_repo_name = project.url.sub(%r{^#{Application.consts['NEW_REPO_PREFIX']}/*}, '')
        server_provided_repo_path = Application::REPO_SVR.join(server_provided_repo_name).to_s
        error! 'Invalid path', 400 unless server_provided_repo_path.start_with? "#{Application::REPO_SVR}/"
        FileUtils.mkdir_p server_provided_repo_path
      end

      error! 'ArgumentError', 400 unless project.valid?
      begin
        Project.transaction do
          project.save!
          project.lock_as_writer do
            if is_server_provided_repo
              Git.new_repo server_provided_repo_path
              Git.clone "file://#{server_provided_repo_path}", project.path, nil
              Git.initial_commit project.path, project.branch
              Git.add_hook_for_server_check server_provided_repo_path, project.name, project.branch,
                log: Application::ROOT.join('log', 'git.log'), host: Rack::Request.new(env).base_url
            else
              Git.clone project.url, project.path, project.branch
            end
          end
        end
        present project, with: ProjectEntity
      rescue
        error! 'Failed to fetch project data: ' + $!.message, 400
      end
    end

    desc 'Tell tree which project has update'
    params do
      requires :name, type: String, desc: 'Project name'
      requires :branch, type: String, desc: 'Branch name'
    end
    patch '/:name/:branch' do
      project = load_project name: params[:name]

      return false if params[:branch] != project.branch

      if project.updated?
        project.lock_as_writer do
          project.pull
        end
      end
      true
    end

    desc 'Get Diff information between tags or HEAD in the project'
    params do
      requires :id, type: Integer, desc: 'Project id'
      requires :tag1, type: String, desc: 'Tag 1 name'
      requires :tag2, type: String, desc: 'Tag 2 name'
    end
    get '/diff/:id/:tag1/:tag2' do
      project = load_project id: params[:id]
      project.lock_as_reader do
        project.diff_between params['tag1'], params['tag2']
      end
    end

    desc 'Get Diff information between the specified commit and your changes'
    params do
      requires :id, type: Integer, desc: 'Project id'
      requires :path, type: String, desc: 'File path'
      requires :content, type: String, desc: 'File content'
      requires :base, type: String, desc: 'Commit based on'
    end
    post '/diff/:id', anchor: false do
      project = load_project id: params[:id]

      project.lock_as_reader do
        project.diff_between params[:path], params[:content], params[:base]
      end
    end

    desc 'Get all logs of a document from the project'
    params do
      requires :id, type: Integer, desc: 'Project id'
      requires :path, type: String, desc: 'File path'
      requires :tag_name, type: String, desc: 'Tag name'
    end
    get '/logs/:id/:tag_name/*path', anchor: false do
      project = load_project id: params[:id]

      project.lock_as_reader do
        project.logs params[:path], params[:tag_name]
      end
    end

    desc 'Get a suggested document from the project'
    params do
      requires :id, type: Integer, desc: 'Project id'
      requires :tag_name, type: String, desc: 'Tag name'
      optional :path, type: String, desc: 'Directory path', default: ''
    end
    get '/suggest/:id/:tag_name(/*path)', anchor: false do
      project = load_project id: params[:id]

      suggest = project.lock_as_reader do
                  project.suggest params[:path], params[:tag_name]
                end
      {suggest: suggest || ''}
    end

    desc 'Get a raw document from the project'
    params do
      requires :id, type: Integer, desc: 'Project id'
      requires :path, type: String, desc: 'File path'
    end
    get '/raw/:id/*path', anchor: false do
      project = load_project id: params[:id]

      update_project project

      result, renderer, blob_id, last_commit =  project.lock_as_reader do
                                                  project.raw params[:path], 'HEAD'
                                                end
      case result
      when false
        status 404
        if renderer then {empty: true, type: renderer.name}
        else             {not_found: true}
        end
      when :tree
        error! 'Path is a directory, not supported', 400
      else
        if renderer && blob_id
          {raw: result, type: renderer.name, blob: blob_id, commit: last_commit}
        else # result == nil means file exists but can't be rendered
          content_type "application/x-download"
          env['api.format'] = :binary
          body result
        end
      end
    end

    desc 'Get a rendered document from the project'
    params do
      requires :id, type: Integer, desc: 'Project id'
      requires :tag_name, type: String, desc: 'Tag name'
      requires :path, type: String, desc: 'File path'
    end
    get '/:id/:tag_name/*path', anchor: false do
      project = load_project id: params[:id]

      update_project project

      result, renderer =  project.lock_as_reader do
                            project.render params[:path], params[:tag_name]
                          end
      case result
      when false
        status 404
        if renderer then {empty: true, type: renderer.name}
        else             {not_found: true}
        end
      when :tree
        {tree: true}
      else
        if renderer # Have rendered?
          {doc: result}
        elsif # Static file, must be an attachment
          content_type "application/x-download"
          env['api.format'] = :binary
          body result
        end
      end
    end

    desc 'Push a document change for a project'
    params do
      requires :id, type: Integer, desc: 'Project id'
      requires :path, type: String, desc: 'File path'
      requires :content, type: String, desc: 'File content'
      requires :message, type: String, desc: 'Commit message'
      optional :description, type: String, desc: 'Commit description'
      requires :base, type: String, desc: 'Commit based on'
    end
    put '/raw/:id/*path', anchor: false do
      project = load_project id: params[:id]

      begin
        project.lock_as_writer do
          project.add_to_index params[:path], params[:content], params[:base],
                             "#{params[:message]}\r\n\r\n#{params[:description]}"
        end
      rescue Git::CommitError => e
        status 400
        return {error: 'error', message: e.message}
      end
      true
    end

    desc 'Delete a document from a project'
    params do
      requires :id, type: Integer, desc: 'Project id'
      requires :path, type: String, desc: 'File path'
      requires :message, type: String, desc: 'Commit message'
      optional :description, type: String, desc: 'Commit description'
    end
    delete '/raw/:id/*path', anchor: false do
      project = load_project id: params[:id]

      project.lock_as_writer do
        project.remove_from_index params[:path], "#{params[:message]}\r\n\r\n#{params[:description]}"
      end
      true
    end

    desc 'Create a tag in the project'
    params do
      requires :id, type: Integer, desc: 'Project id'
      requires :tag_name, type: String, desc: 'Tag name'
    end
    put '/:id/:tag_name' do
      project = load_project id: params[:id]

      project.lock_as_writer do
        project.add_tag params[:tag_name]
      end
      present project, with: ProjectEntity
    end
  end
end
