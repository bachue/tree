require 'logger'

class Application
  if APP_ENV == 'development'
    Logger = ::Logger.new STDOUT
  elsif APP_ENV == 'test' || APP_ENV == 'production'
    Logger = ::Logger.new ROOT.join('log', APP_ENV + '.log')
  end

  def self.logger
    Logger
  end

  def logger
    self.class.logger
  end
end