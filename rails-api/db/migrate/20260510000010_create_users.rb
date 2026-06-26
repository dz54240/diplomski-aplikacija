class CreateUsers < ActiveRecord::Migration[8.1]
  def change
    enable_extension "citext" unless extension_enabled?("citext")
    enable_extension "pgcrypto" unless extension_enabled?("pgcrypto")

    create_table :users, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.column :email, :citext, null: false
      t.string :password_digest, null: false
      t.string :first_name, null: false
      t.string :last_name, null: false
      t.timestamps
    end

    add_index :users, :email, unique: true
  end
end
