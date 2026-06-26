module JsonRenderer
  extend ActiveSupport::Concern

  private

  def render_json(data, status: :ok)
    render json: { data: serialize(data) }, status: status
  end

  def render_json_created(data)
    render_json(data, status: :created)
  end

  def render_errors(errors, status: :unprocessable_entity)
    render json: { errors: Array(errors) }, status: status
  end

  def render_unauthorized(message = "unauthorized")
    render json: { errors: [message] }, status: :unauthorized
  end

  def serialize(data)
    if data.respond_to?(:each) && !data.is_a?(Hash)
      serializer_class.collection(data, current_user: Current.user)
    elsif data.nil?
      nil
    else
      serializer_class.new(data, current_user: Current.user).attributes
    end
  end

  def serializer_class
    "#{controller_name.classify}Serializer".constantize
  end
end
