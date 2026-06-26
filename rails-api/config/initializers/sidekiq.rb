# Sidekiq configuration.
#
# Redis URL comes from ENV (set in .env via dotenv-rails for dev/test).
# Falls back to the docker-compose default for safety.
redis_url = ENV.fetch("REDIS_URL", "redis://127.0.0.1:6379/0")

Sidekiq.configure_server do |config|
  config.redis = { url: redis_url }
end

Sidekiq.configure_client do |config|
  config.redis = { url: redis_url }
end
