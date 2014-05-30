class CreateUsers < ActiveRecord::Migration
  def up
    create_table :users do |t|
      t.string :name, limit: 30, null: false
      t.string :email, limit: 50, null: false
      t.timestamps
    end

    add_index :users, :name, name: 'users_name_unique_index', unique: true
    add_index :users, :email, name: 'users_email_unique_index', unique: true
  end

  def down
    remove_index :users, :name
    remove_index :users, :email
    drop_table :users
  end
end
