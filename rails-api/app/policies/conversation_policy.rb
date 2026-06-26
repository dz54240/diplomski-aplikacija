class ConversationPolicy < ApplicationPolicy
  def index? = user.present?
  def show?  = own_record?

  private

  def own_record?
    record.respond_to?(:user_id) && record.user_id == user.id
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      scope.where(user_id: user.id)
    end
  end
end
