module Api
  class UsersController < BaseController
    allow_unauthenticated_access only: :create

    def create
      result = UserForm.new(record: User.new, params: user_params).perform
      return render_errors(result.errors) unless result.success?

      session = result.record.sessions.create!(
        ip_address: request.remote_ip,
        user_agent: request.user_agent,
      )
      token = JsonWebTokenService.encode(user_id: result.record.id, session_id: session.id)

      render json: {
        data: {
          token: token,
          user: UserSerializer.new(result.record).attributes,
        },
      }, status: :created
    end

    private

    def user_params
      params.require(:user).permit(:email, :password, :first_name, :last_name)
    end
  end
end
