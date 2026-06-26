class SubjectSerializer < ApplicationSerializer
  def attributes
    {
      id: object.id,
      name: object.name,
      description: object.description,
      language: object.language,
      documents_count: object.documents.size,
      last_activity_at: last_activity_at.iso8601,
      created_at: object.created_at.iso8601,
      updated_at: object.updated_at.iso8601,
    }
  end

  private

  # Uses Ruby (map/max) rather than SQL maximum so eager-loaded associations
  # stay N+1-free.
  def last_activity_at
    timestamps = [
      object.documents.map(&:updated_at).max,
      object.conversations.map(&:updated_at).max,
      object.quizzes.map(&:updated_at).max,
    ].compact
    timestamps.max || object.created_at
  end
end
