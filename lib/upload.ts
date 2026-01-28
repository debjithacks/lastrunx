import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Initialize S3 client (lazy loading to avoid errors when credentials are missing)
let s3Client: S3Client | null = null

function getS3Client(): S3Client {
  if (!s3Client) {
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      throw new Error('AWS credentials not configured')
    }

    s3Client = new S3Client({
      region: process.env.AWS_REGION || 'ap-south-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    })
  }
  return s3Client
}

export async function uploadToS3(
  file: Buffer,
  fileName: string,
  mimeType: string,
  folder: string = 'kyc'
): Promise<string> {
  const client = getS3Client()
  const bucket = process.env.AWS_S3_BUCKET || 'skillarena-uploads'
  const key = `${folder}/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`

  try {
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file,
        ContentType: mimeType,
        ACL: 'public-read', // Make files publicly accessible
      })
    )

    const fileUrl = `https://${bucket}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${key}`
    console.log(`✅ File uploaded to S3: ${fileUrl}`)
    return fileUrl
  } catch (error) {
    console.error('❌ S3 upload failed:', error)
    throw error
  }
}

export async function getPresignedUploadUrl(
  fileName: string,
  fileType: string,
  folder: string = 'kyc'
): Promise<{ uploadUrl: string; fileUrl: string; key: string }> {
  const client = getS3Client()
  const bucket = process.env.AWS_S3_BUCKET || 'skillarena-uploads'
  const key = `${folder}/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`

  try {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: fileType,
      ACL: 'public-read',
    })

    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 3600 }) // 1 hour
    const fileUrl = `https://${bucket}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${key}`

    return { uploadUrl, fileUrl, key }
  } catch (error) {
    console.error('❌ Failed to generate presigned URL:', error)
    throw error
  }
}

export async function deleteFromS3(fileUrl: string): Promise<void> {
  const client = getS3Client()
  const bucket = process.env.AWS_S3_BUCKET || 'skillarena-uploads'

  try {
    // Extract key from URL
    const url = new URL(fileUrl)
    const key = url.pathname.substring(1) // Remove leading /

    await client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    )

    console.log(`✅ File deleted from S3: ${fileUrl}`)
  } catch (error) {
    console.error('❌ S3 deletion failed:', error)
    throw error
  }
}

// Validate file type and size
export function validateFile(
  file: File | Buffer,
  allowedTypes: string[],
  maxSizeMB: number
): { valid: boolean; error?: string } {
  // Check file type
  const fileType = file instanceof File ? file.type : 'application/octet-stream'
  if (!allowedTypes.some(type => fileType.includes(type))) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
    }
  }

  // Check file size
  const fileSize = file instanceof File ? file.size : file.length
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (fileSize > maxSizeBytes) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${maxSizeMB}MB`,
    }
  }

  return { valid: true }
}

// Allowed file types for KYC documents
export const KYC_ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
export const KYC_MAX_SIZE_MB = 5
