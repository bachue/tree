require 'project'
require 'project_updater'

module APIHelper
  def load_project **opts
    project = Project.find_by(**opts)
    error! 'Project not found', 404 unless project
    project
  end

  def update_project project
    ProjectUpdater.perform_async project.id
  end
end
