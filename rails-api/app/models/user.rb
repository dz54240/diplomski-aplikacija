class User < ApplicationRecord
  EMAIL_REGEX = /\A[^@\s]+@[^@\s]+\.[^@\s]+\z/

  has_secure_password

  has_many :sessions, dependent: :destroy
  has_many :subjects, dependent: :destroy

  validates :email,
            presence: true,
            uniqueness: { case_sensitive: false },
            format: { with: EMAIL_REGEX, allow_blank: true }
  validates :first_name, presence: true
  validates :last_name,  presence: true
  validates :password,   length: { minimum: 8 }, allow_nil: true

  before_validation :normalize_email

  private

  def normalize_email
    self.email = email.to_s.strip.downcase.presence
  end
end
