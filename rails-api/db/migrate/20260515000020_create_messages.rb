class CreateMessages < ActiveRecord::Migration[8.1]
  def change
    create_table :messages do |t|
      t.references :conversation, type: :uuid, null: false,
                                  foreign_key: { on_delete: :cascade },
                                  index: false
      t.uuid :user_id, null: false
      t.string :role, null: false
      t.text :content, null: false
      t.jsonb :parts

      t.timestamps
    end

    execute <<~SQL
      ALTER TABLE messages ADD COLUMN embedding vector(1536);
      ALTER TABLE messages ADD CONSTRAINT messages_role_check
        CHECK (role IN ('user','assistant','tool'));
    SQL

    add_index :messages, [:conversation_id, :created_at],
              name: 'messages_conv_idx'

    execute <<~SQL
      CREATE INDEX messages_emb_idx ON messages
        USING hnsw (embedding vector_cosine_ops)
        WITH (m = 16, ef_construction = 64);
    SQL
  end
end
