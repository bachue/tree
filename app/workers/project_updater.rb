require 'sidekiq'
require 'sidekiq-unique-jobs'

$: << File.expand_path(File.dirname(__FILE__) + '/../models')
$: << File.expand_path(File.dirname(__FILE__) + '/../../')
$: << File.expand_path(File.dirname(__FILE__) + '/../../lib')

require 'config/application'
require 'project'
require 'git'

class ProjectUpdater
  include Sidekiq::Worker
  sidekiq_options unique: true, retry: false

  def perform project_id
    project = Project.find_by id: project_id

    if project && project.updated?
      project.lock_as_writer do
        project.pull
      end
    end
  end
end