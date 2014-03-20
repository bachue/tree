require 'open3'
require 'fileutils'
require 'escape'
require 'rugged'

unless (not_implemented = [:https, :ssh] - Rugged.features).empty?
  fail "Rugged doesn't support #{not_implemented}, please config and rebuild libgit2"
end

class Git
  class CommandError < RuntimeError; end
  class CommitError < RuntimeError; end

  class Utils
    class << self
      def execute *multi_args, ignore_status: false, ignore_error: false, **opts
        commands = multi_args.map {|args| Escape.shell_command args }
        command = commands.join ' && '
        Open3.popen3(command, **opts) do |stdin, stdout, stderr, status|
          stdin.close
          return if ignore_error
          output = stdout.gets(nil) || ''
          errput = stderr.gets(nil) || ''
          if ignore_status
            return output unless errput.present?
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
      extra = branch ? {branch: branch} : {}
      Rugged::Repository.clone_at source, target,
        **extra,
        ignore_cert_errors: true,
        credentials: credentials
    end

    def new_repo target
      FileUtils.rm_rf target
      Rugged::Repository.init_at(target, :bare)
    end

    def initial_commit target, branch = 'master'
      repo = get_repo target
      # TODO: use add_to_index here
      builder = Rugged::Tree::Builder.new
      Rugged::Commit.create repo, tree: builder.write(repo),
                            message: 'Initial commit',
                            parents: [],
                            update_ref: 'HEAD',
                            author: author,
                            committer: author
      push repo, branches: 'master'
    end

    def pull target, branch = 'master'
      Utils.execute ['git', 'fetch'], ['git', 'pull', '--quiet', 'origin', branch], chdir: target
    end

    def ls_tree target, tag = 'HEAD'
      Utils.execute(['git', 'ls-tree', '-r', '--name-only', tag], chdir: target).try(:split, "\n")
    end

    def cat_file target, file_path, tag: 'HEAD', branch: 'master'
      repo = get_repo target
      blob_id = blob_id_of repo, file_path, tag: tag, branch: branch
      return false unless blob_id # File not found, returns false
      blob = repo.lookup blob_id
      if blob.is_a?(Rugged::Blob) then blob.text
      else                             blob.class
      end
    end

    def tag target, *args, branch: 'master'
      repo = get_repo target
      if args.empty? # Git.tag <target>
        repo.tags.map(&:name)
      elsif args.first == :add # Git.tag <target>, :add, tag_name, branch: 'master'
        tag_name = args[1]
        repo.tags.create tag_name, repo.branches[branch].target_id
        push repo, tags: tag_name
      end
    end

    def grep target, text, tag = 'HEAD'
      {
        filenames: grep_in_filenames(target, text, tag),
        content: grep_in_content(target, text, tag)
      }
    end

    def updated? target, branch = 'master'
      repo = get_repo(target)

      remote = repo.remotes.detect {|r| r.name == 'origin' }
      # TODO: Add credentials to ls when it's available
      remote = remote.ls.detect {|ref| ref[:name] == 'HEAD' }[:oid]

      local = repo.branches['master'].target_id
      remote != local
    end

    def blob_id_of target, file_path, branch: 'master', tag: 'HEAD'
      repo = get_repo target
      tree =  if tag != 'HEAD' # Git.blob target, path, tag: 'v1'
                repo.tags.detect {|t| t.name == tag }.target.tree
              else             # Git.blob target, path, branch: 'development'
                repo.branches[branch].target.tree
              end
      object_id_of(repo, tree, file_path)
    end

    def add_to_index target, file_path, file_content, based_on, message, branch = 'master'
      pull target, branch

      repo = get_repo target

      # Validate your parent
      blob_id = object_id_of(repo, repo.branches[branch].target.tree, file_path)
      # If blob_id is false, means to create new file in git repo
      if blob_id && based_on != blob_id
        raise CommitError.new 'That file has been modified before your commit'
      end

      oid = repo.write file_content, :blob
      index = repo.index
      index.add path: file_path, oid: oid, mode: 0100644
      Rugged::Commit.create repo, tree: index.write_tree(repo),
                                  message: message,
                                  parents: repo.empty? ? [] : [repo.branches[branch].target_id],
                                  update_ref: 'HEAD',
                                  author: author,
                                  committer: author
      clear_all target
      push repo, branches: branch
    end

    def remove_from_index target, file_path, message, branch = 'master'
      pull target, branch

      repo = get_repo target

      index = repo.index
      begin
        index.remove file_path
        Rugged::Commit.create repo, tree: index.write_tree(repo),
                                    message: message,
                                    parents: repo.empty? ? [] : [repo.branches[branch].target_id],
                                    update_ref: 'HEAD',
                                    author: author,
                                    committer: author
        clear_all target
        push repo, branches: branch
      rescue Rugged::IndexError
        # If file is not existed, do nothing
      end
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
      curl -X PATCH "#{host}/api/projects/#{project_name}/#{branch}" >>"#{log}" 2>&1 &
    fi
