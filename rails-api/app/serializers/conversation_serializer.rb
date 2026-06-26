class ConversationSerializer < ApplicationSerializer
  def attributes
    {
      id: object.id,
      subject_id: object.subject_id,
      title: object.title,
      archived_at: object.archived_at&.iso8601,
      created_at: object.created_at.iso8601,
      updated_at: object.updated_at.iso8601,
    }
  end
end
