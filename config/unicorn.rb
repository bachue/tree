worker_processes 16
preload_app      true
timeout          180
listen           File.expand_path(File.dirname(__FILE__) + '/../tmp/unicorn.sock'), backlog: 2048
pid              'tmp/unicorn.pid'
stdout_path      "log/#{ENV['RACK_ENV']}.log"
stderr_path      "log/#{ENV['RACK_ENV']}.log"

if GC.respond_to?(:copy_on_write_friendly=)
  GC.copy_on_write_friendly = true
end

after_fork do |server, worker|
  ##
  # Unicorn master loads the app then forks off workers - because of the way
  # Unix forking works, we need to make sure we aren't using any of the parent's
  # sockets, e.g. db connection
 
  ActiveRecord::Base.establish_connection Application::DBCONFIG
 
  ##
  # Unicorn master is started as root, which is fine, but let's
  # drop the workers to git:git
 
  begin
    uid, gid = Process.euid, Process.egid
    user, group = 'git', 'git'
    target_uid = Etc.getpwnam(user).uid
    target_gid = Etc.getgrnam(group).gid
    worker.tmp.chown(target_uid, target_gid)
    if uid != target_uid || gid != target_gid
      Process.initgroups(user, target_gid)
      Process::GID.change_privilege(target_gid)
      Process::UID.change_privilege(target_uid)
    end
  rescue => e
    if ENV['RACK_ENV'] != 'production'
      STDERR.puts "couldn't change user, oh well"
    else
      raise e
    end
  end
end