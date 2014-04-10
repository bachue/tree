require 'github/markdown'
require 'nokogiri'
require 'redcloth'
require 'lib/comments_pre_handler'

class Renderers
  class << self
    def register renderer
      @renderers ||= []
      renderer.singleton_class.prepend CommentsPreHandler
      @renderers << renderer
    end

    def available
      @renderers ||= []
    end

    def available_ext
      available.map(&:ext).flatten
    end

    def choose_for file
      available.detect {|renderer| Array(renderer.ext).any? {|ext| file.end_with? ext }}
    end
  end
end

class MarkDownRenderer
  def self.ext
    %w[md mkd mkdn mdown markdown]
  end

  def self.render content
    # Convert [[doc/README.md]] to [doc/README.md](doc/README.md)
    content.gsub!(/\[\[([^\]]+)\]\]/, '[\1](\1)')
    GitHub::Markdown.render_gfm content
  end

  def self.name
    'markdown'
  end
end

class TextileRenderer
  def self.ext
    'textile'
  end

  def self.render content
    RedCloth.new(content).to_html
  end

  def self.name
    'textile'
  end
end

Renderers.register MarkDownRenderer
Renderers.register TextileRenderer
