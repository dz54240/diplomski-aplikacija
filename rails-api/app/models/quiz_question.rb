class QuizQuestion < ApplicationRecord
  BLOOM_LEVELS = Quiz::BLOOM_LEVELS

  belongs_to :quiz
  has_many :quiz_attempts, dependent: :destroy

  validates :stem,           presence: true
  validates :correct_answer, presence: true
  validates :topic,          presence: true
  validates :position,       presence: true, numericality: { only_integer: true, greater_than: 0 }
  validates :bloom_level,    inclusion: { in: BLOOM_LEVELS }
  validate  :distractors_count

  private

  def distractors_count
    errors.add(:distractors, 'must have exactly 3 items') unless distractors.is_a?(Array) && distractors.length == 3
  end
end
