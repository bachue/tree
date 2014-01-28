require 'github/markdown'
require 'nokogiri'
require 'redcloth'

class Renderers
  class << self
    def register renderer
      @renderers ||= []
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
    GitHub::Markdown.render_gfm content
  end
end

class HTMLRender
  def self.ext
    %w[html htm]
  end

  def self.render content
    html = Nokogiri::HTML content
    if body = html.css('body')
      body[0].inner_html
    else
      content
    end
  end
end

class TextileRenderer
  def self.ext
    'textile'
  end

  def self.render content
    RedCloth.new(content).to_html
  end
end

Renderers.register MarkDownRenderer
Renderers.register HTMLRender
Renderers.register TextileRenderer