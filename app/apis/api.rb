require 'project'
require 'project_entity'

class API < Grape::API
  version 'api', using: :path
  format :json
  
  desc 'Only for test, to make sure server works'
  get '/ping' do
    'pong'
  end

  resource :projects do
    get do
      present Project.all, with: ProjectEntity
    end
  end
end