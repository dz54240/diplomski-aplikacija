class MessageSerializer < ApplicationSerializer
  def attributes
    {
      id: object.id,
      role: object.role,
      content: object.content,
      parts: object.parts,
      created_at: object.created_at.iso8601,
    }
  end
end
