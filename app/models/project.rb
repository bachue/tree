class Project < ActiveRecord::Base
  validates :name, :url, :branch, :path, presence: true
  validates :name, :branch, length: {maximum: 30}
  validates :url, :path, length: {maximum: 255}
  validates :name, uniqueness: true

  def tree tag
    root = []
    files(tag).each do |path|
      insert_into root, path.split('/')
    end
    root
  end

  def render file, tag
    begin
      if files(tag).include?(file) && renderer = Renderers.choose_for(file)
        renderer.render cat_file(file, tag)
      elsif cat_file(file, tag)
        ''
      end
    rescue
      false
    end
  end

  def pull
    Git.pull path, branch
  end

  def tag
    Git.tag path
  end

  def add_tag tag_name
    Git.tag path, :add, tag_name, "Add tag #{tag_name.inspect}"
  end

  private
    def cat_file file, tag
      Git.cat_file path, file, tag
    end

    def files tag
      Git.ls_tree path, tag
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