class CreateChunks < ActiveRecord::Migration[8.1]
  def change
    create_table :chunks do |t|
      t.references :document, type: :uuid, null: false,
                              foreign_key: { on_delete: :cascade },
                              index: { name: 'chunks_doc_idx' }
      t.uuid :user_id, null: false
      t.uuid :subject_id, null: false

      t.string :modality, null: false
      t.text :content, null: false
      t.string :embedding_model, null: false

      t.integer :page
      t.text :section_path, array: true, default: []
      t.integer :position, null: false
      t.string :image_uri
      t.boolean :image_is_critical, default: false
      t.jsonb :metadata, null: false, default: {}

      t.timestamps
    end

    # Postgres rejects unaccent() inside a GENERATED column because the function is
    # technically VOLATILE (its output depends on the dictionary file at runtime).
    # Wrap it in an IMMUTABLE SQL function so the planner accepts it for STORED
    # columns. Standard pgvector + tsvector workaround.
    execute <<~SQL
      CREATE OR REPLACE FUNCTION public.immutable_unaccent(text)
        RETURNS text
        AS $$ SELECT public.unaccent('public.unaccent', $1) $$
        LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT;
    SQL

    execute <<~SQL
      ALTER TABLE chunks ADD COLUMN embedding vector(1536) NOT NULL;

      ALTER TABLE chunks ADD COLUMN content_tsv tsvector
        GENERATED ALWAYS AS (to_tsvector('simple', public.immutable_unaccent(content))) STORED;

      ALTER TABLE chunks ADD CONSTRAINT chunks_modality_check
        CHECK (modality IN ('text','image_caption','table','formula'));
    SQL

    add_foreign_key :chunks, :users, on_delete: :cascade
    add_foreign_key :chunks, :subjects, on_delete: :cascade

    add_index :chunks, [:user_id, :subject_id], name: 'chunks_user_subject_idx'
    add_index :chunks, [:document_id, :position], name: 'chunks_doc_position_idx'

    execute "CREATE INDEX chunks_tsv_idx ON chunks USING gin (content_tsv);"
    execute <<~SQL
      CREATE INDEX chunks_embedding_idx ON chunks
        USING hnsw (embedding vector_cosine_ops)
        WITH (m = 16, ef_construction = 64);
    SQL
  end
end
