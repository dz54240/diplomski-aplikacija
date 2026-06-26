module Api
  class SessionsController < BaseController
    allow_unauthenticated_access only: :create

    def create
      user = User.find_by(email: params[:email].to_s.strip.downcase)
      return render_unauthorized("invalid email or password") unless user&.authenticate(params[:password])

      session = user.sessions.create!(
        ip_address: request.remote_ip,
        user_agent: request.user_agent,
      )
      token = JsonWebTokenService.encode(user_id: user.id, session_id: session.id)

      render json: {
        data: { token: token, user: UserSerializer.new(user).attributes },
      }, status: :created
    end

    def destroy
      Current.session.destroy!
      head :no_content
    end
  end
end
