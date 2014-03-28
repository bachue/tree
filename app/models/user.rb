require 'protected_attributes'

class User < ActiveRecord::Base
  attr_accessible :name, :email, :password, :password_confirmation
  validates_presence_of :password, on: :create
  validates :name, :email, presence: true, uniqueness: true
  validates :name, length: {maximum: 30}
  validates :email, length: {maximum: 50}

  has_many :keys
  has_secure_password
end
