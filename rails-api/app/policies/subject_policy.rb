class SubjectPolicy < ApplicationPolicy
  def index?  = user.present?
  def show?   = own_record?
  def create? = user.present?
  def update? = own_record?
  def destroy? = own_record?

  def permitted_attributes_for_create = %i[name description language]
  def permitted_attributes_for_update = %i[name description language]

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
