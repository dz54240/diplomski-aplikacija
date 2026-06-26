class Chunk < ApplicationRecord
  MODALITIES = %w[text image_caption table formula].freeze

  has_neighbors :embedding, dimensions: 1536, normalize: false

  belongs_to :document
  belongs_to :user
  belongs_to :subject

  validates :modality, presence: true, inclusion: { in: MODALITIES }
  validates :content, presence: true
  validates :position, presence: true, numericality: { only_integer: true }
  validates :embedding_model, presence: true
end
