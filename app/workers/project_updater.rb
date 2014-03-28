require 'sidekiq'
require 'sidekiq-unique-jobs'
require 'yaml'
require 'erb'

yaml = ERB.new(File.read(File.expand_path(File.dirname(__FILE__) + '/../../config/redis.yml'))).result
redis_config = YAML.load yaml

Sidekiq.configure_server do |config|
  config.redis = redis_config
end

Sidekiq.configure_client do |config|
  config.redis = redis_config
end

$: << File.expand_path(File.dirname(__FILE__) + '/../models')
$: << File.expand_path(File.dirname(__FILE__) + '/../../')
$: << File.expand_path(File.dirname(__FILE__) + '/../../lib')

require 'config/application'
require 'project'
require 'git'
require 'app_logger'

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
