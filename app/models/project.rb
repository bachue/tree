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

  def render file, tag, raw: false
    content = cat_file file, tag
    renderer = Renderers.choose_for(file)
    if content == false then [false, renderer] # File not found
    elsif content.is_a? String
      if renderer
        # File exists & Can be rendered
        if raw
          [content, renderer, blob_id_of(file, tag), last_commit(tag)]
        else
          [renderer.render(content), renderer]
        end
      else
        # File exists but it's binary
        content
      end
    elsif content == Rugged::Tree
      :tree
    else
      raise ArgumentError.new "Project\#render can't handle: #{content.inspect} self: #{self.inspect} file: #{file.inspect} tag: #{tag.inspect}"
    end
  end

  def raw file, tag
    render file, tag, raw: true
  end

  def pull
    Git.pull path, branch
  end

  def tags
    Git.tag path
  end

  def add_tag tag_name
    Git.tag path, :add, tag_name, branch: branch
  end

  def add_to_index file, content, base, message
    Git.add_to_index path, file, content, base, message, branch
  end

  def remove_from_index file, message
    Git.remove_from_index path, file, message, branch
  end

  def grep text, tag_name
    result = Git.grep(path, text, tag_name)
    result[:filenames].select! {|path| Renderers.available_ext.detect {|ext| path.end_with?(ext) }}
    result[ :content ].select! {|path| Renderers.available_ext.detect {|ext| path.end_with?(ext) }}
    result
  end

  def updated?
    Git.updated? path, branch
  end

  def lock_as_reader &block
    lock File::LOCK_SH, &block
  end

  def lock_as_writer &block
    lock File::LOCK_EX, &block
  end

  def suggest path, tag
    files = files tag
    ['readme', 'index'].each do |basename|
      result =  files.detect do |file|
                  File.dirname(file) == (path.present? ? path : '.') &&
                  File.basename(file).sub(/\.\w+$/, '').downcase == basename.downcase
                end
      return result if result
    end
    nil
  end

  def diff_between *args
    case args.size
    when 2
      tag1, tag2 = args
      Git.diff_between_tags path, tag1, tag2, branch: branch
    when 3
      file, content, based_on = args
      Git.diff_between_changes path, file, content, based_on, branch: branch
    else
      raise ArgumentError.new 'Invalid Arguments'
    end
  end

  private
    def cat_file file, tag
      Git.cat_file path, file, branch: branch, tag: tag
    end

    def all_files tag
      Git.ls_tree(path, tag)
    end

    def files tag
      all_files(tag).select {|path| Renderers.available_ext.detect {|ext| path.end_with?(ext) }}
    end

    def blob_id_of file, tag
      Git.blob_id_of path, file, branch: branch, tag: tag
    end

    def last_commit tag
      Git.last_commit path, branch: branch, tag: tag
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
