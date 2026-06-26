class IngestDocumentJob < ApplicationJob
  queue_as :default

  def perform(document_id)
    document = Document.find(document_id)
    unless document.status == "embedding"
      raise "document #{document_id} not in 'embedding' state: #{document.status}"
    end

    Documents::IngestDispatchService.new.call(document)
    document.update!(status: "ready", ready_at: Time.current, error_msg: nil)
  rescue StandardError => e
    document&.update(status: "failed", error_msg: e.message.to_s.truncate(500))
    raise
  end
end
