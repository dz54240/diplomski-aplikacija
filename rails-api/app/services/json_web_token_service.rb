class JsonWebTokenService
  ALGORITHM = "HS256"
  DEFAULT_TTL = 7.days

  class << self
    def encode(user_id:, session_id:, ttl: DEFAULT_TTL)
      payload = {
        user_id: user_id,
        session_id: session_id,
        exp: ttl.from_now.to_i,
      }
      JWT.encode(payload, secret, ALGORITHM)
    end

    def decode(token)
      raw, _header = JWT.decode(token, secret, true, algorithm: ALGORITHM)
      raw.symbolize_keys
    end

    def service_token(audience:, ttl: 5.minutes)
      payload = {
        iss: ENV.fetch("JWT_ISSUER", "rails-api"),
        aud: audience,
        iat: Time.current.to_i,
        exp: (Time.current + ttl).to_i,
      }
      JWT.encode(payload, secret, ALGORITHM)
    end

    private

    def secret
      ENV.fetch("JWT_SECRET")
    end
  end
end
