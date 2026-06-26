class Message < ApplicationRecord
  ROLES = %w[user assistant tool].freeze

  belongs_to :conversation
  belongs_to :user, foreign_key: :user_id

  validates :role, presence: true, inclusion: { in: ROLES }
  validates :content, presence: true
end
