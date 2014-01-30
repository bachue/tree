class ProjectEntity < Grape::Entity
  expose :id, :name, :url, :branch
  expose(:tags) {|model| model.tags || [] }
end