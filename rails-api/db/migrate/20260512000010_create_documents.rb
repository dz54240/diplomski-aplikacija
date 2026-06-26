class CreateDocuments < ActiveRecord::Migration[8.1]
  def change
    create_table :documents, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :user, null: false, foreign_key: { on_delete: :cascade }, type: :uuid
      t.references :subject, null: false, foreign_key: { on_delete: :cascade }, type: :uuid

      t.string :title, null: false
      t.string :mime_type, null: false
      t.integer :page_count
      t.binary :sha256, null: false
      t.string :status, null: false, default: "uploaded"

      t.string :error_msg
      t.datetime :ready_at

      t.timestamps
    end

    add_index :documents, [:user_id, :sha256], unique: true
    add_index :documents, :status,
              where: "status NOT IN ('ready','failed')",
              name: "documents_status_active_idx"

    add_check_constraint :documents,
                         "status IN ('uploaded','parsing','embedding','ready','failed')",
                         name: "documents_status_check"
  end
end
