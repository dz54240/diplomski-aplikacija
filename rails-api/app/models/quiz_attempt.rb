class QuizAttempt < ApplicationRecord
  belongs_to :user, foreign_key: :user_id
  belongs_to :quiz_question

  validates :user_id,    presence: true
  validates :selected,   presence: true
  validates :is_correct, inclusion: { in: [true, false] }
end
