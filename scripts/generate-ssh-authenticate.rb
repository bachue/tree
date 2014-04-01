#!/usr/bin/ruby -w

require 'erb'

erb = File.read(File.expand_path(File.dirname(__FILE__) + '/ssh-authenticate.rb.erb'))
content = ERB.new(erb).result binding

if ARGV[0]
  File.write ARGV[0], content
else
  puts content
end
