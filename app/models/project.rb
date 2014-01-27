require 'pathname'

class Project < ActiveRecord::Base
  validates :name, :url, :branch, :path, presence: true
  validates :name, :branch, length: {maximum: 30}
  validates :url, :path, length: {maximum: 255}
  validates :name, uniqueness: true

  def tree
    root = {}
    paths = Dir[path + "/**/*.{#{Renderer.available.map(&:ext).flatten.join(',')}}"]
    paths.each do |path|
      insert_into root, Pathname(path).each_filename.to_a
    end
    root
  end

  private
    def insert_into root, names
      if names.size == 1
        root[names.first] = nil
      else
        dir = root[names.shift] ||= {}
        insert_into dir, names
      end
    end
end