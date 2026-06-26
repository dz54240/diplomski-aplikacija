Rails.application.routes.draw do
  get "health" => "health#show"
  get "up"     => "rails/health#show", as: :rails_health_check

  namespace :api do
    resources :users, only: [:create]

    resource :session, only: [:create, :destroy], controller: "sessions"
    # ↑ singular resource: POST /api/session creates, DELETE /api/session destroys "current".
    # Controller name plural to match Rails convention (sessions_controller.rb).

    resources :subjects, only: %i[index show create update destroy] do
      resources :documents, only: %i[index create]
      resources :conversations, only: %i[index], controller: "conversations"
      resources :quizzes, only: %i[index], controller: "quizzes"
    end

    resources :documents, only: %i[show destroy] do
      member do
        post :retry
        get  :parsed_blocks
      end
    end

    resources :conversations, only: %i[show]
    resources :quizzes, only: %i[show] do
      resources :attempts, only: %i[create], controller: 'quiz_attempts'
    end
  end

  # Sidekiq Web UI (dev/test only). Basic auth from ENV.
  if Rails.env.development? || Rails.env.test?
    require "sidekiq/web"
    Sidekiq::Web.use(Rack::Auth::Basic) do |user, pass|
      user == ENV.fetch("SIDEKIQ_USER", "admin") &&
        pass == ENV.fetch("SIDEKIQ_PASS", "sidekiq-dev")
    end
    mount Sidekiq::Web => "/sidekiq"
  end
end
