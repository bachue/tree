class CreateKeys < ActiveRecord::Migration
  def up
    create_table :keys do |t|
      t.string :name, null: false
      t.text :public_key, null: false
      t.references :user, null: false, index: true
      t.timestamps
    end

    add_index :keys, :name, name: 'keys_name_unique_index', unique: true
  end

  def down
    drop_index :keys, :name
    drop_table :keys
  end
end
