module Authentication
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_request
  end

  class_methods do
    def allow_unauthenticated_access(**options)
      skip_before_action :authenticate_request, **options
    end
  end

  private

  def authenticate_request
    token = bearer_token or return render_unauthorized("missing token")

    payload = JsonWebTokenService.decode(token)
    session = Session.find_by(id: payload[:session_id], user_id: payload[:user_id])
    return render_unauthorized("invalid session") unless session

    session.update_column(:last_used_at, Time.current)
    Current.session = session
    Current.user = session.user
  rescue JWT::DecodeError
    render_unauthorized("invalid token")
  end

  def bearer_token
    header = request.headers["Authorization"].to_s
    header.start_with?("Bearer ") ? header.delete_prefix("Bearer ").strip : nil
  end

  def current_user = Current.user
end
