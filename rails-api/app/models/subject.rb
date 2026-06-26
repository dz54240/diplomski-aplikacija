class Subject < ApplicationRecord
  LANGUAGES = %w[hr en mixed].freeze

  belongs_to :user

  # Deletion cascades at the DB level (ON DELETE CASCADE); these are read-only
  # associations used for dashboard counts and last-activity.
  has_many :documents
  has_many :conversations
  has_many :quizzes

  validates :name, presence: true, length: { maximum: 200 }
  validates :description, length: { maximum: 2_000 }, allow_blank: true
  validates :language, inclusion: { in: LANGUAGES }
end
