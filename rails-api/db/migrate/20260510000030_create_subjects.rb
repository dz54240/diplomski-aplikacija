class CreateSubjects < ActiveRecord::Migration[8.1]
  def change
    create_table :subjects, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :user, null: false, foreign_key: { on_delete: :cascade }, type: :uuid
      t.string :name, null: false
      t.text :description
      t.string :language, null: false, default: "mixed"
      t.datetime :archived_at
      t.timestamps
    end

    add_index :subjects, :user_id, where: "archived_at IS NULL", name: "subjects_user_active_idx"
  end
end
