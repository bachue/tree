require 'pathname'

class Project < ActiveRecord::Base
  validates :name, :url, :branch, :path, presence: true
  validates :name, :branch, length: {maximum: 30}
  validates :url, :path, length: {maximum: 255}
  validates :name, uniqueness: true

  def tree
    root = []
    paths = Dir[path + "/**/*.{#{Renderer.available.map(&:ext).flatten.join(',')}}"]
    paths.each do |path|
      insert_into root, Pathname(path).each_filename.to_a
    end
    root
  end

  private
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