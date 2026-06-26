class Quiz < ApplicationRecord
  BLOOM_LEVELS = %w[Remember Understand Apply Analyze].freeze

  belongs_to :user, foreign_key: :user_id
  belongs_to :subject
  has_many :quiz_questions, -> { order(:position) }, dependent: :destroy
  has_many :quiz_attempts, through: :quiz_questions

  validates :user_id, presence: true
  validates :title,   presence: true
  validate  :bloom_focus_values_known

  scope :for_subject, ->(subject_id) { where(subject_id: subject_id) }

  private

  def bloom_focus_values_known
    return if bloom_focus.blank?
    unknown = bloom_focus - BLOOM_LEVELS
    errors.add(:bloom_focus, "contains unknown values: #{unknown.join(', ')}") if unknown.any?
  end
end
