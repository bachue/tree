require 'project'
require 'project_entity'

require 'validators/git_repo_url'

class API < Grape::API
  version 'api', using: :path
  format :json

  rescue_from :all
  error_formatter :json, ->(message, backtrace, options, env) { {error: 'error'}.to_json }
  
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

      project.tree params[:tag_name]
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
          Git.clone project.url, project.path, project.branch
        end
        present project, with: ProjectEntity
      rescue
        error! 'Failed to fetch project data', 400
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

      project.pull
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

      result, renderer = project.render params[:path], params[:tag_name]
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

      project.add_tag params[:tag_name]
      present project, with: ProjectEntity
    end
  end
end