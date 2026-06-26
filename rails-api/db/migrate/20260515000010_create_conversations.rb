class CreateConversations < ActiveRecord::Migration[8.1]
  def change
    create_table :conversations, id: :uuid do |t|
      t.uuid :user_id, null: false
      t.references :subject, type: :uuid, null: false,
                             foreign_key: { on_delete: :cascade },
                             index: { name: 'conversations_subject_idx' }
      t.string :title
      t.datetime :archived_at

      t.timestamps
    end

    add_foreign_key :conversations, :users, on_delete: :cascade

    add_index :conversations, [:user_id, :subject_id],
              name: 'conversations_user_subject_idx'

    execute <<~SQL
      CREATE INDEX conversations_updated_idx
        ON conversations(user_id, updated_at DESC)
        WHERE archived_at IS NULL;
    SQL
  end
end
