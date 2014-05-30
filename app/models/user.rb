require 'protected_attributes'

class User < ActiveRecord::Base
  attr_accessible :name, :email
  validates :name, :email, presence: true, uniqueness: true
  validates :name, length: {maximum: 30}
  validates :email, length: {maximum: 50}

  has_many :keys
end
