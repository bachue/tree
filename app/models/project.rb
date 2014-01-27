class Project < ActiveRecord::Base
  validates :name, :url, :branch, :path, presence: true
  validates :name, :branch, length: {maximum: 30}
  validates :url, :path, length: {maximum: 255}
  validates :name, uniqueness: true

  def tree
    root = []
    files.each do |path|
      insert_into root, path.split('/')
    end
    root
  end

  def render file
    file = path + '/' + file
    if File.file?(file) && renderer = Renderers.choose_for(file)
      renderer.render File.read(file)
    elsif File.directory?(file)
      ''
    else
      false
    end
  end

  private
    def files
      Dir[path + "/**/*.{#{Renderers.available_ext.join(',')}}"].select {|f| File.file? f }.map {|f| f[(path.size + 1)..-1]}
    end

    def insert_into root, names
      if names.size == 1
        root << {label: names.first}
      else
        unless target = root.find {|item| item[:label] == names.first }
          target = {label: names.first, children: []}
          root << target
        end
        insert_into target[:children], names[1..-1]
      end
    end
end