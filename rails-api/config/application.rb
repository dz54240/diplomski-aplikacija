require_relative "boot"

require "rails"
# Pick the frameworks you want:
require "active_model/railtie"
require "active_job/railtie"
require "active_record/railtie"
require "active_storage/engine"
require "action_controller/railtie"
require "action_mailer/railtie"
require "action_mailbox/engine"
require "action_text/engine"
require "action_view/railtie"
require "action_cable/engine"
# require "rails/test_unit/railtie"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

# Hybrid dev model: a single shared `.env` at repo root drives all backend
# services (Rails / Node / Python). The dotenv-rails Railtie defaults to
# `Rails.root` which is `rails-api/` — load the repo-root file explicitly so
# JWT_SECRET / DATABASE_URL resolve consistently with what Node and the parser
# read. Only relevant in dev/test (gem isn't loaded in production).
if defined?(Dotenv)
  root_env = File.expand_path("../../.env", __dir__)
  Dotenv.load(root_env) if File.exist?(root_env)
end

module RailsApi
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 8.1

    # Please, add to the `ignore` list any other `lib` subdirectories that do
    # not contain `.rb` files, or that should not be reloaded or eager loaded.
    # Common ones are `templates`, `generators`, or `middleware`, for example.
    config.autoload_lib(ignore: %w[assets tasks])

    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.
    #
    # config.time_zone = "Central Time (US & Canada)"
    # config.eager_load_paths << Rails.root.join("extras")

    # Only loads a smaller set of middleware suitable for API only apps.
    # Middleware like session, flash, cookies can be added back manually.
    # Skip views, helpers and assets when generating a new resource.
    config.api_only = true

    # Sidekiq backs all Active Job invocations.
    config.active_job.queue_adapter = :sidekiq

    # pgvector + user-defined SQL functions (immutable_unaccent) + GENERATED
    # tsvector columns + HNSW indexes are not representable by the Ruby DSL schema
    # dumper. Switch to structure.sql which captures the raw Postgres DDL verbatim,
    # so db:schema:load reproduces the full schema on fresh dev/test/CI databases.
    config.active_record.schema_format = :sql
  end
end
