import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// R2 is S3-compatible, so we use the AWS SDK
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME!;
const PUBLIC_URL = process.env.R2_PUBLIC_URL || '';

export interface UploadResult {
  key: string;
  url: string;
}

/**
 * Upload a file to R2 storage
 * @param file - The file buffer or Blob
 * @param key - The storage key (path/filename)
 * @param contentType - MIME type of the file
 * @returns The storage key and public URL
 */
export async function uploadToR2(
  file: Buffer | Uint8Array,
  key: string,
  contentType: string
): Promise<UploadResult> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
  });

  await r2Client.send(command);

  return {
    key,
    url: PUBLIC_URL ? `${PUBLIC_URL}/${key}` : key,
  };
}

/**
 * Generate a unique key for feedback photos
 * @param userId - The user's ID
 * @param filename - Original filename
 * @returns A unique storage key
 */
export function generateFeedbackPhotoKey(userId: string, filename: string): string {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `feedback/${userId}/${timestamp}-${sanitizedFilename}`;
}

export { r2Client, BUCKET_NAME };
