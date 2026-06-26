class Conversation < ApplicationRecord
  belongs_to :subject
  belongs_to :user, foreign_key: :user_id
  has_many :messages, dependent: :destroy

  validates :user_id, presence: true

  scope :active, -> { where(archived_at: nil) }
end
