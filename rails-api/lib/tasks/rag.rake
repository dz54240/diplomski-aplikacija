namespace :rag do
  desc "Re-run /ingest on a document that already has parsed_output (skips Marker)."
  task :re_ingest, [:document_id] => :environment do |_, args|
    document = Document.find(args[:document_id])
    abort "no parsed_output attached" unless document.parsed_output.attached?

    deleted = Chunk.where(document_id: document.id).delete_all
    puts "Deleted #{deleted} existing chunks."

    document.update!(status: "embedding", error_msg: nil)
    IngestDocumentJob.perform_later(document.id)
    puts "Enqueued IngestDocumentJob for #{document.id}."
  end
end
