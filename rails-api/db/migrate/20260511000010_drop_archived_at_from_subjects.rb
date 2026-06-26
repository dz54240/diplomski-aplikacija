class DropArchivedAtFromSubjects < ActiveRecord::Migration[8.1]
  def up
    remove_index :subjects, name: "subjects_user_active_idx"
    remove_column :subjects, :archived_at
    add_index :subjects, :user_id, name: "subjects_user_idx"
  end

  def down
    remove_index :subjects, name: "subjects_user_idx"
    add_column :subjects, :archived_at, :datetime
    add_index :subjects, :user_id, where: "archived_at IS NULL", name: "subjects_user_active_idx"
  end
end