done
        HOOK
        file.chmod 0755
      end
      true
    end

    def diff_between_tags target, old_tag, new_tag, branch: 'master'
      repo = get_repo target

      old_oid = if old_tag != 'HEAD'
                  repo.tags.detect {|t| t.name == old_tag }.target
                else
                  repo.branches[branch].target
                end
      new_oid = if new_tag != 'HEAD'
                  repo.tags.detect {|t| t.name == new_tag }.target
                else
                  repo.branches[branch].target
                end
      diff_between repo, old_oid, new_oid
    end

    private
      def diff_between repo, old_oid, new_oid
        diff = repo.diff old_oid, new_oid,
                         context_lines: 5,
                         interhunk_lines: 5,
                         ignore_whitespace: true,
                         ignore_whitespace_change: true,
                         ignore_whitespace_eol: true,
                         skip_binary_check: true
        diff.each_patch.map do |patch|
          stat =  patch.hunks.map(&:lines).flatten.group_by(&:line_origin).
                    inject(Hash.new {|h, k| h[k] = 0 }) {|h, (k, v)| h[k] += v.size; h }

          delta = patch.delta
          {
            meta: {
              status: delta.status,
              binary: delta.binary,
              old: delta.old_file,
              new: delta.new_file,
              stat: stat
            },
            hunks: patch.each_hunk.map do |hunk|
              {
                header: hunk.header,
                lines: hunk.each_line.map do |line|
                  {
                    type: line.line_origin,
                    content: line.content,
                    old_lineno: line.old_lineno,
                    new_lineno: line.new_lineno
                  }
                end
              }
            end
          }
        end
      end

      def grep_in_filenames target, text, tag = 'HEAD'
        ls_tree(target, tag).select { |name| name.include?(text) }
      end

      def grep_in_content target, text, tag = 'HEAD'
        # TODO: support searching in all tags
        Utils.execute(['git', 'grep', '-l', '-i', '-I', text, tag], ignore_status: true, chdir: target).try(:split, "\n").map {|line| line.sub "#{tag}:", '' }
      end

      def push repo, branches: [], tags: [] # Git.push repo, branches: ['b1', 'b2'], tags: ['t1', 't2']
        repo.push 'origin', [
          *Array(branches).map {|branch| "refs/heads/#{branch}" },
          *Array(tags).map     {|tag|    "refs/tags/#{tag}"}
        ], credentials: credentials
      end

      def clear_all target
        Utils.execute ['git', 'reset', 'HEAD'], ['git', 'clean', '-f', '-d', '-q'], chdir: target
        Utils.execute ['git', 'checkout', '.'], chdir: target, ignore_error: true
      end

      def object_id_of repo, tree, path
        path = path.split('/') if path.is_a?(String)
        ref = tree[path.shift]
        return false unless ref # File not found, returns false
        oid = ref[:oid]
        if path.empty? then oid
        else                object_id_of repo, repo.lookup(oid), path
        end
      end

      def get_repo target
        target.is_a?(Rugged::Repository) ? target : Rugged::Repository.new(target)
      end

      def credentials # TODO: Need to wait for HTTPS authorization
        ->(url, username, _) {
          Rugged::Credentials::SshKey.new username: username,
                                          publickey: "#{ENV['HOME']}/.ssh/id_rsa.pub",
                                          privatekey: "#{ENV['HOME']}/.ssh/id_rsa"
        } # No passphrase for now
      end

      def author # TODO: To remove it
        {name: 'Rong Zhou', email: 'rongz@mozy.com'}
      end
  end
end
