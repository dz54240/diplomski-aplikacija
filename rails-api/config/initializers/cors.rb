# Cross-Origin Resource Sharing — allows the Vite dev client (localhost:5173)
# to call this API from a different origin. Production origins are added by
# setting CORS_ORIGINS in that env (comma-separated).

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    raw_origins = ENV.fetch("CORS_ORIGINS", "http://localhost:5173")
    origins(*raw_origins.split(",").map(&:strip))

    resource "/api/*",
             headers: :any,
             methods: %i[get post put patch delete options head],
             expose: %w[Authorization]

    resource "/health",
             headers: :any,
             methods: %i[get options head]
  end
end
