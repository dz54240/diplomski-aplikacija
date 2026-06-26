class QuizPolicy < ApplicationPolicy
  def index? = user.present?
  def show?  = own_record?
  def create? = user.present?

  def submit_attempts?
    own_record? && record.completed_at.nil?
  end

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
