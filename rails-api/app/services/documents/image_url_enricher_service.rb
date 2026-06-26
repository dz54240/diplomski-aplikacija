module Documents
  # Image keys were uploaded by python-parser directly to S3 (not via Active
  # Storage), so we presign them through the underlying S3 service.
  class ImageUrlEnricherService
    DEFAULT_TTL = 5.minutes

    def initialize(parsed, ttl: DEFAULT_TTL)
      @parsed = parsed
      @ttl = ttl
    end

    def call
      blocks = @parsed["blocks"]
      return @parsed unless blocks.is_a?(Array)

      blocks.each do |b|
        next unless b.is_a?(Hash) && b["type"] == "figure" && b["image_id"].is_a?(String)
        b["image_url"] = presign(b["image_id"])
      end
      @parsed
    end

    private

    def presign(key)
      signer.presigned_url(:get_object, bucket: bucket, key: key, expires_in: @ttl.to_i)
    end

    def signer
      # ActiveStorage::Service::S3Service#client returns Aws::S3::Resource (high-level);
      # Presigner needs the underlying Aws::S3::Client, which is nested one level deeper.
      @signer ||= Aws::S3::Presigner.new(client: service.client.client)
    end

    def bucket
      service.bucket.name
    end

    def service
      ActiveStorage::Blob.service
    end
  end
end
