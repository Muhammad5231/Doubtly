import { v2 as cloudinary } from 'cloudinary';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

// Check if Cloudinary is realistically configured (not empty, not demo string)
const rawUrl = process.env.CLOUDINARY_URL || '';
const isCloudinaryConfigured =
  rawUrl.length > 0 &&
  !rawUrl.includes('demo') &&
  !rawUrl.includes('123456789012345');

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloudinary_url: rawUrl,
  });
}

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

/**
 * Validates file buffer using known magic bytes signatures
 */
function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 4) return false;

  // PDF: %PDF (25 50 44 46)
  if (mimeType === 'application/pdf') {
    return (
      buffer[0] === 0x25 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x44 &&
      buffer[3] === 0x46
    );
  }

  // PNG: 89 50 4E 47
  if (mimeType === 'image/png') {
    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    );
  }

  // JPEG: FF D8 FF
  if (mimeType === 'image/jpeg') {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  // WEBP: RIFF....WEBP
  if (mimeType === 'image/webp') {
    if (buffer.length < 12) return false;
    const isRiff =
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46;
    const isWebp =
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50;
    return isRiff && isWebp;
  }

  return false;
}

export interface UploadResult {
  url: string;
  publicId: string;
  bytes: number;
  format: string;
}

async function saveToLocalStorage(
  fileBuffer: Buffer,
  originalFilename: string,
  mimeType: string,
  randomName: string
): Promise<UploadResult> {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  await fs.mkdir(uploadsDir, { recursive: true });

  let ext = path.extname(originalFilename).replace('.', '').toLowerCase();
  if (!ext) {
    if (mimeType === 'application/pdf') ext = 'pdf';
    else if (mimeType === 'image/jpeg') ext = 'jpg';
    else if (mimeType === 'image/png') ext = 'png';
    else if (mimeType === 'image/webp') ext = 'webp';
    else ext = 'bin';
  }

  const fileName = `${randomName}.${ext}`;
  const filePath = path.join(uploadsDir, fileName);
  await fs.writeFile(filePath, fileBuffer);

  return {
    url: `/uploads/${fileName}`,
    publicId: randomName,
    bytes: fileBuffer.length,
    format: ext,
  };
}

export async function uploadToCloudinary(
  fileBuffer: Buffer,
  originalFilename: string,
  mimeType: string
): Promise<UploadResult> {
  // 1. Size check
  if (fileBuffer.length > MAX_FILE_SIZE) {
    throw new Error('File exceeds maximum size limit of 25MB.');
  }

  // 2. MIME type check
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new Error(`Unsupported MIME type: ${mimeType}. Only PDF and common images are permitted.`);
  }

  // 3. Magic bytes check
  if (!validateMagicBytes(fileBuffer, mimeType)) {
    throw new Error('File signature verification failed: magic bytes mismatch with claimed MIME type.');
  }

  // 4. Generate random filename
  const randomName = `${crypto.randomUUID()}_${Date.now()}`;
  const isPdf = mimeType === 'application/pdf';
  const resourceType = isPdf ? 'raw' : 'image';

  // 5. If Cloudinary is configured, attempt upload
  if (isCloudinaryConfigured) {
    try {
      return await new Promise<UploadResult>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'doubtly_uploads',
            public_id: randomName,
            resource_type: resourceType,
            use_filename: false,
            unique_filename: true,
          },
          (error, result) => {
            if (error || !result) {
              reject(new Error(error?.message || 'Failed to upload asset to Cloudinary.'));
            } else {
              resolve({
                url: result.secure_url,
                publicId: result.public_id,
                bytes: result.bytes,
                format: result.format || (isPdf ? 'pdf' : 'bin'),
              });
            }
          }
        );

        uploadStream.end(fileBuffer);
      });
    } catch (err: any) {
      console.warn('Cloudinary upload failed, gracefully falling back to local disk storage:', err?.message || err);
    }
  }

  // 6. Resilient Local Storage Fallback
  return await saveToLocalStorage(fileBuffer, originalFilename, mimeType, randomName);
}

