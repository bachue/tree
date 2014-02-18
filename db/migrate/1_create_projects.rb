class CreateProjects < ActiveRecord::Migration
  def up
    create_table :projects do |t|
      t.string :name, limit: 30, null: false
      t.string :url, null: false
      t.string :branch, limit: 30, null: false
      t.string :path, null: false
      t.timestamps
    end

    add_index :projects, :name, name: 'projects_name_unique_index', unique: true
  end

  def down
    remove_index :projects, :name
    drop_table :projects
  end
end