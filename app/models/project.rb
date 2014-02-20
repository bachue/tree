require 'fileutils'

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
        [renderer.render(cat_file(file, tag)), renderer]
      elsif all_files(tag).include?(file)
        [cat_file(file, tag), nil]
      elsif cat_file(file, tag)
        ['', false]
      end
    rescue
      [false, false]
    end
  end

  def pull
    Git.pull path, branch
  end

  def tags
    Git.tag path
  end

  def add_tag tag_name
    Git.tag path, :add, tag_name, "Add tag #{tag_name.inspect}"
  end

  def grep text, tag_name
    result = Git.grep(path, text, tag_name)
    result[:filenames].select! {|path| Renderers.available_ext.detect {|ext| path.end_with?(ext) }}
    result[ :content ].select! {|path| Renderers.available_ext.detect {|ext| path.end_with?(ext) }}
    result
  end

  def lock_as_reader &block
    lock File::LOCK_SH, &block
  end

  def lock_as_writer &block
    lock File::LOCK_EX, &block
  end

  private
    def cat_file file, tag
      Git.cat_file path, file, tag
    end

    def all_files tag
      Git.ls_tree(path, tag)
    end

    def files tag
      all_files(tag).select {|path| Renderers.available_ext.detect {|ext| path.end_with?(ext) }}
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

    def lock type, timeout: 10.minutes
      FileUtils.mkdir path unless File.directory?(path)
      File.open(path) do |f|
        f.flock type
        Timeout::timeout(timeout) do
          yield
        end
      end
    end
end