class HealthController < ApplicationController
  def show
    render json: { status: "ok", service: "rails-api" }
  end
end
