class CreateQuizzesAndQuestionsAndAttempts < ActiveRecord::Migration[8.1]
  def change
    create_table :quizzes, id: :uuid do |t|
      t.uuid    :user_id, null: false
      t.references :subject, type: :uuid, null: false,
                              foreign_key: { on_delete: :cascade },
                              index: { name: 'quizzes_subject_idx' }
      t.text    :title,        null: false
      t.text    :bloom_focus,  array: true, default: []
      t.datetime :completed_at
      t.jsonb   :metadata,     null: false, default: {}
      t.timestamps
    end
    add_foreign_key :quizzes, :users, on_delete: :cascade
    add_index :quizzes, [:user_id, :subject_id], name: 'quizzes_user_subject_idx'

    create_table :quiz_questions, id: :uuid do |t|
      t.references :quiz, type: :uuid, null: false,
                          foreign_key: { on_delete: :cascade },
                          index: false
      t.integer :position,       null: false
      t.text    :stem,           null: false
      t.text    :correct_answer, null: false
      t.text    :distractors,    array: true, null: false
      t.text    :bloom_level,    null: false
      t.text    :topic,          null: false
      t.bigint  :citation_chunk_ids, array: true, null: false, default: []
      t.decimal :critic_score,   precision: 3, scale: 2
      t.jsonb   :metadata,       null: false, default: {}
      t.timestamps
    end
    add_index :quiz_questions, [:quiz_id, :position], name: 'quiz_questions_quiz_position_idx'

    execute <<~SQL
      ALTER TABLE quiz_questions
        ADD CONSTRAINT quiz_questions_bloom_level_check
        CHECK (bloom_level IN ('Remember', 'Understand', 'Apply', 'Analyze'));
    SQL

    create_table :quiz_attempts, id: :uuid do |t|
      t.uuid    :user_id, null: false
      t.references :quiz_question, type: :uuid, null: false,
                                    foreign_key: { on_delete: :cascade },
                                    index: false
      t.text    :selected,    null: false
      t.boolean :is_correct,  null: false
      t.integer :time_taken_ms
      t.timestamps
    end
    add_foreign_key :quiz_attempts, :users, on_delete: :cascade
    add_index :quiz_attempts, [:user_id, :quiz_question_id], name: 'quiz_attempts_user_q_idx'
    add_index :quiz_attempts, [:user_id, :created_at], order: { created_at: :desc },
              name: 'quiz_attempts_user_created_idx'

    execute <<~SQL
      CREATE VIEW weak_topics AS
      SELECT qa.user_id,
             qq.topic,
             q.subject_id,
             count(*)                                   AS attempts,
             avg(qa.is_correct::int)::float             AS accuracy,
             count(*) FILTER (WHERE NOT qa.is_correct)  AS wrong_count
      FROM quiz_attempts qa
      JOIN quiz_questions qq ON qa.quiz_question_id = qq.id
      JOIN quizzes q          ON qq.quiz_id = q.id
      GROUP BY qa.user_id, qq.topic, q.subject_id
      HAVING count(*) >= 3;
    SQL
  end
end
