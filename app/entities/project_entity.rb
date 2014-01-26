class ProjectEntity < Grape::Entity
  expose :id, :name, :url, :branch
end