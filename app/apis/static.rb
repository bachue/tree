require 'project'

class Static < Grape::API
  desc 'Get static files by path'
  get '/:project_name/:tag_name/*path' do
    project = Project.find_by name: params[:project_name]
    error! 'Project not found', 404 unless project

    data, renderer = project.render params[:path], params[:tag_name]
    if !data
      error! 'Document not found', 404
    elsif renderer.nil? # Nil renderer means static file
      env['api.format'] = :binary
      content_type Rack::Mime.mime_type(File.extname(params[:path]))
      body data
    else
      # If renderer is false, means it's a dir
      # If renderer exists, means it need to be rendered, Static doesn't handle that
      error! 'Not a static file', 403
    end
  end
end
