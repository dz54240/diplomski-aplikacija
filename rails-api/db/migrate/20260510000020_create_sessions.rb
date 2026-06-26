class CreateSessions < ActiveRecord::Migration[8.1]
  def change
    create_table :sessions, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :user, null: false, foreign_key: { on_delete: :cascade }, type: :uuid
      t.inet :ip_address
      t.string :user_agent
      t.datetime :last_used_at, null: false, default: -> { "now()" }
      t.timestamps
    end
  end
end
