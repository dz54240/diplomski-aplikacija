module Documents
  class ParsedOutputStorageService
    def initialize(document, parsed)
      @document = document
      @parsed   = parsed
    end

    def call
      ActiveRecord::Base.transaction do
        @document.parsed_output.attach(
          io: StringIO.new(@parsed.to_json),
          filename: "parsed_outputs/#{@document.id}.json",
          content_type: "application/json",
        )
        @document.update!(page_count: @parsed[:pages])
      end
      FormResult.success(@document)
    rescue StandardError => e
      FormResult.failure([e.message])
    end
  end
end
