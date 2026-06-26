class ApplicationController < ActionController::API
  include Pundit::Authorization
  include JsonRenderer

  rescue_from Pundit::NotAuthorizedError, with: :render_forbidden
  rescue_from ActiveRecord::RecordNotFound, with: :record_not_found

  private

  def render_forbidden
    render json: { errors: ["forbidden"] }, status: :forbidden
  end

  def record_not_found(_exception)
    render json: { errors: { database: ["Model not found"] } }, status: :not_found
  end
end
