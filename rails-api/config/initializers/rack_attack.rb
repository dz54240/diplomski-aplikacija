class Rack::Attack
  ### Throttle ###

  throttle("auth/users/ip", limit: 10, period: 5.minutes) do |req|
    req.ip if req.path == "/api/users" && req.post?
  end

  throttle("auth/sessions/ip", limit: 10, period: 5.minutes) do |req|
    req.ip if req.path == "/api/session" && req.post?
  end

  ### Custom 429 response ###

  self.throttled_responder = lambda do |_req|
    [429, { "Content-Type" => "application/json" }, [{ errors: ["too many requests"] }.to_json]]
  end
end

Rails.application.config.middleware.use Rack::Attack
