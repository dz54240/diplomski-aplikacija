class UserSerializer < ApplicationSerializer
  def attributes
    {
      id: object.id,
      email: object.email,
      first_name: object.first_name,
      last_name: object.last_name,
      created_at: object.created_at.iso8601,
    }
  end
end
