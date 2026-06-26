module Documents
  class IngestDispatchService
    NODE_AGENT_URL  = ENV.fetch("NODE_AGENT_URL", "http://node-agent:4000")
    TIMEOUT_SECONDS = 180

    def initialize(connection: nil)
      @connection = connection || default_connection
    end

    def call(document)
      parsed_output = JSON.parse(document.parsed_output.download)
      enriched      = Documents::ImageUrlEnricherService.new(parsed_output, ttl: 10.minutes).call
      token         = JsonWebTokenService.service_token(audience: "node-agent")

      response = @connection.post("/ingest") do |req|
        req.headers["Authorization"] = "Bearer #{token}"
        req.headers["Content-Type"]  = "application/json"
        req.body = {
          document_id:   document.id,
          user_id:       document.user_id,
          subject_id:    document.subject_id,
          parsed_output: enriched,
          language:      document.subject.language,
        }.to_json
      end

      unless response.success?
        raise "node /ingest failed: #{response.status} #{response.body.to_s.truncate(500)}"
      end

      JSON.parse(response.body)
    end

    private

    def default_connection
      Faraday.new(url: NODE_AGENT_URL) do |conn|
        conn.options.timeout      = TIMEOUT_SECONDS
        conn.options.open_timeout = 5
      end
    end
  end
end
