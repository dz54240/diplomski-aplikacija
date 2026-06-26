class ProcessDocumentJob < ApplicationJob
  queue_as :default
  retry_on Faraday::Error, attempts: 3, wait: :polynomially_longer

  def perform(document_id)
    document = Document.find(document_id)
    return if document.terminal?

    document.update!(status: "parsing")
    result = Documents::ParseDispatchService.new(document).call

    if result.success?
      Documents::ParsedOutputStorageService.new(document, result.record).call
      document.update!(status: "embedding", error_msg: nil)
      IngestDocumentJob.perform_later(document.id)
    else
      document.update!(status: "failed", error_msg: result.errors.first.to_s.truncate(500))
    end
  rescue StandardError => e
    Document.find(document_id).update!(status: "failed", error_msg: "#{e.class.name}: #{e.message}".truncate(500))
    raise
  end
end
