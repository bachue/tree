class Renderer
  def self.register renderer
    @renderers ||= []
    @renderers << renderer
  end

  def self.available
    @renderers ||= []
  end
end

class MarkDownRenderer
  def self.ext
    'md'
  end
end

Renderer.register MarkDownRenderer

class HTMLRender
  def self.ext
    ['html', 'htm']
  end
end

Renderer.register HTMLRender