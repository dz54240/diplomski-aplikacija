class DocumentPolicy < ApplicationPolicy
  def index?         = true   # Scope filters per-user
  def show?          = own_record?
  def create?        = true   # Form validates subject ownership
  def update?        = own_record?
  def destroy?       = own_record?
  def retry?         = own_record?
  def parsed_blocks? = own_record?

  def permitted_attributes_for_create
    [:title, :subject_id, :file]
  end

  def permitted_attributes_for_update
    [:title]
  end

  private

  def own_record?
    record.user_id == user.id
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      scope.where(user_id: user.id)
    end
  end
end
