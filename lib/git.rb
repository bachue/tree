require 'open3'
require 'uri'
require 'fileutils'
require 'escape'

class Git
  class CommandError < RuntimeError; end

  class Utils
    class << self
      def execute *args
        command = Escape.shell_command(args)
        begin
          stdin, stdout, stderr, status = Open3.popen3 command
          stdin.close

          return true if status.value == 0

          Application.logger <<-ERROR
Shell command failed: #{command}
Status: #{status.value}
Stdout: #{stdout.gets(nil)}
Stderr: #{stderr.gets(nil)}
          ERROR
          raise CommandError.new command
        ensure
          [stdout, stderr].each {|io| io.close if io && !io.closed? }
        end
      end

      def valid_git_repo?(url)
        %w(ssh https http git).include? URI(url).scheme
      end
    end
  end

  class << self
    def clone source, target, branch = 'master'
      FileUtils.rm_rf target
      Utils.execute 'git', 'clone', '--quiet', '--branch', branch, Escape.uri_path(source), target
    end
  end
end