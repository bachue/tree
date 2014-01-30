require 'open3'
require 'uri'
require 'fileutils'
require 'escape'

class Git
  class CommandError < RuntimeError; end

  class Utils
    class << self
      def execute *multi_args
        commands = multi_args.map {|args| Escape.shell_command args }
        begin
          command = commands.join ' && '
          stdin, stdout, stderr, status = Open3.popen3 command
          stdin.close
          output = stdout.gets(nil)

          return output if status.value == 0

          Application.logger.error <<-ERROR
Shell command failed: #{command}
Status: #{status.value}
Stdout: #{output}
Stderr: #{stderr.gets(nil)}
          ERROR
          raise CommandError.new command
        ensure
          [stdout, stderr].each {|io| io.close if io && !io.closed? }
        end
      end

      def valid_git_repo?(url)
        %w(ssh https http).include? URI(url).scheme
      end
    end
  end

  class << self
    def clone source, target, branch = 'master'
      FileUtils.rm_rf target
      Utils.execute ['git', 'clone', '--quiet', '--branch', branch, Escape.uri_path(source), target]
    end

    def pull target, branch = 'master'
      Utils.execute ['cd', target], ['git', 'pull', '--quiet', 'origin', branch]
    end

    def ls_tree target, tag = 'HEAD'
      Utils.execute(['cd', target], ['git', 'ls-tree', '-r', '--name-only', tag]).try(:split, "\n")
    end

    def cat_file target, file_path, tag = 'HEAD'
      Utils.execute ['cd', target], ['git', 'show', "#{tag}:#{file_path}"]
    end

    def tag target, *args
      if args.empty? # Git.tag <target>
        Utils.execute(['cd', target], ['git', 'tag']).try(:split, "\n")
      elsif args.first == :add # Git.tag <target>, :add, tag_name, tag_message
        Utils.execute ['cd', target], ['git', 'tag', '-am', args[2], args[1]], ['git', 'push', '-q', '--tags']
      end
    end
  end
end