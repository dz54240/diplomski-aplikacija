class Document < ApplicationRecord
  STATUSES = %w[uploaded parsing embedding ready failed].freeze
  TERMINAL_STATUSES = %w[ready failed].freeze
  ACTIVE_STATUSES = (STATUSES - TERMINAL_STATUSES).freeze
  ALLOWED_MIME_TYPES = %w[application/pdf].freeze

  belongs_to :user
  belongs_to :subject

  has_one_attached :file
  has_one_attached :parsed_output

  validates :title, presence: true
  validates :mime_type, presence: true
  validates :status, inclusion: { in: STATUSES }
  validates :sha256,
            presence: true,
            uniqueness: { scope: :user_id, case_sensitive: true }

  scope :active, -> { where(status: ACTIVE_STATUSES) }
  scope :terminal, -> { where(status: TERMINAL_STATUSES) }
  scope :ordered_recent, -> { order(created_at: :desc) }

  def terminal?
    TERMINAL_STATUSES.include?(status)
  end

  def active?
    ACTIVE_STATUSES.include?(status)
  end
end
