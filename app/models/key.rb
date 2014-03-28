require 'sshkey'

class Key < ActiveRecord::Base
  belongs_to :user
  validates :name, :public_key, :user_id, presence: true

  def fingerprint
    SSHKey.fingerprint public_key
  end
end
