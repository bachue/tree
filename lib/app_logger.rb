require 'logger'

class Application
  if RACK_ENV == 'development'
    Logger = ::Logger.new STDOUT
  elsif RACK_ENV == 'test' || RACK_ENV == 'production'
    Logger = ::Logger.new ROOT.join('log', RACK_ENV + '.log')
  end

  def self.logger
    Logger
  end

  def logger
    self.class.logger
  end
end
