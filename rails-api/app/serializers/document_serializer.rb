class DocumentSerializer < ApplicationSerializer
  def attributes
    {
      id: object.id,
      title: object.title,
      status: object.status,
      mime_type: object.mime_type,
      page_count: object.page_count,
      subject_id: object.subject_id,
      sha256_hex: object.sha256&.unpack1("H*"),
      byte_size: object.file.attached? ? object.file.byte_size : nil,
      error_msg: object.error_msg,
      ready_at: object.ready_at&.iso8601,
      created_at: object.created_at.iso8601,
      updated_at: object.updated_at.iso8601,
    }
  end
end
