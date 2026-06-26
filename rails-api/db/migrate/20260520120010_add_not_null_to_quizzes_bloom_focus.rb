class AddNotNullToQuizzesBloomFocus < ActiveRecord::Migration[8.1]
  def change
    change_column_null :quizzes, :bloom_focus, false
  end
end
