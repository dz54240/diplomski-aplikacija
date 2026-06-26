import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const DEFAULT_TTL_SECONDS = 900;

let cachedClient: S3Client | null = null;

function getClient(): S3Client {
  if (cachedClient) return cachedClient;
  const endpoint = process.env.MINIO_ENDPOINT;
  const region = process.env.MINIO_REGION ?? 'us-east-1';
  const accessKeyId = process.env.MINIO_ROOT_USER;
  const secretAccessKey = process.env.MINIO_ROOT_PASSWORD;
  if (!endpoint) throw new Error('MINIO_ENDPOINT env not set');
  if (!accessKeyId || !secretAccessKey) {
    throw new Error('MINIO_ROOT_USER / MINIO_ROOT_PASSWORD env not set');
  }
  cachedClient = new S3Client({
    endpoint,
    region,
    forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey },
  });
  return cachedClient;
}

export async function presignImageUri(
  key: string | null,
  ttlSeconds: number = DEFAULT_TTL_SECONDS,
): Promise<string | null> {
  if (!key) return null;

  const bucket = process.env.MINIO_BUCKET;
  if (!bucket) throw new Error('MINIO_BUCKET env not set');

  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(key)) {
    throw new Error(
      `presignImageUri expects bare S3 key (not full URL); got: ${key}`,
    );
  }
  if (key.startsWith('/')) {
    throw new Error(
      `presignImageUri rejects keys with a leading slash; got: ${key}`,
    );
  }

  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const signed = await getSignedUrl(getClient(), command, {
    expiresIn: ttlSeconds,
  });
  return signed;
}
