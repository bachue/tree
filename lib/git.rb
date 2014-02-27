require 'open3'
require 'fileutils'
require 'escape'

class Git
  class CommandError < RuntimeError; end

  class Utils
    class << self
      def execute *multi_args
        options = multi_args.extract_options!
        commands = multi_args.map {|args| Escape.shell_command args }
        begin
          command = commands.join ' && '
          stdin, stdout, stderr, status = Open3.popen3 command
          stdin.close
          output = stdout.gets(nil) || ''
          errput  = stderr.gets(nil)

          if options[:ignore_status]
            return output unless errput
          else
            return output if status.value == 0
          end

          Application.logger.error <<-ERROR
Shell command failed: #{command}
Status: #{status.value}
Stdout: #{output}
Stderr: #{errput}
          ERROR
          raise CommandError.new command
        ensure
          [stdout, stderr].each {|io| io.close if io && !io.closed? }
        end
      end

      def valid_git_repo?(url)
        url =~ /^((?:http|https|ssh):\/\/[^\/:.]+\.[^\/:]+(:\d+)?\/\w+|([^@:]+(:[^@]+)?@)?[^\/:.]+\.[^\/:]+(:\w+)?)/
      end
    end
  end

  class << self
    def clone source, target, branch = 'master'
      FileUtils.rm_rf target
      branch_params =  if branch.present? then ['--branch', branch]
                       else                    []
                       end
      Utils.execute ['git', 'clone', '--quiet', *branch_params, Escape.uri_path(source), target]
    end

    def new_repo target
      FileUtils.rm_rf target
      Utils.execute ['git', 'init', '--bare', target]
    end

    def initial_commit target, branch = 'master'
      Utils.execute ['cd', target], ['git', 'commit', '--allow-empty', '-m', 'Initial commit'],
                    ['git', 'push', '-q', 'origin', branch]
    end

    def pull target, branch = 'master'
      Utils.execute ['cd', target], ['git', 'fetch'], ['git', 'pull', '--quiet', 'origin', branch]
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

    def grep target, text, tag = 'HEAD'
      {
        filenames: grep_in_filenames(target, text, tag),
        content: grep_in_content(target, text, tag)
      }
    end

    def updated? target, branch = 'master'
      remote = Utils.execute(['cd', target], ['git', 'ls-remote', 'origin', 'HEAD']).try(:split, /\s+/)[0]
      local = Utils.execute(['cd', target], ['git', 'show-ref', "refs/remotes/origin/#{branch}"]).try(:split, /\s+/)[0]
      remote != local
    end

    # Only for server-provided repo
    def add_hook_for_server_check target, project_name, branch = 'master', log: '/tmp/log', host: 'http://localhost'
      File.open "#{target}/hooks/post-receive", 'w' do |file|
        file.write <<-HOOK
#!/bin/bash

while read oldrev newrev refname
do
    branch=$(git rev-parse --symbolic --abbrev-ref $refname)
    if [ "$branch" == "#{branch}" ]; then
      echo "curl -X PATCH '#{host}/api/projects/#{project_name}/#{branch}'" >>"#{log}"
      curl -X PATCH "#{host}/api/projects/#{project_name}/#{branch}" >>"#{log}" 2>&1
    fi
done
        HOOK
        file.chmod 0755
      end
      true
    end

    private
      def grep_in_filenames target, text, tag = 'HEAD'
        ls_tree(target, tag).select { |name| name.include?(text) }
      end

      def grep_in_content target, text, tag = 'HEAD'
        # TODO: support searching in all tags
        Utils.execute(['cd', target], ['git', 'grep', '-l', '-i', '-I', text, tag], ignore_status: true).try(:split, "\n").map {|line| line.sub "#{tag}:", '' }
      end
  end
end
