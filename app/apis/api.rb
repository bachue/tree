require 'project'
require 'project_entity'

require 'validators/git_repo_url'

class API < Grape::API
  version 'api', using: :path
  format :json
  
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
    end
    get '/:id' do
      project = Project.find_by id: params[:id]
      error! 'Project not found', 404 unless project

      project.tree
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
        true
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
    end
    get '/:id/*path', anchor: false do
      project = Project.find_by id: params[:id]
      error! 'Project not found', 404 unless project

      result = project.render params[:path]
      if !result 
        error! 'Document not found', 404
      elsif result.empty?
        {empty: true}
      else
        {doc: result}
      end
    end
  end
end