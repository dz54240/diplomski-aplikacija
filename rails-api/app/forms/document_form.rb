class DocumentForm < ApplicationForm
  MAX_BYTES = 50.megabytes

  attr_reader :existing_document

  validate :file_present_on_create
  validate :file_size_within_limit
  validate :file_mime_type_allowed
  validate :subject_accessible
  validate :not_duplicate

  def duplicate?
    @existing_document.present?
  end

  private

  def before_assign
    file = params[:file]
    if file.respond_to?(:read)
      @sha_bytes  = compute_sha256(file)
      @file_size  = file.size
      @existing_document = Document.find_by(user_id: current_user.id, sha256: @sha_bytes)
    end
    # :file — Active Storage `file=` setter would try to attach immediately;
    #         we attach manually in after_save instead.
    # :user_id — set explicitly in before_save to prevent spoofing.
    params.delete(:file)
    params.delete(:user_id)
  end

  def before_save
    record.user_id   = current_user.id if record.user_id.blank?
    record.sha256    = @sha_bytes      if @sha_bytes
    record.mime_type = @mime_type      if @mime_type
    record.status    = "uploaded"
    record.title = @original_filename if record.title.blank? && @original_filename
  end

  def after_save
    return unless @file_io
    record.file.attach(
      io: @file_io.tap(&:rewind),
      filename: @original_filename,
      content_type: @mime_type,
    )
  end

  def compute_sha256(io)
    digest = Digest::SHA256.new
    io.rewind
    while (chunk = io.read(65_536))
      digest.update(chunk)
    end
    io.rewind
    digest.digest  # binary 32 bytes — matches `bytea` column
  end

  # Validations — run before persist_record, so we capture file metadata here.
  # We cache the file object in ivars so before_assign (which runs inside the
  # transaction) can safely delete :file from params without losing the data.
  def file_present_on_create
    return unless record.new_record?
    file = params[:file]
    return if file.respond_to?(:read)
    errors.add(:file, "is required")
  end

  def file_size_within_limit
    file = params[:file]
    return unless file.respond_to?(:size)
    size = file.size
    return if size <= MAX_BYTES
    errors.add(:file, "file size #{(size.to_f / 1.megabyte).round(1)} MB exceeds 50 MB cap")
  end

  def file_mime_type_allowed
    file = params[:file]
    return unless file.respond_to?(:content_type)
    ct = file.content_type
    @mime_type           ||= ct
    @file_io             ||= file
    @original_filename   ||= file.original_filename
    return if Document::ALLOWED_MIME_TYPES.include?(ct)
    errors.add(:mime_type, "only application/pdf is allowed")
  end

  def subject_accessible
    sid = params[:subject_id]
    return if sid.blank?
    return if SubjectPolicy::Scope.new(current_user, Subject).resolve.exists?(id: sid)
    errors.add(:subject, "is not accessible")
  end

  def not_duplicate
    return unless @existing_document
    errors.add(:base, "Document already exists in your library: #{@existing_document.title}")
  end
end
