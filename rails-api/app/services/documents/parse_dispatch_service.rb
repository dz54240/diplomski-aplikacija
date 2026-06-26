module Documents
  class ParseDispatchService
    PARSE_TIMEOUT = 8.minutes

    def initialize(document)
      @document = document
    end

    def call
      response = http_client.post("/parse", request_body.to_json, headers)
      if response.success?
        FormResult.success(JSON.parse(response.body, symbolize_names: true))
      else
        FormResult.failure(["python-parser returned #{response.status}: #{response.body}"])
      end
    rescue Faraday::Error => e
      FormResult.failure(["python-parser unreachable: #{e.class.name}: #{e.message}"])
    end

    private

    attr_reader :document

    def http_client
      @http_client ||= Faraday.new(url: ENV.fetch("PYTHON_PARSER_URL", "http://localhost:8000")) do |conn|
        conn.options.timeout      = PARSE_TIMEOUT.to_i
        conn.options.open_timeout = 5
      end
    end

    def request_body
      {
        document_id: document.id,
        source_url:  document.file.url(expires_in: 10.minutes),
        mime_type:   document.mime_type,
        language:    document.subject.language || "mixed",
      }
    end

    def headers
      {
        "Content-Type" => "application/json",
        "Authorization" => "Bearer #{JsonWebTokenService.service_token(audience: 'python-parser')}",
      }
    end
  end
end
