require 'project'
require 'project_entity'

require 'validators/git_repo_url'

class API < Grape::API
  version 'api', using: :path
  format :json

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
      project = Project.find_by id: params[:id]
      error! 'Project not found', 404 unless project

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

      project = Project.find_by id: params[:id]
      error! 'Project not found', 404 unless project

      project.lock_as_reader do
        project.grep params[:q], params[:tag_name]
      end
    end

    desc 'Create a project'
    params do
      requires :name, type: String, desc: 'Project name', regexp: /^[\w\-]+$/
      requires :url, type: String, desc: 'Git repo URL', git_repo_url: true
      optional :branch, type: String, desc: 'Branch name', default: 'master'
    end
    post do
      project = Project.new name: params[:name], url: params[:url], branch: params[:branch]
      project.path = Application::REPO.join(params[:name]).to_s # We don't have validate path here because name is limited

      error! 'ArgumentError', 400 unless project.valid?
      begin
        Project.transaction do
          project.save!
          project.lock_as_writer do
            Git.clone project.url, project.path, project.branch
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
      project = Project.find_by name: params[:name]
      error! 'Project not found', 404 unless project

      return false if params[:branch] != project.branch

      if project.updated?
        project.lock_as_writer do
          project.pull
        end
      end
      true
    end

    desc 'Get a rendered document from the project'
    params do
      requires :id, type: Integer, desc: 'Project id'
      requires :tag_name, type: String, desc: 'Tag name'
    end
    get '/:id/:tag_name/*path', anchor: false do
      project = Project.find_by id: params[:id]
      error! 'Project not found', 404 unless project

      result, renderer =  project.lock_as_reader do
                            project.render params[:path], params[:tag_name]
                          end 
      if !result 
        error! 'Document not found', 404
      elsif renderer == false
        {empty: true}
      elsif renderer # Have rendered?
        {doc: result}
      elsif # Static file, must be an attachment
        content_type "application/x-download"
        env['api.format'] = :binary
        body result
      end
    end

    desc 'Create a tag in the project'
    params do
      requires :id, type: Integer, desc: 'Project id'
      requires :tag_name, type: String, desc: 'Tag name'
    end
    put '/:id/:tag_name' do
      project = Project.find_by id: params[:id]
      error! 'Project not found', 404 unless project

      project.lock_as_writer do
        project.add_tag params[:tag_name]
      end
      present project, with: ProjectEntity
    end
  end
end