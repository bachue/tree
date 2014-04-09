require 'open3'
require 'fileutils'
require 'escape'
require 'securerandom'
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

    def initial_commit target, branch: 'master', author: nil
      repo = get_repo target
      # TODO: use add_to_index here
      builder = Rugged::Tree::Builder.new
      create_commit repo, builder.write(repo), 'initial commit', branch: branch, author: author
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
      tree = last_commit(repo, branch: branch, tag: tag).tree
      object_id_of(repo, tree, file_path)
    end

    def last_commit_id target, branch: 'master', tag: 'HEAD'
      repo = get_repo target
      last_commit(repo, branch: branch, tag: tag).oid
    end

    def add_to_index target, file_path, file_content, based_on, message, branch: 'master', author: author
      pull target, branch

      repo = get_repo target

      if based_on
        temp_branch_name = SecureRandom.hex
        temp_ref_name = "refs/heads/#{temp_branch_name}"
        repo.create_branch temp_branch_name, based_on
      end

      begin
        oid = repo.write file_content, :blob
        index = repo.index
        index.add path: file_path, oid: oid, mode: 0100644
        if based_on
          commit_id = create_commit repo, index.write_tree(repo), message, based_on: based_on, update_ref: temp_ref_name, branch: branch, author: author
          temp_commit = repo.lookup commit_id
          current_commit = repo.branches[branch].target
          base_commit = repo.lookup based_on
          index = current_commit.tree.merge temp_commit.tree, base_commit.tree

          if index.conflicts?
            raise CommitError.new <<-ERROR
  That file has been modified before your commit! Merge conflict! Please edit and commit again.
            ERROR
          end
        end

        create_commit repo, index.write_tree(repo), message, branch: branch, author: author
        push repo, branches: branch
      ensure
        clear_all target
        repo.branches.delete temp_branch_name if temp_branch_name
      end
    end

    def diff_between_changes target, file_path, file_content, based_on, branch = 'master'
      repo = get_repo target

      oid = repo.write file_content, :blob
      index = repo.index
      index.add path: file_path, oid: oid, mode: 0100644
      tree = index.write_tree repo
      diff_between repo, based_on, tree
    end

    def remove_from_index target, file_path, message, branch: 'master', author: author
      pull target, branch

      repo = get_repo target

      index = repo.index
      begin
        index.remove file_path
        create_commit repo, index.write_tree(repo), message, branch: branch, author: author
        push repo, branches: branch
      rescue Rugged::IndexError
        # If file is not existed, do nothing
      ensure
        clear_all target
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

      old_commmit = last_commit repo, tag: old_tag, branch: branch
      new_commmit = last_commit repo, tag: new_tag, branch: branch
      diff_between repo, old_commmit, new_commmit
    end

    # Just support to show all logs of a file
    def logs target, file_path, reverse: true, branch: 'master', tag: 'HEAD'
      repo = get_repo target

      walker = Rugged::Walker.new repo
      walker.push last_commit_id(repo, branch: branch, tag: tag)
      walker.sorting Rugged::SORT_TOPO | Rugged::SORT_REVERSE
      get_object_id = ->(commit) { object_id_of(repo, commit.tree, file_path) }
      commits = walker.each.select(&get_object_id).uniq(&get_object_id)
      commits.reverse! if reverse

      groups = (0...commits.size).to_a.map {|i| [commits[i], commits[i + 1] || commits[i].parents.first] }
      tag_hash = oid_tag_hash repo
      groups.map do |new, old|
        {
          message: new.message,
          author: new.author,
          tags: tag_hash[new.oid].try(:map, &:name),
          diff: diff_between(repo, old, new, only: file_path)
        }
      end
    end

    private
      def diff_between repo, old_oid, new_oid, only: nil
        diff = repo.diff old_oid, new_oid,
                         context_lines: 5,
                         interhunk_lines: 5,
                         ignore_whitespace: true,
                         ignore_whitespace_change: true,
                         ignore_whitespace_eol: true,
                         skip_binary_check: true
        diff.each_patch.select {|patch|
          next true unless only
          delta = patch.delta
          delta.old_file[:path] == only || delta.new_file[:path] == only
        }.map do |patch|
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

      def oid_tag_hash repo
        repo.tags.inject({}) do |hash, tag|
          if (hash[tag.target_id])
            hash[tag.target_id] << tag
          else
            hash[tag.target_id] = [tag]
          end
          hash
        end
      end

      def last_commit repo, branch: 'master', tag: 'HEAD'
        if tag != 'HEAD'
          repo.tags.detect {|t| t.name == tag }.target
        else
          repo.branches[branch].target
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

      def create_commit repo, tree, message, based_on: nil, update_ref: 'HEAD', author: nil, branch: 'master'
        based_on ||= repo.branches[branch].target_id unless repo.empty?
        Rugged::Commit.create repo, tree: tree,
                                    message: message,
                                    parents: Array(based_on),
                                    update_ref: update_ref,
                                    author: author,
                                    committer: author
      end

      def credentials # TODO: Need to wait for HTTPS authorization
        ->(url, username, _) {
          Rugged::Credentials::SshKey.new username: username,
                                          publickey: "#{ENV['HOME']}/.ssh/id_rsa.pub",
                                          privatekey: "#{ENV['HOME']}/.ssh/id_rsa"
        } # No passphrase for now
      end
  end
end
